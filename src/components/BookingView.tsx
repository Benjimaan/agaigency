"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const CALENDAR_URL = "https://calendly.com/benjaminferment/30min";

const EASE = [0.25, 0.1, 0.25, 1] as [number, number, number, number];

interface BookingViewProps {
  name: string;
  email: string;
}

function buildCalendarUrl(name: string, email: string): string {
  const url = new URL(CALENDAR_URL);
  if (name) url.searchParams.set("name", name);
  if (email) url.searchParams.set("email", email);
  return url.toString();
}

function SkeletonLoader() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8">
      {/* Pulsing header skeleton */}
      <div className="h-6 w-48 animate-pulse rounded-lg bg-white/5" />
      {/* Calendar grid skeleton */}
      <div className="grid w-full max-w-sm grid-cols-7 gap-2">
        {[...Array(35)].map((_, i) => (
          <div
            key={i}
            className="aspect-square animate-pulse rounded-lg bg-white/5"
            style={{ animationDelay: `${i * 30}ms` }}
          />
        ))}
      </div>
      {/* Time slots skeleton */}
      <div className="flex w-full max-w-sm flex-col gap-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-10 animate-pulse rounded-xl bg-white/5"
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>
      <span className="text-sm text-muted animate-pulse">Chargement du calendrier...</span>
    </div>
  );
}

export default function BookingView({ name, email }: BookingViewProps) {
  const t = useTranslations("booking");
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const calendarUrl = buildCalendarUrl(name, email);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      {/* Section title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6, ease: EASE }}
        className="mb-8 text-center"
      >
        <div className="mx-auto mb-4 h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent" />
        <h3 className="mb-2 text-xl font-bold tracking-tight sm:text-2xl">
          {t("title")}
        </h3>
        <p className="text-sm text-muted">
          {t("subtitle")}
        </p>
      </motion.div>

      {/* Calendar container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.6, ease: EASE }}
        className="relative overflow-hidden rounded-2xl border border-gold/30 bg-[#0A0A0A] shadow-2xl shadow-gold/5"
        style={{
          boxShadow:
            "0 0 40px rgba(212, 175, 55, 0.06), 0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Gold glow top edge */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

        {/* Skeleton loader */}
        {!iframeLoaded && <SkeletonLoader />}

        {/* Calendar iframe */}
        <iframe
          src={calendarUrl}
          title={t("title")}
          onLoad={() => setIframeLoaded(true)}
          className={`w-full transition-opacity duration-500 ${
            iframeLoaded ? "opacity-100" : "opacity-0"
          }`}
          style={{
            height: "680px",
            minHeight: "580px",
            border: "none",
            background: "#0A0A0A",
          }}
          allow="payment"
        />
      </motion.div>

      {/* Skip booking link */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5, ease: EASE }}
        className="mt-6 text-center text-xs text-muted"
      >
        {t("skip")}
      </motion.p>
    </motion.div>
  );
}
