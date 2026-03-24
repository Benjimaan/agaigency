"use client";

import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import ScrollReveal from "./ui/ScrollReveal";

const EASE = [0.25, 0.1, 0.25, 1] as [number, number, number, number];

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
            <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              {t("title")}
            </h2>
            <p className="mx-auto mb-4 max-w-2xl text-lg text-muted">
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
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-xl border border-border bg-background p-5 text-center">
                <div className="mb-2 text-2xl">{t(`values.${i}.icon`)}</div>
                <div className="text-sm font-semibold">{t(`values.${i}.title`)}</div>
                <div className="mt-1 text-xs text-muted">{t(`values.${i}.desc`)}</div>
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
              className="inline-flex items-center gap-2 rounded-full bg-gold px-10 py-4 text-sm font-semibold text-background transition-all hover:bg-gold-dark hover:shadow-[0_8px_30px_rgba(212,175,55,0.3)]"
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
