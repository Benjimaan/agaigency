"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import ScrollReveal from "./ui/ScrollReveal";

const valueKeys = ["innovation", "excellence", "results"] as const;

const valueIcons = [
  <svg key="inno" className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
  </svg>,
  <svg key="excel" className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>,
  <svg key="result" className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
  </svg>,
];

export default function About() {
  const t = useTranslations("about");
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section id="about" ref={sectionRef} className="relative overflow-hidden px-6 py-32">
      {/* Parallax background element */}
      <motion.div
        style={{ y }}
        className="pointer-events-none absolute top-0 right-0 h-[500px] w-[500px] translate-x-1/3 rounded-full bg-accent/5 blur-[100px]"
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left: text */}
          <div>
            <ScrollReveal>
              <span className="mb-4 inline-block rounded-full border border-border px-4 py-1.5 text-xs font-medium tracking-wider text-accent uppercase">
                {t("badge")}
              </span>
              <h2 className="mb-8 text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
                {t("title")}
              </h2>
              <p className="text-lg leading-relaxed text-muted">
                {t("description")}
              </p>
            </ScrollReveal>
          </div>

          {/* Right: values */}
          <div className="space-y-6">
            {valueKeys.map((key, i) => (
              <ScrollReveal key={key} delay={i * 0.15}>
                <div className="flex items-start gap-5 rounded-2xl border border-border bg-card p-6 transition-all hover:border-accent/30 hover:bg-card-hover">
                  <div className="flex-shrink-0 rounded-xl bg-accent/10 p-3 text-accent">
                    {valueIcons[i]}
                  </div>
                  <div>
                    <h3 className="mb-1 text-lg font-semibold">
                      {t(`values.${key}.title`)}
                    </h3>
                    <p className="text-sm text-muted">
                      {t(`values.${key}.description`)}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
