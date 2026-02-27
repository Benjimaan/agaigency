import { Resend } from "resend";
import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

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

/* Normalize URL to ensure it has a protocol */
function normalizeUrl(url: string): string {
  if (!url.startsWith("http")) return `https://${url}`;
  return url;
}

/* ─── On-Page Scraping (Cheerio) ────────────────────── */

interface OnPageData {
  title: { text: string; length: number; status: "good" | "warning" | "error" };
  metaDescription: { text: string; length: number; status: "good" | "warning" | "error" };
  h1: { text: string; count: number; status: "good" | "warning" | "error" };
  h2Count: number;
  images: { total: number; withoutAlt: number };
  hasViewport: boolean;
  hasCanonical: boolean;
  hasOpenGraph: boolean;
  technicalScore: number;
}

async function scrapeOnPage(url: string): Promise<OnPageData> {
  const normalizedUrl = normalizeUrl(url);
  const response = await fetch(normalizedUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; AgaiGencyBot/1.0; +https://agaigency.com)",
      Accept: "text/html",
    },
    signal: AbortSignal.timeout(8000),
  });

  const html = await response.text();
  const $ = cheerio.load(html);

  // Title
  const titleText = $("title").first().text().trim();
  const titleLength = titleText.length;
  let titleStatus: "good" | "warning" | "error" = "good";
  if (titleLength === 0) titleStatus = "error";
  else if (titleLength < 30 || titleLength > 60) titleStatus = "warning";

  // Meta Description
  const metaDescText = $('meta[name="description"]').attr("content")?.trim() || "";
  const metaDescLength = metaDescText.length;
  let metaDescStatus: "good" | "warning" | "error" = "good";
  if (metaDescLength === 0) metaDescStatus = "error";
  else if (metaDescLength < 70 || metaDescLength > 160) metaDescStatus = "warning";

  // H1
  const h1Elements = $("h1");
  const h1Text = h1Elements.first().text().trim();
  const h1Count = h1Elements.length;
  let h1Status: "good" | "warning" | "error" = "good";
  if (h1Count === 0) h1Status = "error";
  else if (h1Count > 1) h1Status = "warning";

  // H2
  const h2Count = $("h2").length;

  // Images
  const imgElements = $("img");
  const totalImages = imgElements.length;
  let withoutAlt = 0;
  imgElements.each((_, el) => {
    const alt = $(el).attr("alt")?.trim();
    if (!alt) withoutAlt++;
  });

  // Viewport meta (mobile-friendly)
  const hasViewport = $('meta[name="viewport"]').length > 0;

  // Canonical
  const hasCanonical = $('link[rel="canonical"]').length > 0;

  // Open Graph
  const hasOpenGraph = $('meta[property="og:title"]').length > 0;

  // Calculate technical score (0-100)
  let technicalScore = 0;

  // Title: 20 pts
  if (titleStatus === "good") technicalScore += 20;
  else if (titleStatus === "warning") technicalScore += 10;

  // Meta Description: 20 pts
  if (metaDescStatus === "good") technicalScore += 20;
  else if (metaDescStatus === "warning") technicalScore += 10;

  // H1: 25 pts (critical)
  if (h1Status === "good") technicalScore += 25;
  else if (h1Status === "warning") technicalScore += 12;

  // H2 structure: 10 pts
  if (h2Count >= 3) technicalScore += 10;
  else if (h2Count >= 1) technicalScore += 5;

  // Images alt: 10 pts
  if (totalImages > 0) {
    const altRatio = (totalImages - withoutAlt) / totalImages;
    technicalScore += Math.round(altRatio * 10);
  } else {
    technicalScore += 10; // No images = no issue
  }

  // Viewport: 5 pts
  if (hasViewport) technicalScore += 5;

  // Canonical: 5 pts
  if (hasCanonical) technicalScore += 5;

  // Open Graph: 5 pts
  if (hasOpenGraph) technicalScore += 5;

  return {
    title: { text: titleText, length: titleLength, status: titleStatus },
    metaDescription: { text: metaDescText, length: metaDescLength, status: metaDescStatus },
    h1: { text: h1Text, count: h1Count, status: h1Status },
    h2Count,
    images: { total: totalImages, withoutAlt },
    hasViewport,
    hasCanonical,
    hasOpenGraph,
    technicalScore,
  };
}

