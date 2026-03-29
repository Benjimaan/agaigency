"use client";

import { useTranslations } from "next-intl";
import { track } from "@vercel/analytics/react";
import ScrollReveal from "./ui/ScrollReveal";

export default function Contact() {
  const t = useTranslations("contact");

  return (
    <section id="contact" className="relative px-6 py-32">
      {/* Subtle radial gold glow behind CTA */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[400px] w-[400px] rounded-full bg-gold/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-4xl">
        {/* Decorative gold line */}
        <div className="mx-auto mb-16 h-px w-32 bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

        <ScrollReveal className="text-center">
          <span className="mb-4 inline-block rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-medium tracking-wider text-gold uppercase">
            {t("badge")}
          </span>
          <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {t("title")}
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-lg text-muted">
            {t("subtitle")}
          </p>

          {/* Primary CTA — Calendly */}
          <a
            href="https://calendly.com/benjaminferment/30min"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("Click_Calendly", { location: "contact" })}
            className="cta-base cta-primary"
          >
            {t("cta")}
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </a>

          {/* Reassurance */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-gold" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t("reassurance.duration")}
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-gold" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t("reassurance.free")}
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-gold" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
              {t("reassurance.response")}
            </span>
          </div>

          <p className="mt-6 text-sm text-muted">
            <a
              href="mailto:contact@agaigency.com"
              className="transition-colors hover:text-gold"
            >
              contact@agaigency.com
            </a>
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
