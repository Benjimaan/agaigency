import { Resend } from "resend";
import { NextResponse } from "next/server";

const TO_EMAILS = ["contact@agaigency.com", "devcorp97@gmail.com"];

export async function POST(request: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const { error } = await resend.emails.send({
      from: "AgaiGency <onboarding@resend.dev>",
      to: TO_EMAILS,
      replyTo: email,
      subject: `Nouveau message de contact — ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h1 style="color: #c9baac; border-bottom: 2px solid #c9baac; padding-bottom: 12px;">
            Nouveau message de contact
          </h1>

          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <tr><td style="padding: 8px 0; font-weight: bold; width: 100px;">Nom</td><td>${name}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Email</td><td><a href="mailto:${email}">${email}</a></td></tr>
          </table>

          <h2 style="margin-top: 24px;">Message</h2>
          <p style="background: #f5f5f5; padding: 16px; border-radius: 8px; line-height: 1.6;">${message.replace(/\n/g, "<br>")}</p>

          <hr style="margin-top: 32px; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">Envoyé depuis le formulaire de contact — agaigency.com</p>
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