/* Fallback on-page data if scraping fails */
function getOnPageFallback(): OnPageData {
  return {
    title: { text: "", length: 0, status: "error" },
    metaDescription: { text: "", length: 0, status: "error" },
    h1: { text: "", count: 0, status: "error" },
    h2Count: 0,
    images: { total: 0, withoutAlt: 0 },
    hasViewport: false,
    hasCanonical: false,
    hasOpenGraph: false,
    technicalScore: 0,
  };
}

/* ─── DataForSEO (unchanged) ───────────────────────── */

async function getRankedKeywords(domain: string, auth: string) {
  const res = await fetch(`${DATAFORSEO_API}/dataforseo_labs/google/ranked_keywords/live`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify([
      {
        target: domain,
        location_code: 2250,
        language_code: "fr",
        limit: 20,
        order_by: ["keyword_data.keyword_info.search_volume,desc"],
      },
    ]),
  });
  return res.json();
}

async function getCompetitors(domain: string, auth: string) {
  const res = await fetch(`${DATAFORSEO_API}/dataforseo_labs/google/competitors_domain/live`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify([
      {
        target: domain,
        location_code: 2250,
        language_code: "fr",
        limit: 5,
        order_by: ["metrics.organic.count,desc"],
      },
    ]),
  });
  return res.json();
}

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

/* ─── Interfaces ───────────────────────────────────── */

interface PositioningData {
  positioningScore: number;
  keywords: { keyword: string; volume: number; difficulty: number; position: number }[];
  financialLoss: number;
  competitors: number;
  missingPages: number;
}

interface ScanResults {
  visibilityScore: number;
  positioningScore: number;
  technicalScore: number;
  keywords: { keyword: string; volume: number; difficulty: number; position: number }[];
  financialLoss: number;
  competitors: number;
  missingPages: number;
  onPageData: OnPageData;
}

/* ─── DataForSEO Data Fetcher ──────────────────────── */

