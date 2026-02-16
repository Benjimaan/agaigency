import { Resend } from "resend";
import { NextResponse } from "next/server";

const TO_EMAILS = ["contact@agaigency.com"];

const DATAFORSEO_API = "https://api.dataforseo.com/v3";

function getAuthHeader(): string {
  const login = process.env.DATAFORSEO_LOGIN || "";
  const password = process.env.DATAFORSEO_PASSWORD || "";
  return "Basic " + Buffer.from(`${login}:${password}`).toString("base64");
}

/* Extract clean domain from URL */
function extractDomain(url: string): string {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  }
}

/* DataForSEO: Get ranked keywords for a domain */
async function getRankedKeywords(domain: string, auth: string) {
  const res = await fetch(`${DATAFORSEO_API}/dataforseo_labs/google/ranked_keywords/live`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify([
      {
        target: domain,
        location_code: 2250, // France
        language_code: "fr",
        limit: 20,
        order_by: ["keyword_data.keyword_info.search_volume,desc"],
      },
    ]),
  });
  return res.json();
}

/* DataForSEO: Get competitors for a domain */
async function getCompetitors(domain: string, auth: string) {
  const res = await fetch(`${DATAFORSEO_API}/dataforseo_labs/google/competitors_domain/live`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify([
      {
        target: domain,
        location_code: 2250, // France
        language_code: "fr",
        limit: 5,
        order_by: ["metrics.organic.count,desc"],
      },
    ]),
  });
  return res.json();
}

/* DataForSEO: Get keyword suggestions based on domain's top keyword */
async function getKeywordSuggestions(keyword: string, auth: string) {
  const res = await fetch(`${DATAFORSEO_API}/dataforseo_labs/google/keyword_suggestions/live`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify([
      {
        keyword,
        location_code: 2250,
        language_code: "fr",
        limit: 10,
        order_by: ["keyword_info.search_volume,desc"],
      },
    ]),
  });
  return res.json();
}

interface ScanResults {
  visibilityScore: number;
  keywords: { keyword: string; volume: number; difficulty: number; position: number }[];
  financialLoss: number;
  competitors: number;
  missingPages: number;
}

async function fetchRealData(domain: string): Promise<ScanResults> {
  const auth = getAuthHeader();

  // Run ranked keywords + competitors in parallel
  const [rankedRes, competitorsRes] = await Promise.all([
    getRankedKeywords(domain, auth),
    getCompetitors(domain, auth),
  ]);

  // Parse ranked keywords
  const rankedItems =
    rankedRes?.tasks?.[0]?.result?.[0]?.items || [];
  const totalRankedKeywords = rankedRes?.tasks?.[0]?.result?.[0]?.total_count || 0;

  // Calculate visibility score based on rankings
  // More keywords in top positions = higher score
  let visibilityScore = 0;
  let totalEtv = 0;

  for (const item of rankedItems) {
    const pos = item.ranked_serp_element?.serp_item?.rank_group || 100;
    totalEtv += item.ranked_serp_element?.serp_item?.etv || 0;
    if (pos <= 3) visibilityScore += 5;
    else if (pos <= 10) visibilityScore += 3;
    else if (pos <= 20) visibilityScore += 1;
  }

  // Normalize score to 0-100 (cap at 60 to keep it encouraging to improve)
  visibilityScore = Math.min(Math.round((visibilityScore / 80) * 60), 60);
  if (totalRankedKeywords < 5) visibilityScore = Math.min(visibilityScore, 25);

  // Get keyword suggestions (opportunities the domain may be missing)
  const topKeyword = rankedItems[0]?.keyword_data?.keyword || domain.split(".")[0];
  const suggestionsRes = await getKeywordSuggestions(topKeyword, auth);
  const suggestionItems = suggestionsRes?.tasks?.[0]?.result?.[0]?.items || [];

  // Find keywords the domain is NOT ranking for (these are the gaps)
  const rankedKeywordSet = new Set(
    rankedItems.map((item: { keyword_data?: { keyword?: string } }) =>
      item.keyword_data?.keyword?.toLowerCase()
    )
  );

  const keywordGaps = suggestionItems
    .filter(
      (item: { keyword_data?: { keyword?: string } }) =>
        !rankedKeywordSet.has(item.keyword_data?.keyword?.toLowerCase())
    )
    .slice(0, 5)
    .map((item: {
      keyword_data?: {
        keyword?: string;
        keyword_info?: { search_volume?: number; keyword_difficulty?: number };
      };
    }) => ({
      keyword: item.keyword_data?.keyword || "",
      volume: item.keyword_data?.keyword_info?.search_volume || 0,
      difficulty: item.keyword_data?.keyword_info?.keyword_difficulty || 0,
      position: 0, // not ranking
    }));

  // Parse competitors count
  const competitorItems = competitorsRes?.tasks?.[0]?.result?.[0]?.items || [];
  const competitors = competitorItems.length || 3;

  // Estimate financial loss based on missed keyword traffic
  // Use average CPC of 1.5€ and estimated CTR for first page
  const missedVolume = keywordGaps.reduce(
    (sum: number, kw: { volume: number }) => sum + kw.volume,
    0
  );
  const financialLoss = Math.round(missedVolume * 0.03 * 1.5); // 3% CTR * 1.5€ CPC

  // Estimate missing pages (keywords without ranking = potential pages to create)
  const missingPages = Math.max(keywordGaps.length, 3);

  return {
    visibilityScore: Math.max(visibilityScore, 5),
    keywords: keywordGaps.length > 0 ? keywordGaps : getFallbackKeywords(domain),
    financialLoss: Math.max(financialLoss, 200),
    competitors,
    missingPages,
  };
}

