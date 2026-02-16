"use client";

import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";

const EASE = [0.25, 0.1, 0.25, 1] as [number, number, number, number];

export default function Hero() {
  const t = useTranslations("hero");
  const locale = useLocale();
  const title = t("title");
  const words = title.split(" ");

  const wordVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.3 + i * 0.08,
        duration: 0.5,
        ease: EASE,
      },
    }),
  };

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      {/* Dot grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(212,175,55,0.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Golden ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/3 left-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/5 blur-[150px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl text-center">
        {/* Badge */}
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: EASE }}
          className="mb-6 inline-block rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-medium tracking-wider text-gold uppercase"
        >
          {t("badge")}
        </motion.span>

        {/* Animated title — last word gets gold gradient */}
        <h1 className="mb-8 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-7xl lg:text-8xl">
          {words.map((word, i) => {
            const isLast = i === words.length - 1;
            return (
              <motion.span
                key={i}
                custom={i}
                variants={wordVariants}
                initial="hidden"
                animate="visible"
                className={`mr-[0.3em] inline-block ${
                  isLast
                    ? "bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent"
                    : ""
                }`}
              >
                {word}
              </motion.span>
            );
          })}
        </h1>

        {/* Gold decorative line */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 200 }}
          transition={{ delay: 0.9, duration: 0.8, ease: EASE }}
          className="mx-auto mb-8 h-px bg-gradient-to-r from-transparent via-gold to-transparent"
        />

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6, ease: EASE }}
          className="mx-auto mb-12 max-w-2xl text-lg text-muted sm:text-xl"
        >
          {t("subtitle")}
        </motion.p>

        {/* CTA — Gold */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.6, ease: EASE }}
        >
          <Link
            href={`/${locale}/request-quote`}
            className="inline-flex items-center gap-2 rounded-full bg-gold px-8 py-4 text-sm font-semibold text-background transition-all hover:bg-gold-dark hover:shadow-[0_8px_30px_rgba(212,175,55,0.3)]"
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
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.6 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs tracking-widest text-muted uppercase">
            {t("scroll")}
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="h-10 w-6 rounded-full border-2 border-gold/30 p-1"
          >
            <div className="h-2 w-full rounded-full bg-gold" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
