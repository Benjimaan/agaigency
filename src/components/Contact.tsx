"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import ScrollReveal from "./ui/ScrollReveal";

export default function Contact() {
  const t = useTranslations("contact");
  const locale = useLocale();

  return (
    <section id="contact" className="px-6 py-32">
      <div className="mx-auto max-w-4xl">
        <ScrollReveal className="text-center">
          <span className="mb-4 inline-block rounded-full border border-border px-4 py-1.5 text-xs font-medium tracking-wider text-accent uppercase">
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
            className="inline-flex items-center gap-2 rounded-full bg-accent px-10 py-4 text-sm font-semibold text-background transition-all hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/20"
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
        </ScrollReveal>
      </div>
    </section>
  );
}
