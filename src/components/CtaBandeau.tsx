"use client";

import { useTranslations } from "next-intl";
import ScrollReveal from "./ui/ScrollReveal";

export default function CtaBandeau() {
  const t = useTranslations("ctaBandeau");

  return (
    <section className="relative overflow-hidden px-6 py-20">
      {/* Subtle gold ambient */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[300px] w-[600px] rounded-full bg-gold/5 blur-[100px]" />
      </div>

      <ScrollReveal className="relative mx-auto max-w-3xl text-center">
        <h3 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl">
          {t("title")}
        </h3>
        <p className="mx-auto mb-8 max-w-xl text-base text-muted">
          {t("subtitle")}
        </p>
        <a
          href="https://calendly.com/benjaminferment/30min"
          target="_blank"
          rel="noopener noreferrer"
          className="cta-base cta-primary"
        >
          {t("cta")}
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </a>
      </ScrollReveal>
    </section>
  );
}
