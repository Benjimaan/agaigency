"use client";

import { motion } from "framer-motion";
import { Gauge, Zap, BarChart3 } from "lucide-react";
import { useTranslations } from "next-intl";
import ScrollReveal from "./ui/ScrollReveal";

const EASE = [0.25, 0.1, 0.25, 1] as [number, number, number, number];

const icons = [
  <Gauge key="engine" className="h-8 w-8 text-gold" />,
  <Zap key="body" className="h-8 w-8 text-gold" />,
  <BarChart3 key="fuel" className="h-8 w-8 text-gold" />,
];

const featureKeys = ["engine", "body", "fuel"] as const;

export default function PremiumExpertise() {
  const t = useTranslations("expertise");

  return (
    <section className="overflow-hidden px-6 py-24">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <ScrollReveal className="mb-20 text-center">
          <span className="mb-4 inline-block rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-medium tracking-wider text-gold uppercase">
            {t("badge")}
          </span>
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {t.rich("title", {
              gold: (chunks) => (
                <span className="bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent">
                  {chunks}
                </span>
              ),
            })}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted">
            {t("subtitle")}
          </p>
        </ScrollReveal>

        {/* Cards */}
        <div className="grid gap-8 md:grid-cols-3">
          {featureKeys.map((key, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.15, ease: EASE }}
              className="group relative cursor-default"
            >
              {/* Gold halo on hover */}
              <div className="pointer-events-none absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-gold to-transparent opacity-0 blur transition-opacity duration-700 group-hover:opacity-20" />

              {/* Card */}
              <div className="relative flex h-full flex-col rounded-2xl border border-white/5 bg-white/[0.02] px-8 py-10 backdrop-blur-sm transition-all duration-500 hover:bg-white/[0.04]">
                {/* Icon */}
                <div className="mb-6 inline-block rounded-xl border border-white/5 bg-black/50 p-4 shadow-[0_0_15px_rgba(212,175,55,0.05)] transition-shadow duration-500 group-hover:shadow-[0_0_25px_rgba(212,175,55,0.2)]">
                  {icons[i]}
                </div>

                <h3 className="mb-3 text-xl font-semibold tracking-wide">
                  {t(`items.${key}.title`)}
                </h3>
                <p className="text-sm leading-relaxed text-muted">
                  {t(`items.${key}.description`)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
