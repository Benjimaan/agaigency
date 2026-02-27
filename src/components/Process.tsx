"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import ScrollReveal from "./ui/ScrollReveal";
import RevealText from "./ui/RevealText";

const EASE = [0.25, 0.1, 0.25, 1] as [number, number, number, number];
const stepKeys = ["discovery", "design", "development", "testing", "launch"] as const;

export default function Process() {
  const t = useTranslations("process");
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start end", "end start"],
  });
  const scaleY = useTransform(scrollYProgress, [0.1, 0.9], [0, 1]);

  return (
    <section id="process" className="bg-[#FAFAFA] px-6 py-32">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal className="mb-20 text-center">
          <span className="mb-4 inline-block rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-medium tracking-wider text-gold uppercase">
            {t("badge")}
          </span>
          <RevealText as="h2" className="mb-6 text-3xl font-bold tracking-tight text-[#121212] sm:text-4xl md:text-5xl">
            {t("title")}
          </RevealText>
          <p className="mx-auto max-w-2xl text-lg text-gray-500">
            {t("subtitle")}
          </p>
        </ScrollReveal>

        <div ref={timelineRef} className="relative">
          {/* Background line */}
          <div className="absolute top-0 bottom-0 left-[23px] hidden w-px bg-gray-200 md:left-1/2 md:block" />

          {/* Animated gold fill line */}
          <motion.div
            style={{ scaleY, transformOrigin: "top" }}
            className="absolute top-0 bottom-0 left-[23px] hidden w-px bg-gradient-to-b from-gold via-gold/60 to-gold/20 md:left-1/2 md:block"
          />

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
                  ease: EASE,
                }}
                className={`group relative flex flex-col gap-6 md:flex-row md:items-center ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Step number — gold with hover glow */}
                <div className="gold-glow-hover absolute left-0 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-gold/30 bg-[#FAFAFA] text-lg font-bold text-gold transition-all group-hover:border-gold/60 md:left-1/2 md:-translate-x-1/2">
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
                  <h3 className="mb-3 text-xl font-semibold text-[#121212]">
                    {t(`steps.${key}.title`)}
                  </h3>
                  <p className="text-gray-500 leading-relaxed">
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
