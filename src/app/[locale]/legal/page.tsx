"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";

export default function LegalPage() {
  const t = useTranslations("legal");
  const locale = useLocale();

  const sections = [
    { title: t("editor"), text: t("editorText") },
    { title: t("hosting"), text: t("hostingText") },
    { title: t("intellectual"), text: t("intellectualText") },
    { title: t("data"), text: t("dataText") },
    { title: t("cookies"), text: t("cookiesText") },
    { title: t("law"), text: t("lawText") },
  ];

  return (
    <div className="min-h-screen bg-background px-6 pb-20 pt-32">
      <div className="mx-auto max-w-3xl">
        <Link
          href={`/${locale}`}
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {locale === "fr" ? "Retour à l'accueil" : "Back to home"}
        </Link>

        <h1 className="mb-12 text-4xl font-bold tracking-tight sm:text-5xl">
          {t("title")}
        </h1>

        <div className="space-y-10">
          {sections.map((section, i) => (
            <div key={i}>
              <h2 className="mb-3 text-xl font-semibold">{section.title}</h2>
              <p className="whitespace-pre-line text-muted leading-relaxed">
                {section.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
