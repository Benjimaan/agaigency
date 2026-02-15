import { Resend } from "resend";
import { NextResponse } from "next/server";

const TO_EMAILS = ["contact@agaigency.com"];

export async function POST(request: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const body = await request.json();
    const {
      name,
      email,
      company,
      phone,
      projectType,
      budget,
      timeline,
      details,
      currentSite,
      inspiration,
    } = body;

    const projectLabels: Record<string, string> = {
      showcase: "Site vitrine",
      ecommerce: "E-Commerce",
      webapp: "Application Web",
      redesign: "Refonte de site",
      other: "Autre projet",
    };

    const budgetLabels: Record<string, string> = {
      small: "Moins de 2 000 €",
      medium: "2 000 € — 5 000 €",
      large: "5 000 € — 10 000 €",
      enterprise: "Plus de 10 000 €",
      unsure: "Pas encore défini",
    };

    const timelineLabels: Record<string, string> = {
      urgent: "Dès que possible",
      month: "Dans 1 mois",
      quarter: "Dans 2-3 mois",
      flexible: "Pas de deadline précise",
    };

    const { error } = await resend.emails.send({
      from: "AgaiGency <noreply@agaigency.com>",
      to: TO_EMAILS,
      replyTo: email,
      subject: `Nouvelle demande de projet — ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h1 style="color: #c9baac; border-bottom: 2px solid #c9baac; padding-bottom: 12px;">
            Nouvelle demande de projet
          </h1>

          <h2 style="margin-top: 24px;">Contact</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: bold; width: 140px;">Nom</td><td>${name}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Email</td><td><a href="mailto:${email}">${email}</a></td></tr>
            ${company ? `<tr><td style="padding: 8px 0; font-weight: bold;">Entreprise</td><td>${company}</td></tr>` : ""}
            <tr><td style="padding: 8px 0; font-weight: bold;">Téléphone</td><td>${phone}</td></tr>
          </table>

          <h2 style="margin-top: 24px;">Projet</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: bold; width: 140px;">Type</td><td>${projectLabels[projectType] || projectType}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Budget</td><td>${budgetLabels[budget] || budget}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Délai</td><td>${timelineLabels[timeline] || timeline}</td></tr>
          </table>

          ${details ? `
          <h2 style="margin-top: 24px;">Description</h2>
          <p style="background: #f5f5f5; padding: 16px; border-radius: 8px; line-height: 1.6;">${details.replace(/\n/g, "<br>")}</p>
          ` : ""}

          ${currentSite ? `<p><strong>Site actuel :</strong> <a href="${currentSite}">${currentSite}</a></p>` : ""}
          ${inspiration ? `<p><strong>Inspirations :</strong> ${inspiration}</p>` : ""}

          <hr style="margin-top: 32px; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">Envoyé depuis le formulaire de devis — agaigency.com</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
