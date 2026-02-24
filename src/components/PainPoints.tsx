"use client";

import { useTranslations } from "next-intl";
import ScrollReveal from "./ui/ScrollReveal";

const painPointKeys = ["visibility", "speed", "leads"] as const;

const painPointIcons = [
  <svg key="visibility" className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>,
  <svg key="speed" className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>,
  <svg key="leads" className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
  </svg>,
];

export default function PainPoints() {
  const t = useTranslations("painPoints");

  return (
    <section className="px-6 py-32">
      <div className="mx-auto max-w-5xl">
        <ScrollReveal className="mb-16 text-center">
          <span className="mb-4 inline-block rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-medium tracking-wider text-gold uppercase">
            {t("badge")}
          </span>
          <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {t("title")}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted">
            {t("subtitle")}
          </p>
        </ScrollReveal>

        <div className="grid gap-8 md:grid-cols-3">
          {painPointKeys.map((key, i) => (
            <ScrollReveal key={key} delay={i * 0.15}>
              <div className="gold-glow-hover flex h-full flex-col items-center rounded-2xl border border-border bg-card p-8 text-center transition-all hover:border-gold/20">
                <div className="mb-6 rounded-xl bg-gold/10 p-4 text-gold">
                  {painPointIcons[i]}
                </div>
                <h3 className="mb-3 text-lg font-semibold">
                  {t(`items.${key}.title`)}
                </h3>
                <p className="text-sm leading-relaxed text-muted">
                  {t(`items.${key}.description`)}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
