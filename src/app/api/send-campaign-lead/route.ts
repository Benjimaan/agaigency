import { Resend } from "resend";
import { NextResponse } from "next/server";

const TO_EMAILS = ["contact@agaigency.com"];

export async function POST(request: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const {
      clientName,
      clientEmail,
      clientActivity,
      clientWebsite,
      clientType,
      objective,
      campaignType,
      monthlyBudget,
      estimatedClicks,
      estimatedLeads,
      costPerLead,
      cpc,
    } = await request.json();

    if (!clientName || !clientEmail) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const typeLabels: Record<string, string> = {
      local: "Commerce local / TPE",
      pme: "PME / E-commerce",
      liberal: "Profession libérale",
      startup: "Startup / SaaS",
      other: "Autre",
    };

    const objectiveLabels: Record<string, string> = {
      leads: "Recevoir plus de demandes",
      traffic: "Attirer plus de visiteurs",
      sales: "Augmenter les ventes en ligne",
      awareness: "Notoriété de marque",
      local: "Attirer des clients en magasin",
    };

    const campaignLabels: Record<string, string> = {
      search: "Réseau de Recherche (Google)",
      display: "Réseau Display (bannières)",
      shopping: "Google Shopping",
      pmax: "Performance Max (tous canaux)",
      video: "Vidéo YouTube",
    };

    // 1. Internal lead email to AgaiGency
    await resend.emails.send({
      from: "AgaiGency <noreply@agaigency.com>",
      to: TO_EMAILS,
      replyTo: clientEmail,
      subject: `🎯 Nouveau lead Google Ads — ${clientName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fafafa; padding: 32px; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #D4AF37, #E8D48B); color: #0a0a0a; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;">
              Nouveau lead — Simulateur Google Ads
            </div>
          </div>

          <h1 style="color: #D4AF37; font-size: 22px; margin: 0 0 24px; text-align: center;">
            ${clientName} veut lancer Google Ads
          </h1>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr style="border-bottom: 1px solid #262626;">
              <td style="padding: 12px 0; color: #808080; font-size: 13px; width: 140px;">Entreprise</td>
              <td style="padding: 12px 0; font-weight: 600;">${clientName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #262626;">
              <td style="padding: 12px 0; color: #808080; font-size: 13px;">Email</td>
              <td style="padding: 12px 0;"><a href="mailto:${clientEmail}" style="color: #D4AF37; text-decoration: none;">${clientEmail}</a></td>
            </tr>
            <tr style="border-bottom: 1px solid #262626;">
              <td style="padding: 12px 0; color: #808080; font-size: 13px;">Activité</td>
              <td style="padding: 12px 0;">${clientActivity || "—"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #262626;">
              <td style="padding: 12px 0; color: #808080; font-size: 13px;">Site web</td>
              <td style="padding: 12px 0;"><a href="${clientWebsite?.startsWith("http") ? clientWebsite : `https://${clientWebsite}`}" style="color: #D4AF37; text-decoration: none;">${clientWebsite || "—"}</a></td>
            </tr>
            <tr style="border-bottom: 1px solid #262626;">
              <td style="padding: 12px 0; color: #808080; font-size: 13px;">Secteur</td>
              <td style="padding: 12px 0;">${typeLabels[clientType] || clientType}</td>
            </tr>
          </table>

          <h2 style="color: #D4AF37; font-size: 16px; margin: 0 0 16px;">Stratégie choisie</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr style="border-bottom: 1px solid #262626;">
              <td style="padding: 12px 0; color: #808080; font-size: 13px; width: 140px;">Objectif</td>
              <td style="padding: 12px 0; font-weight: 600;">${objectiveLabels[objective] || objective}</td>
            </tr>
            <tr style="border-bottom: 1px solid #262626;">
              <td style="padding: 12px 0; color: #808080; font-size: 13px;">Type de campagne</td>
              <td style="padding: 12px 0;">${campaignLabels[campaignType] || campaignType}</td>
            </tr>
          </table>

          <h2 style="color: #D4AF37; font-size: 16px; margin: 0 0 16px;">Budget & estimations</h2>
          <div style="display: flex; gap: 12px; margin-bottom: 16px;">
            <div style="flex: 1; background: #141414; border: 1px solid #262626; border-radius: 12px; padding: 16px; text-align: center;">
              <div style="font-size: 24px; font-weight: 800; color: #fafafa;">${monthlyBudget}€</div>
              <div style="font-size: 11px; color: #808080; margin-top: 4px;">Budget/mois</div>
            </div>
            <div style="flex: 1; background: #141414; border: 1px solid #262626; border-radius: 12px; padding: 16px; text-align: center;">
              <div style="font-size: 24px; font-weight: 800; color: #fafafa;">~${estimatedClicks}</div>
              <div style="font-size: 11px; color: #808080; margin-top: 4px;">Visiteurs/mois</div>
            </div>
          </div>
          <div style="display: flex; gap: 12px;">
            <div style="flex: 1; background: #141414; border: 1px solid #262626; border-radius: 12px; padding: 16px; text-align: center;">
              <div style="font-size: 24px; font-weight: 800; color: #D4AF37;">~${estimatedLeads}</div>
              <div style="font-size: 11px; color: #808080; margin-top: 4px;">Prospects/mois</div>
            </div>
            <div style="flex: 1; background: #141414; border: 1px solid #262626; border-radius: 12px; padding: 16px; text-align: center;">
              <div style="font-size: 24px; font-weight: 800; color: #4ade80;">${costPerLead}€</div>
              <div style="font-size: 11px; color: #808080; margin-top: 4px;">Coût/prospect</div>
            </div>
          </div>

          <div style="margin-top: 32px; padding: 16px; background: #141414; border: 1px solid #D4AF37; border-radius: 12px; text-align: center;">
            <div style="font-size: 14px; font-weight: 700; color: #D4AF37; margin-bottom: 4px;">Action requise</div>
            <div style="font-size: 13px; color: #808080;">Ce prospect attend un appel stratégique. Contactez-le rapidement.</div>
          </div>

          <div style="margin-top: 24px; text-align: center;">
            <a href="mailto:${clientEmail}?subject=Votre stratégie Google Ads — AgaiGency&body=Bonjour ${clientName},%0A%0ASuite à votre simulation Google Ads sur notre site, je vous propose un créneau pour en discuter.%0A%0ACordialement,%0ABenjamin — AgaiGency" style="display: inline-block; background: #D4AF37; color: #0a0a0a; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px;">
              Répondre à ${clientName}
            </a>
          </div>

          <p style="margin-top: 24px; text-align: center; font-size: 11px; color: #808080;">
            Lead capturé depuis le Simulateur Google Ads — agaigency.com
          </p>
        </div>
      `,
    });

    // 2. Confirmation email to the prospect
    await resend.emails.send({
      from: "AgaiGency <noreply@agaigency.com>",
      to: [clientEmail],
      subject: `Votre estimation Google Ads — ${clientName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fafafa; padding: 32px; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="font-size: 28px; font-weight: 800; color: #D4AF37;">AgaiGency</div>
            <div style="font-size: 12px; color: #808080; letter-spacing: 0.1em; text-transform: uppercase;">Agence Digitale Premium</div>
          </div>

          <h1 style="font-size: 22px; text-align: center; margin: 0 0 8px;">
            Bonjour ${clientName} 👋
          </h1>
          <p style="text-align: center; color: #808080; font-size: 14px; margin: 0 0 32px;">
            Voici le récapitulatif de votre simulation Google Ads.
          </p>

          <div style="background: #141414; border: 1px solid #262626; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <h2 style="color: #D4AF37; font-size: 16px; margin: 0 0 16px;">Votre stratégie</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #262626;">
                <td style="padding: 10px 0; color: #808080; font-size: 13px;">Objectif</td>
                <td style="padding: 10px 0; font-weight: 600; text-align: right;">${objectiveLabels[objective] || objective}</td>
              </tr>
              <tr style="border-bottom: 1px solid #262626;">
                <td style="padding: 10px 0; color: #808080; font-size: 13px;">Format</td>
                <td style="padding: 10px 0; font-weight: 600; text-align: right;">${campaignLabels[campaignType] || campaignType}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #808080; font-size: 13px;">Budget mensuel</td>
                <td style="padding: 10px 0; font-weight: 600; text-align: right;">${monthlyBudget}€/mois</td>
              </tr>
            </table>
          </div>

          <div style="background: #141414; border: 1px solid #D4AF37; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <h2 style="color: #D4AF37; font-size: 16px; margin: 0 0 16px; text-align: center;">Résultats estimés par mois</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #262626;">
                <td style="padding: 10px 0; color: #808080; font-size: 13px;">Coût par clic</td>
                <td style="padding: 10px 0; font-weight: 800; text-align: right; font-size: 18px;">~${cpc}€</td>
              </tr>
              <tr style="border-bottom: 1px solid #262626;">
                <td style="padding: 10px 0; color: #808080; font-size: 13px;">Visiteurs sur votre site</td>
                <td style="padding: 10px 0; font-weight: 800; text-align: right; font-size: 18px;">~${estimatedClicks}</td>
              </tr>
              <tr style="border-bottom: 1px solid #262626;">
                <td style="padding: 10px 0; color: #808080; font-size: 13px;">Clients potentiels</td>
                <td style="padding: 10px 0; font-weight: 800; text-align: right; font-size: 18px; color: #D4AF37;">~${estimatedLeads}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #808080; font-size: 13px;">Coût par prospect</td>
                <td style="padding: 10px 0; font-weight: 800; text-align: right; font-size: 18px; color: #4ade80;">${costPerLead}€</td>
              </tr>
            </table>
          </div>

          <p style="font-size: 11px; color: #808080; text-align: center; margin-bottom: 24px;">
            Ces estimations sont basées sur les moyennes de votre secteur. Un accompagnement sur mesure permet d'optimiser ces résultats.
          </p>

          <div style="text-align: center; margin-bottom: 32px;">
            <a href="https://www.agaigency.com/fr#contact" style="display: inline-block; background: #D4AF37; color: #0a0a0a; padding: 14px 32px; border-radius: 24px; text-decoration: none; font-weight: 700; font-size: 15px;">
              Réserver mon appel stratégique gratuit
            </a>
            <p style="margin-top: 8px; font-size: 12px; color: #808080;">Gratuit · Sans engagement · 30 min</p>
          </div>

          <div style="border-top: 1px solid #262626; padding-top: 16px; text-align: center;">
            <p style="font-size: 12px; color: #808080;">
              AgaiGency — Agence Digitale Premium<br>
              <a href="https://www.agaigency.com" style="color: #D4AF37; text-decoration: none;">agaigency.com</a>
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Campaign lead API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
