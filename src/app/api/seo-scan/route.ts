import { Resend } from "resend";
import { NextResponse } from "next/server";

const TO_EMAILS = ["contact@agaigency.com"];

/* Simple hash to generate consistent mock data per URL */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function generateMockData(url: string) {
  const h = hashCode(url);

  const visibilityScore = 15 + (h % 28); // 15-42

  const keywordPools = [
    { keyword: "agence web", volume: 12100, difficulty: 72 },
    { keyword: "création site internet", volume: 8100, difficulty: 65 },
    { keyword: "refonte site web", volume: 3600, difficulty: 58 },
    { keyword: "développeur freelance", volume: 6600, difficulty: 45 },
    { keyword: "site e-commerce", volume: 9900, difficulty: 70 },
    { keyword: "design UI/UX", volume: 4400, difficulty: 52 },
    { keyword: "SEO local", volume: 5400, difficulty: 48 },
    { keyword: "application web sur mesure", volume: 2900, difficulty: 38 },
    { keyword: "landing page", volume: 14800, difficulty: 55 },
    { keyword: "site vitrine professionnel", volume: 7200, difficulty: 60 },
    { keyword: "consultant digital", volume: 3100, difficulty: 42 },
    { keyword: "marketing digital", volume: 18100, difficulty: 78 },
    { keyword: "stratégie web", volume: 2400, difficulty: 35 },
    { keyword: "optimisation conversion", volume: 1900, difficulty: 40 },
    { keyword: "webdesign moderne", volume: 3300, difficulty: 50 },
  ];

  const startIdx = h % (keywordPools.length - 5);
  const keywords = keywordPools.slice(startIdx, startIdx + 5).map((kw) => ({
    ...kw,
    position: 20 + (h % 80), // competitor position 20-99
  }));

  const financialLoss = 850 + ((h % 34) * 100); // 850-4250 €/mois
  const competitors = 3 + (h % 6); // 3-8
  const missingPages = 4 + (h % 9); // 4-12

  return { visibilityScore, keywords, financialLoss, competitors, missingPages };
}

export async function POST(request: Request) {
  try {
    const { url, email } = await request.json();

    if (!url || !email) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Generate mock results
    const results = generateMockData(url);

    // Send lead capture email via Resend
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "AgaiGency <noreply@agaigency.com>",
        to: TO_EMAILS,
        replyTo: email,
        subject: `Nouveau lead SEO Audit — ${url}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h1 style="color: #D4AF37; border-bottom: 2px solid #D4AF37; padding-bottom: 12px;">
              Nouveau lead — Audit SEO
            </h1>

            <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
              <tr><td style="padding: 8px 0; font-weight: bold; width: 100px;">Email</td><td><a href="mailto:${email}">${email}</a></td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">URL</td><td><a href="${url}">${url}</a></td></tr>
            </table>

            <h2 style="margin-top: 24px;">Résultats simulés</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold; width: 160px;">Score visibilité</td><td>${results.visibilityScore}/100</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Manque à gagner</td><td>${results.financialLoss.toLocaleString("fr-FR")} €/mois</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Concurrents</td><td>${results.competitors}</td></tr>
            </table>

            <hr style="margin-top: 32px; border: none; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px;">Envoyé depuis l'outil Audit SEO — agaigency.com</p>
          </div>
        `,
      });
    } catch {
      // Don't block results if email fails
      console.error("Failed to send lead email");
    }

    return NextResponse.json(results);
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
