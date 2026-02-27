"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const EASE = [0.25, 0.1, 0.25, 1] as [number, number, number, number];
const GOLD = "#D4AF37";

interface KeywordData {
  keyword: string;
  volume: number;
  difficulty: number;
  position: number;
}

interface OnPageData {
  title: { text: string; length: number; status: "good" | "warning" | "error" };
  metaDescription: { text: string; length: number; status: "good" | "warning" | "error" };
  h1: { text: string; count: number; status: "good" | "warning" | "error" };
  h2Count: number;
  images: { total: number; withoutAlt: number };
  hasViewport: boolean;
  hasCanonical: boolean;
  hasOpenGraph: boolean;
  technicalScore: number;
}

interface ScanResults {
  visibilityScore: number;
  positioningScore: number;
  technicalScore: number;
  keywords: KeywordData[];
  financialLoss: number;
  competitors: number;
  missingPages: number;
  onPageData: OnPageData;
}

/* ─── Radar Animation ─── */
function RadarAnimation() {
  return (
    <div className="relative mx-auto h-48 w-48">
      {/* Concentric circles */}
      {[1, 0.75, 0.5, 0.25].map((scale, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border"
          style={{ borderColor: `${GOLD}${i === 0 ? "30" : "15"}` }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale,
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            scale: { duration: 0.8, delay: i * 0.15, ease: EASE },
            opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" },
          }}
        />
      ))}

      {/* Rotating radar sweep */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
      >
        <div
          className="absolute top-1/2 left-1/2 h-1/2 w-0.5 origin-top -translate-x-1/2"
          style={{
            background: `linear-gradient(to bottom, ${GOLD}, transparent)`,
          }}
        />
      </motion.div>

      {/* Center dot */}
      <motion.div
        className="absolute top-1/2 left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ backgroundColor: GOLD }}
        animate={{ scale: [1, 1.4, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Blinking dots on radar */}
      {[
        { top: "25%", left: "60%" },
        { top: "40%", left: "30%" },
        { top: "65%", left: "70%" },
      ].map((pos, i) => (
        <motion.div
          key={i}
          className="absolute h-2 w-2 rounded-full"
          style={{ ...pos, backgroundColor: GOLD }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 0.8 + i * 0.6,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ─── Progress Steps ─── */
function ScanProgress({ step }: { step: number }) {
  const t = useTranslations("seoAudit.page.scanning");
  const steps = [t("step1"), t("step2"), t("step3"), t("step4")];

  return (
    <div className="mt-10 space-y-4">
      {steps.map((label, i) => (
        <div key={i} className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className={i <= step ? "text-[#D4AF37]" : "text-muted"}>
              {label}
            </span>
            {i < step && (
              <motion.svg
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="h-4 w-4 text-[#D4AF37]"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </motion.svg>
            )}
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-border">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: GOLD }}
              initial={{ width: "0%" }}
              animate={{
                width: i < step ? "100%" : i === step ? "60%" : "0%",
              }}
              transition={{ duration: 0.8, ease: EASE }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Score Circle ─── */
function ScoreCircle({ score }: { score: number }) {
  const t = useTranslations("seoAudit.page.results");
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  const scoreColor =
    score < 30 ? "#ef4444" : score < 50 ? "#f59e0b" : "#22c55e";

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-48 w-48">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 160 160">
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#262626"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <motion.circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={scoreColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.5, ease: EASE, delay: 0.3 }}
          />
        </svg>
        {/* Score number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-4xl font-bold"
            style={{ color: scoreColor }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8, ease: EASE }}
          >
            {score}
          </motion.span>
          <span className="text-sm text-muted">{t("scoreOut")}</span>
        </div>
      </div>
      <p className="mt-4 text-sm font-medium text-muted">{t("scoreLabel")}</p>
    </div>
  );
}

/* ─── Keyword Card ─── */
function KeywordCard({
  data,
  index,
}: {
  data: KeywordData;
  index: number;
}) {
  const t = useTranslations("seoAudit.page.results");

  const difficultyColor =
    data.difficulty < 40
      ? "text-green-400"
      : data.difficulty < 60
        ? "text-yellow-400"
        : "text-red-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 + index * 0.1, duration: 0.5, ease: EASE }}
      className="rounded-xl border border-[#D4AF37]/20 bg-card p-4"
    >
      <p className="mb-2 text-sm font-semibold text-foreground">
        {data.keyword}
      </p>
      <div className="flex items-center gap-4 text-xs text-muted">
        <span>
          {data.volume.toLocaleString()} {t("volume")}
        </span>
        <span className={difficultyColor}>
          {data.difficulty}% {t("difficulty")}
        </span>
      </div>
    </motion.div>
  );
}

/* ─── On-Page Audit Row ─── */
function OnPageRow({
  label,
  value,
  status,
  detail,
  index,
}: {
  label: string;
  value: string;
  status: "good" | "warning" | "error" | "info";
  detail?: string;
  index: number;
}) {
  const statusIcon = {
    good: { color: "text-green-400", bg: "bg-green-400/10", icon: "✓" },
    warning: { color: "text-yellow-400", bg: "bg-yellow-400/10", icon: "!" },
    error: { color: "text-red-400", bg: "bg-red-400/10", icon: "✗" },
    info: { color: "text-blue-400", bg: "bg-blue-400/10", icon: "i" },
  }[status];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.8 + index * 0.08, duration: 0.4, ease: EASE }}
      className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
    >
      <div className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${statusIcon.bg} ${statusIcon.color}`}>
        {statusIcon.icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-foreground">{label}</span>
          <span className={`text-xs font-medium ${statusIcon.color}`}>{value}</span>
        </div>
        {detail && (
          <p className="mt-1 truncate text-xs text-muted">{detail}</p>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Score Bar (positioning vs technical) ─── */
function ScoreBar({ label, score, delay }: { label: string; score: number; delay: number }) {
  const color = score < 30 ? "#ef4444" : score < 50 ? "#f59e0b" : score < 70 ? "#D4AF37" : "#22c55e";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: EASE }}
    >
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-muted">{label}</span>
        <span className="font-semibold" style={{ color }}>{score}/100</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-border">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: "0%" }}
          animate={{ width: `${score}%` }}
          transition={{ delay: delay + 0.2, duration: 1, ease: EASE }}
        />
      </div>
    </motion.div>
  );
}

/* ─── Main SeoAuditSimulator ─── */
export default function SeoAuditSimulator() {
  const t = useTranslations("seoAudit.page");
  const locale = useLocale();
  const searchParams = useSearchParams();

  const [phase, setPhase] = useState<"input" | "scanning" | "results">(
    "input"
  );
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [scanStep, setScanStep] = useState(0);
  const [results, setResults] = useState<ScanResults | null>(null);

  const startScan = useCallback(
    async (scanUrl: string, scanEmail: string) => {
      setPhase("scanning");
      setScanStep(0);

      // Animate through steps
      const stepTimer = setInterval(() => {
        setScanStep((prev) => {
          if (prev >= 3) {
            clearInterval(stepTimer);
            return 3;
          }
          return prev + 1;
        });
      }, 1000);

      // Call API
      try {
        const res = await fetch("/api/seo-scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: scanUrl, email: scanEmail }),
        });
        const data = await res.json();

        // Wait for animation to finish (minimum 4s)
        setTimeout(() => {
          clearInterval(stepTimer);
          setResults(data);
          setPhase("results");
        }, 4500);
      } catch {
        setTimeout(() => {
          clearInterval(stepTimer);
          // Fallback mock data
          setResults({
            visibilityScore: 28,
            positioningScore: 20,
            technicalScore: 36,
            keywords: [
              { keyword: "votre mot-clé", volume: 5400, difficulty: 45, position: 0 },
              { keyword: "mot-clé stratégique", volume: 3200, difficulty: 55, position: 0 },
              { keyword: "opportunité SEO", volume: 2800, difficulty: 38, position: 0 },
              { keyword: "visibilité web", volume: 4100, difficulty: 50, position: 0 },
              { keyword: "croissance digitale", volume: 1900, difficulty: 42, position: 0 },
            ],
            financialLoss: 2350,
            competitors: 5,
            missingPages: 7,
            onPageData: {
              title: { text: "", length: 0, status: "error" },
              metaDescription: { text: "", length: 0, status: "error" },
              h1: { text: "", count: 0, status: "error" },
              h2Count: 0,
              images: { total: 0, withoutAlt: 0 },
              hasViewport: false,
              hasCanonical: false,
              hasOpenGraph: false,
              technicalScore: 0,
            },
          });
          setPhase("results");
        }, 4500);
      }
    },
    []
  );

  // Auto-start scan if URL params present (from teaser)
  useEffect(() => {
    const paramUrl = searchParams.get("url");
    const paramEmail = searchParams.get("email");
    if (paramUrl && paramEmail) {
      setUrl(paramUrl);
      setEmail(paramEmail);
      startScan(paramUrl, paramEmail);
    }
  }, [searchParams, startScan]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !email.trim()) return;
    startScan(url, email);
  };

  const canSubmit = url.trim() !== "" && email.trim() !== "";

  const inputClass =
    "w-full rounded-xl border border-border bg-background px-5 py-4 text-sm text-foreground placeholder-muted outline-none transition-all focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20";

  return (
    <div className="min-h-screen bg-background px-6 pt-32 pb-20">
      <div className="mx-auto max-w-3xl">
        {/* Back to home */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href={`/${locale}`}
            className="mb-12 inline-flex items-center gap-3 text-sm text-muted transition-colors hover:text-foreground"
          >
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
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            <img
              src="/images/logo.svg"
              alt="AgaiGency"
              className="h-10 w-auto"
            />
          </Link>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ─── Phase 1: Input ─── */}
          {phase === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              {/* Icon */}
              <div className="mb-8 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/10">
                  <svg
                    className="h-8 w-8 text-[#D4AF37]"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                </div>
              </div>

              <h1 className="mb-3 text-center text-3xl font-bold tracking-tight sm:text-4xl">
                {t("title")}
              </h1>
              <p className="mx-auto mb-10 max-w-lg text-center text-lg text-muted">
                {t("subtitle")}
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={t("urlPlaceholder")}
                  className={inputClass}
                  required
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("emailPlaceholder")}
                  className={inputClass}
                  required
                />
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={`w-full rounded-xl px-8 py-4 text-sm font-semibold transition-all ${
                    canSubmit
                      ? "bg-[#D4AF37] text-background hover:bg-[#C5A028] hover:shadow-lg hover:shadow-[#D4AF37]/20"
                      : "cursor-not-allowed bg-border text-muted"
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
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
                  </span>
                </button>
              </form>
            </motion.div>
          )}

          {/* ─── Phase 2: Scanning ─── */}
          {phase === "scanning" && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="text-center"
            >
              <h2 className="mb-2 text-2xl font-bold tracking-tight">
                {t("scanning.title")}
              </h2>
              <p className="mb-10 text-sm text-muted">{url}</p>

              <RadarAnimation />
              <ScanProgress step={scanStep} />
            </motion.div>
          )}

          {/* ─── Phase 3: Results ─── */}
          {phase === "results" && results && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <h2 className="mb-2 text-center text-2xl font-bold tracking-tight sm:text-3xl">
                {t("results.title")}
              </h2>
              <p className="mb-10 text-center text-sm text-muted">{url}</p>

              {/* Score */}
              <div className="mb-8 flex justify-center">
                <ScoreCircle score={results.visibilityScore} />
              </div>

              {/* Score breakdown bars */}
              <div className="mb-10 space-y-3">
                <ScoreBar label={t("results.positioningLabel")} score={results.positioningScore} delay={0.3} />
                <ScoreBar label={t("results.technicalLabel")} score={results.technicalScore} delay={0.45} />
              </div>

              {/* Stats row */}
              <div className="mb-10 grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5, ease: EASE }}
                  className="rounded-xl border border-border bg-card p-5 text-center"
                >
                  <p className="text-2xl font-bold text-[#D4AF37]">
                    {results.competitors}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {t("results.competitors")}
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5, ease: EASE }}
                  className="rounded-xl border border-border bg-card p-5 text-center"
                >
                  <p className="text-2xl font-bold text-[#D4AF37]">
                    {results.missingPages}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {t("results.missingPages")}
                  </p>
                </motion.div>
              </div>

              {/* Financial Loss */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.5, ease: EASE }}
                className="mb-10 rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-6 text-center"
              >
                <p className="mb-1 text-sm font-medium text-[#D4AF37]">
                  {t("results.financialTitle")}
                </p>
                <p className="text-4xl font-bold text-foreground">
                  {results.financialLoss.toLocaleString("fr-FR")} €
                  <span className="text-lg font-normal text-muted">
                    {t("results.financialPerMonth")}
                  </span>
                </p>
                <p className="mt-2 text-xs text-muted">
                  {t("results.financialDesc")}
                </p>
              </motion.div>

              {/* On-Page Audit */}
              {results.onPageData && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="mb-10"
                >
                  <h3 className="mb-1 text-lg font-semibold">
                    {t("results.onPageTitle")}
                  </h3>
                  <p className="mb-4 text-sm text-muted">
                    {t("results.onPageSubtitle")}
                  </p>
                  <div className="space-y-2">
                    <OnPageRow
                      label="Title"
                      value={results.onPageData.title.length > 0 ? `${results.onPageData.title.length} car.` : t("results.missing")}
                      status={results.onPageData.title.status}
                      detail={results.onPageData.title.text || undefined}
                      index={0}
                    />
                    <OnPageRow
                      label="Meta Description"
                      value={results.onPageData.metaDescription.length > 0 ? `${results.onPageData.metaDescription.length} car.` : t("results.missing")}
                      status={results.onPageData.metaDescription.status}
                      detail={results.onPageData.metaDescription.text?.slice(0, 100) || undefined}
                      index={1}
                    />
                    <OnPageRow
                      label="H1"
                      value={results.onPageData.h1.count === 1 ? "1 H1" : results.onPageData.h1.count === 0 ? t("results.missing") : `${results.onPageData.h1.count} H1`}
                      status={results.onPageData.h1.status}
                      detail={results.onPageData.h1.text || undefined}
                      index={2}
                    />
                    <OnPageRow
                      label={t("results.h2Structure")}
                      value={`${results.onPageData.h2Count} H2`}
                      status={results.onPageData.h2Count >= 3 ? "good" : results.onPageData.h2Count >= 1 ? "warning" : "error"}
                      index={3}
                    />
                    <OnPageRow
                      label={t("results.imagesAlt")}
                      value={results.onPageData.images.total > 0 ? `${results.onPageData.images.withoutAlt} / ${results.onPageData.images.total}` : "—"}
                      status={results.onPageData.images.withoutAlt === 0 ? "good" : results.onPageData.images.withoutAlt <= 3 ? "warning" : "error"}
                      index={4}
                    />
                    <OnPageRow
                      label="Mobile (viewport)"
                      value={results.onPageData.hasViewport ? "OK" : t("results.missing")}
                      status={results.onPageData.hasViewport ? "good" : "error"}
                      index={5}
                    />
                    <OnPageRow
                      label="Canonical"
                      value={results.onPageData.hasCanonical ? "OK" : t("results.missing")}
                      status={results.onPageData.hasCanonical ? "good" : "warning"}
                      index={6}
                    />
                    <OnPageRow
                      label="Open Graph"
                      value={results.onPageData.hasOpenGraph ? "OK" : t("results.missing")}
                      status={results.onPageData.hasOpenGraph ? "good" : "warning"}
                      index={7}
                    />
                  </div>
                </motion.div>
              )}

              {/* Keywords */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <h3 className="mb-1 text-lg font-semibold">
                  {t("results.keywordsTitle")}
                </h3>
                <p className="mb-5 text-sm text-muted">
                  {t("results.keywordsSubtitle")}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {results.keywords.map((kw, i) => (
                    <KeywordCard key={kw.keyword} data={kw} index={i} />
                  ))}
                </div>
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.5, ease: EASE }}
                className="mt-12 rounded-2xl border border-border bg-card p-8 text-center"
              >
                <h3 className="mb-2 text-xl font-bold">
                  {t("results.ctaTitle")}
                </h3>
                <p className="mb-6 text-sm text-muted">
                  {t("results.ctaSubtitle")}
                </p>
                <Link
                  href={`/${locale}/request-quote`}
                  className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-8 py-3 text-sm font-semibold text-background transition-all hover:bg-[#C5A028] hover:shadow-lg hover:shadow-[#D4AF37]/20"
                >
                  {t("results.ctaButton")}
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
