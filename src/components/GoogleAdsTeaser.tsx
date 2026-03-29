"use client";

import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import ScrollReveal from "./ui/ScrollReveal";

const EASE = [0.25, 0.1, 0.25, 1] as [number, number, number, number];

const VALUES = [
  { iconKey: "val0Icon", titleKey: "val0Title", descKey: "val0Desc" },
  { iconKey: "val1Icon", titleKey: "val1Title", descKey: "val1Desc" },
  { iconKey: "val2Icon", titleKey: "val2Title", descKey: "val2Desc" },
] as const;

export default function GoogleAdsTeaser() {
  const t = useTranslations("googleAdsTeaser");
  const locale = useLocale();

  return (
    <section id="google-ads" className="px-6 py-32">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-gold/10 bg-card p-8 sm:p-12">
          <ScrollReveal className="text-center">
            <span className="mb-4 inline-block rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-medium tracking-wider text-gold uppercase">
              {t("badge")}
            </span>
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              {t("title")}
            </h2>
            <p className="mx-auto mb-10 max-w-xl text-base text-muted sm:text-lg">
              {t("subtitle")}
            </p>
          </ScrollReveal>

          {/* Value props */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
            className="mb-10 grid gap-4 sm:grid-cols-3"
          >
            {VALUES.map((v) => (
              <div
                key={v.titleKey}
                className="flex flex-col items-center rounded-xl border border-border bg-background px-4 py-6 text-center"
              >
                <div className="mb-3 text-3xl">{t(v.iconKey)}</div>
                <div className="text-sm font-bold leading-tight">{t(v.titleKey)}</div>
                <div className="mt-1.5 text-xs leading-relaxed text-muted">{t(v.descKey)}</div>
              </div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
            className="text-center"
          >
            <Link
              href={`/${locale}/tools/campaign-builder`}
              className="cta-base cta-primary"
            >
              {t("cta")}
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <p className="mt-4 text-xs text-muted">{t("reassurance")}</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
