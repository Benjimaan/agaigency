"use client";

import { motion } from "framer-motion";
import { Compass, PenTool, Rocket } from "lucide-react";
import { useTranslations } from "next-intl";
import ScrollReveal from "./ui/ScrollReveal";

const EASE = [0.25, 0.1, 0.25, 1] as [number, number, number, number];
const stepKeys = ["audit", "craft", "accelerate"] as const;

const stepIcons = [
  <Compass key="audit" className="h-6 w-6 text-gold" />,
  <PenTool key="craft" className="h-6 w-6 text-gold" />,
  <Rocket key="accelerate" className="h-6 w-6 text-gold" />,
];

export default function PremiumProcess() {
  const t = useTranslations("premiumProcess");

  return (
    <section className="relative px-6 py-32">
      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Header — split layout */}
        <div className="mb-20 md:flex md:items-end md:justify-between">
          <ScrollReveal direction="left" className="max-w-2xl">
            <span className="mb-4 inline-block rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-medium tracking-wider text-gold uppercase">
              {t("badge")}
            </span>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              {t.rich("title", {
                gold: (chunks) => (
                  <span className="bg-gradient-to-r from-gold to-gold-light bg-clip-text font-serif italic text-transparent">
                    {chunks}
                  </span>
                ),
                br: () => <br />,
              })}
            </h2>
          </ScrollReveal>
          <ScrollReveal direction="right" className="mt-6 md:mt-0">
            <p className="max-w-md border-l border-gold/30 pl-6 text-base leading-relaxed text-muted">
              {t("description")}
            </p>
          </ScrollReveal>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {stepKeys.map((key, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.15, ease: EASE }}
              className="group relative flex flex-col items-start gap-8 overflow-hidden rounded-2xl border border-white/5 bg-white/[0.01] p-8 transition-colors duration-500 hover:bg-white/[0.03] md:flex-row md:items-center md:p-10"
            >
              {/* Gold sweep on hover */}
              <div className="pointer-events-none absolute top-0 left-0 h-full w-1/2 -translate-x-full bg-gradient-to-r from-gold/10 to-transparent opacity-0 transition-all duration-700 group-hover:translate-x-0 group-hover:opacity-100" />

              {/* Watermark number */}
              <div className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 text-8xl font-bold text-white/[0.02] transition-all duration-700 group-hover:scale-110 group-hover:text-white/[0.04]">
                {String(i + 1).padStart(2, "0")}
              </div>

              {/* Icon */}
              <div className="relative z-10 flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border border-gold/20 bg-black/50 shadow-[0_0_15px_rgba(212,175,55,0.05)] transition-all duration-500 group-hover:border-gold/50 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                {stepIcons[i]}
              </div>

              {/* Text */}
              <div className="relative z-10 flex-1">
                <h3 className="mb-3 text-2xl font-semibold tracking-wide">
                  {t(`steps.${key}.title`)}
                </h3>
                <p className="max-w-3xl leading-relaxed text-muted">
                  {t(`steps.${key}.description`)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
