"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import ScrollReveal from "./ui/ScrollReveal";

const stepKeys = ["discovery", "design", "development", "testing", "launch"] as const;

export default function Process() {
  const t = useTranslations("process");

  return (
    <section id="process" className="px-6 py-32">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal className="mb-20 text-center">
          <span className="mb-4 inline-block rounded-full border border-border px-4 py-1.5 text-xs font-medium tracking-wider text-accent uppercase">
            {t("badge")}
          </span>
          <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {t("title")}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted">
            {t("subtitle")}
          </p>
        </ScrollReveal>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute top-0 bottom-0 left-[23px] hidden w-px bg-border md:left-1/2 md:block" />

          <div className="space-y-16 md:space-y-24">
            {stepKeys.map((key, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{
                  delay: 0.1,
                  duration: 0.6,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                className={`relative flex flex-col gap-6 md:flex-row md:items-center ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Step number */}
                <div className="absolute left-0 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-accent/30 bg-background text-lg font-bold text-accent md:left-1/2 md:-translate-x-1/2">
                  {String(i + 1).padStart(2, "0")}
                </div>

                {/* Content */}
                <div
                  className={`ml-16 md:ml-0 md:w-1/2 ${
                    i % 2 === 0
                      ? "md:pr-20 md:text-right"
                      : "md:pl-20 md:text-left"
                  }`}
                >
                  <h3 className="mb-3 text-xl font-semibold">
                    {t(`steps.${key}.title`)}
                  </h3>
                  <p className="text-muted leading-relaxed">
                    {t(`steps.${key}.description`)}
                  </p>
                </div>

                {/* Empty space for alternating layout */}
                <div className="hidden md:block md:w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
