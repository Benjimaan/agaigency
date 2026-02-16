"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import ScrollReveal from "./ui/ScrollReveal";

const EASE = [0.25, 0.1, 0.25, 1] as [number, number, number, number];

export default function SeoAuditTeaser() {
  const t = useTranslations("seoAudit.teaser");
  const tPage = useTranslations("seoAudit.page");
  const locale = useLocale();
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !email.trim()) return;
    router.push(
      `/${locale}/seo-audit?url=${encodeURIComponent(url)}&email=${encodeURIComponent(email)}`
    );
  };

  const canSubmit = url.trim() !== "" && email.trim() !== "";

  const inputClass =
    "w-full rounded-xl border border-border bg-background px-5 py-4 text-sm text-foreground placeholder-muted outline-none transition-all focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20";

  return (
    <section id="seo-audit" className="px-6 py-32">
      <div className="mx-auto max-w-3xl">
        <ScrollReveal className="text-center">
          <span className="mb-4 inline-block rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-4 py-1.5 text-xs font-medium tracking-wider text-[#D4AF37] uppercase">
            {t("badge")}
          </span>
          <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {t("title")}
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-lg text-muted">
            {t("subtitle")}
          </p>
        </ScrollReveal>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={tPage("urlPlaceholder")}
              className={inputClass}
              required
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={tPage("emailPlaceholder")}
              className={inputClass}
              required
            />
          </div>
          <div className="text-center">
            <button
              type="submit"
              disabled={!canSubmit}
              className={`inline-flex items-center gap-2 rounded-full px-10 py-4 text-sm font-semibold transition-all ${
                canSubmit
                  ? "bg-[#D4AF37] text-background hover:bg-[#C5A028] hover:shadow-lg hover:shadow-[#D4AF37]/20"
                  : "cursor-not-allowed bg-border text-muted"
              }`}
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
            </button>
          </div>
        </motion.form>
      </div>
    </section>
  );
}