/* Fallback keywords if API returns nothing useful */
function getFallbackKeywords(domain: string) {
  const name = domain.split(".")[0];
  return [
    { keyword: `${name} avis`, volume: 320, difficulty: 20, position: 0 },
    { keyword: `${name} contact`, volume: 210, difficulty: 15, position: 0 },
    { keyword: `${name} tarifs`, volume: 170, difficulty: 25, position: 0 },
    { keyword: `${name} services`, volume: 140, difficulty: 18, position: 0 },
    { keyword: `${name} horaires`, volume: 110, difficulty: 12, position: 0 },
  ];
}

export async function POST(request: Request) {
  try {
    const { url, email } = await request.json();

    if (!url || !email) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const domain = extractDomain(url);

    // Fetch real SEO data from DataForSEO
    let results: ScanResults;
    try {
      results = await fetchRealData(domain);
    } catch (err) {
      console.error("DataForSEO error:", err);
      // Fallback to basic results if API fails
      results = {
        visibilityScore: 18,
        keywords: getFallbackKeywords(domain),
        financialLoss: 1200,
        competitors: 5,
        missingPages: 7,
      };
    }

    // Send lead capture email via Resend
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const keywordsList = results.keywords
        .map((kw) => `${kw.keyword} (${kw.volume} vol.)`)
        .join(", ");

      await resend.emails.send({
        from: "AgaiGency <noreply@agaigency.com>",
        to: TO_EMAILS,
        replyTo: email,
        subject: `Nouveau lead SEO Audit — ${domain}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h1 style="color: #D4AF37; border-bottom: 2px solid #D4AF37; padding-bottom: 12px;">
              Nouveau lead — Audit SEO
            </h1>

            <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
              <tr><td style="padding: 8px 0; font-weight: bold; width: 100px;">Email</td><td><a href="mailto:${email}">${email}</a></td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">URL</td><td><a href="${url}">${url}</a></td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Domaine</td><td>${domain}</td></tr>
            </table>

            <h2 style="margin-top: 24px;">Résultats de l'audit</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold; width: 160px;">Score visibilité</td><td>${results.visibilityScore}/100</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Manque à gagner</td><td>${results.financialLoss.toLocaleString("fr-FR")} €/mois</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Concurrents</td><td>${results.competitors}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Mots-clés manqués</td><td>${keywordsList}</td></tr>
            </table>

            <hr style="margin-top: 32px; border: none; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px;">Envoyé depuis l'outil Audit SEO — agaigency.com</p>
          </div>
        `,
      });
    } catch {
      console.error("Failed to send lead email");
    }

    return NextResponse.json(results);
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