async function fetchPositioningData(domain: string): Promise<PositioningData> {
  const auth = getAuthHeader();

  const [rankedRes, competitorsRes] = await Promise.all([
    getRankedKeywords(domain, auth),
    getCompetitors(domain, auth),
  ]);

  const rankedItems = rankedRes?.tasks?.[0]?.result?.[0]?.items || [];
  const totalRankedKeywords = rankedRes?.tasks?.[0]?.result?.[0]?.total_count || 0;

  // Calculate positioning score based on rankings
  let positioningScore = 0;

  for (const item of rankedItems) {
    const pos = item.ranked_serp_element?.serp_item?.rank_group || 100;
    if (pos <= 3) positioningScore += 5;
    else if (pos <= 10) positioningScore += 3;
    else if (pos <= 20) positioningScore += 1;
  }

  positioningScore = Math.min(Math.round((positioningScore / 80) * 100), 100);
  if (totalRankedKeywords < 5) positioningScore = Math.min(positioningScore, 35);

  // Keyword suggestions (gaps)
  const topKeyword = rankedItems[0]?.keyword_data?.keyword || domain.split(".")[0];
  const suggestionsRes = await getKeywordSuggestions(topKeyword, auth);
  const suggestionItems = suggestionsRes?.tasks?.[0]?.result?.[0]?.items || [];

  const rankedKeywordSet = new Set(
    rankedItems.map((item: { keyword_data?: { keyword?: string } }) =>
      item.keyword_data?.keyword?.toLowerCase()
    )
  );

  const keywordGaps = suggestionItems
    .filter(
      (item: { keyword_data?: { keyword?: string }; keyword?: string }) => {
        const kw = item.keyword_data?.keyword || item.keyword;
        return kw && !rankedKeywordSet.has(kw.toLowerCase());
      }
    )
    .slice(0, 3)
    .map((item: {
      keyword_data?: {
        keyword?: string;
        keyword_info?: { search_volume?: number; keyword_difficulty?: number };
      };
      keyword?: string;
      keyword_info?: { search_volume?: number; keyword_difficulty?: number };
      search_volume?: number;
      keyword_difficulty?: number;
    }) => ({
      keyword: item.keyword_data?.keyword || item.keyword || "",
      volume: item.keyword_data?.keyword_info?.search_volume || item.keyword_info?.search_volume || item.search_volume || 0,
      difficulty: item.keyword_data?.keyword_info?.keyword_difficulty || item.keyword_info?.keyword_difficulty || item.keyword_difficulty || 0,
      position: 0,
    }));

  const competitorItems = competitorsRes?.tasks?.[0]?.result?.[0]?.items || [];
  const competitors = competitorItems.length || 3;

  const missedVolume = keywordGaps.reduce(
    (sum: number, kw: { volume: number }) => sum + kw.volume,
    0
  );
  const financialLoss = Math.max(Math.round(missedVolume * 0.05 * 2), 350);
  const missingPages = Math.max(keywordGaps.length, 3);

  return {
    positioningScore: Math.max(positioningScore, 5),
    keywords: keywordGaps.length > 0 ? keywordGaps : getFallbackKeywords(domain),
    financialLoss,
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

/* ─── Combined score ───────────────────────────────── */

function computeGlobalScore(positioningScore: number, technicalScore: number): number {
  // Weighted average: 50% positioning + 50% technical
  return Math.round(positioningScore * 0.5 + technicalScore * 0.5);
}

/* ─── POST Handler ─────────────────────────────────── */

export async function POST(request: Request) {
  try {
    const { url, email } = await request.json();

    if (!url || !email) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const domain = extractDomain(url);

    // Run HTML scraping + DataForSEO in PARALLEL
    const [onPageData, positioningData] = await Promise.all([
      scrapeOnPage(url).catch((err) => {
        console.error("Scraping error:", err);
        return getOnPageFallback();
      }),
      fetchPositioningData(domain).catch((err) => {
        console.error("DataForSEO error:", err);
        return {
          positioningScore: 15,
          keywords: getFallbackKeywords(domain),
          financialLoss: 1200,
          competitors: 5,
          missingPages: 7,
        } as PositioningData;
      }),
    ]);

    const visibilityScore = computeGlobalScore(
      positioningData.positioningScore,
      onPageData.technicalScore
    );

    const results: ScanResults = {
      visibilityScore,
      positioningScore: positioningData.positioningScore,
      technicalScore: onPageData.technicalScore,
      keywords: positioningData.keywords,
      financialLoss: positioningData.financialLoss,
      competitors: positioningData.competitors,
      missingPages: positioningData.missingPages,
      onPageData,
    };

    // Send lead capture email via Resend
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const keywordsList = results.keywords
        .map((kw) => `${kw.keyword} (${kw.volume} vol.)`)
        .join(", ");

      const titleInfo = onPageData.title.text
        ? `${onPageData.title.text} (${onPageData.title.length} car. — ${onPageData.title.status})`
        : "ABSENT ❌";
      const metaInfo = onPageData.metaDescription.text
        ? `${onPageData.metaDescription.text.slice(0, 80)}... (${onPageData.metaDescription.length} car. — ${onPageData.metaDescription.status})`
        : "ABSENT ❌";
      const h1Info = onPageData.h1.text
        ? `${onPageData.h1.text} (${onPageData.h1.count} H1 — ${onPageData.h1.status})`
        : "ABSENT ❌";

      await resend.emails.send({
        from: "AgaiGency <noreply@agaigency.com>",
        to: TO_EMAILS,
        replyTo: email,
        subject: `Nouveau lead SEO Audit — ${domain} (${visibilityScore}/100)`,
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

            <h2 style="margin-top: 24px;">Scores</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold; width: 160px;">Score global</td><td><strong>${visibilityScore}/100</strong></td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Positionnement</td><td>${positioningData.positioningScore}/100</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Technique On-Page</td><td>${onPageData.technicalScore}/100</td></tr>
            </table>

            <h2 style="margin-top: 24px;">Audit On-Page</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold; width: 160px;">Title</td><td>${titleInfo}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Meta Description</td><td>${metaInfo}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">H1</td><td>${h1Info}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Balises H2</td><td>${onPageData.h2Count}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Images sans alt</td><td>${onPageData.images.withoutAlt} / ${onPageData.images.total}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Viewport</td><td>${onPageData.hasViewport ? "✅" : "❌"}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Canonical</td><td>${onPageData.hasCanonical ? "✅" : "❌"}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Open Graph</td><td>${onPageData.hasOpenGraph ? "✅" : "❌"}</td></tr>
            </table>

            <h2 style="margin-top: 24px;">Positionnement</h2>
            <table style="width: 100%; border-collapse: collapse;">
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
