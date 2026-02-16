"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import ScrollReveal from "./ui/ScrollReveal";

export default function Contact() {
  const t = useTranslations("contact");
  const locale = useLocale();

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
          <Link
            href={`/${locale}/request-quote`}
            className="inline-flex items-center gap-2 rounded-full bg-gold px-10 py-4 text-sm font-semibold text-background transition-all hover:bg-gold-dark hover:shadow-[0_8px_30px_rgba(212,175,55,0.3)]"
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
          </Link>
          <p className="mt-8 text-sm text-muted">
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
