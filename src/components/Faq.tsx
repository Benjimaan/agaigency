"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import ScrollReveal from "./ui/ScrollReveal";

const EASE = [0.25, 0.1, 0.25, 1] as [number, number, number, number];
const faqKeys = ["price", "timeline", "maintenance", "seo"] as const;

export default function Faq() {
  const t = useTranslations("faq");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="px-6 py-32">
      <div className="mx-auto max-w-3xl">
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

        <div className="space-y-4">
          {faqKeys.map((key, i) => (
            <ScrollReveal key={key} delay={i * 0.1}>
              <div className="gold-glow-hover rounded-2xl border border-border bg-card transition-all hover:border-gold/20">
                <button
                  onClick={() => toggle(i)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left"
                >
                  <span className="pr-4 text-base font-semibold">
                    {t(`items.${key}.question`)}
                  </span>
                  <motion.div
                    animate={{ rotate: openIndex === i ? 45 : 0 }}
                    transition={{ duration: 0.2, ease: EASE }}
                    className="flex-shrink-0 text-gold"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-sm leading-relaxed text-muted">
                        {t(`items.${key}.answer`)}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
