"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Logo from "./ui/Logo";

const EASE = [0.25, 0.1, 0.25, 1] as [number, number, number, number];
const GOLD = "#D4AF37";

/* ─── Types matching API response ─── */

interface AuditItem {
  status: "pass" | "warning" | "fail";
  labelKey: string;
  findingKey: string;
  findingArgs?: Record<string, string | number>;
  impactKey: string;
}

interface AuditCategory {
  score: number;
  items: AuditItem[];
}

interface ScanResults {
  globalScore: number;
  screenshot: string | null;
  categories: {
    performance: AuditCategory;
    seo: AuditCategory;
    mobile: AuditCategory;
    security: AuditCategory;
  };
  keyMetrics: {
    loadTime: string;
    mobileReady: boolean;
    seoReady: boolean;
    isSecure: boolean;
  };
  positioningScore: number;
  keywords: { keyword: string; volume: number; difficulty: number; position: number }[];
  financialLoss: number;
  competitors: number;
  missingPages: number;
  performanceScore: number;
  seoScore: number;
  accessibilityScore: number;
  bestPracticesScore: number;
  hasPageSpeed: boolean;
  hasScraping: boolean;
}

/* ─── Radar Animation ─── */
function RadarAnimation() {
  return (
    <div className="relative mx-auto h-48 w-48">
      {[1, 0.75, 0.5, 0.25].map((scale, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border"
          style={{ borderColor: `${GOLD}${i === 0 ? "30" : "15"}` }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale, opacity: [0.3, 0.6, 0.3] }}
          transition={{
            scale: { duration: 0.8, delay: i * 0.15, ease: EASE },
            opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" },
          }}
        />
      ))}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
      >
        <div
          className="absolute top-1/2 left-1/2 h-1/2 w-0.5 origin-top -translate-x-1/2"
          style={{ background: `linear-gradient(to bottom, ${GOLD}, transparent)` }}
        />
      </motion.div>
      <motion.div
        className="absolute top-1/2 left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ backgroundColor: GOLD }}
        animate={{ scale: [1, 1.4, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
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
          transition={{ duration: 2, repeat: Infinity, delay: 0.8 + i * 0.6, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ─── 8-Step Loading Progress ─── */
const LOADING_DURATIONS = [800, 1500, 1500, 1200, 1000, 1200, 800, 1000];
const TOTAL_LOADING_TIME = LOADING_DURATIONS.reduce((a, b) => a + b, 0); // ~9s

function ScanProgress({ step, totalSteps }: { step: number; totalSteps: number }) {
  const t = useTranslations("seoAudit.page.scanning");
  const steps = Array.from({ length: totalSteps }, (_, i) => t(`step${i + 1}`));

  return (
    <div className="mt-10 space-y-3">
      {steps.map((label, i) => (
        <div key={i} className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className={i <= step ? "text-[#D4AF37]" : "text-muted"}>{label}</span>
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </motion.svg>
            )}
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-border">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: GOLD }}
              initial={{ width: "0%" }}
              animate={{ width: i < step ? "100%" : i === step ? "60%" : "0%" }}
              transition={{ duration: 0.6, ease: EASE }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Score Circle ─── */
function ScoreCircle({ score, size = 192 }: { score: number; size?: number }) {
  const t = useTranslations("seoAudit.page.results");
  const radius = (size / 2) - 16;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const scoreColor = score < 30 ? "#ef4444" : score < 50 ? "#f59e0b" : score < 70 ? "#D4AF37" : "#22c55e";

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ height: size, width: size }}>
        <svg className="h-full w-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#262626" strokeWidth="8" />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
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

/* ─── Category Score Bar ─── */
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

/* ─── Key Metric Card ─── */
function MetricCard({
  icon,
  value,
  label,
  ok,
  delay,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  ok: boolean;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: EASE }}
      className={`rounded-xl border p-4 text-center ${ok ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"}`}
    >
      <div className={`mx-auto mb-2 ${ok ? "text-green-400" : "text-red-400"}`}>{icon}</div>
      <p className={`text-lg font-bold ${ok ? "text-green-400" : "text-red-400"}`}>{value}</p>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </motion.div>
  );
}

/* ─── SVG Icons ─── */
function CheckCircleIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function AlertCircleIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  );
}
function XCircleIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}
function SpeedIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}
function MobileIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

/* ─── Audit Item Row ─── */
function AuditItemRow({
  item,
  index,
  locked,
}: {
  item: AuditItem;
  index: number;
  locked: boolean;
}) {
  const t = useTranslations("seoAudit.audit");

  const statusColor =
    item.status === "pass" ? "text-green-400" : item.status === "warning" ? "text-yellow-400" : "text-red-400";
  const borderColor =
    item.status === "pass" ? "border-green-500/15" : item.status === "warning" ? "border-yellow-500/20" : "border-red-500/30";
  const shadowClass = item.status === "fail" ? "shadow-[0_0_15px_rgba(239,68,68,0.08)]" : "";

  // Interpolate finding args
  let finding: string;
  try {
    finding = t(item.findingKey, item.findingArgs || {});
  } catch {
    finding = item.findingKey;
  }

  let label: string;
  try {
    label = t(item.labelKey);
  } catch {
    label = item.labelKey;
  }

  let impact: string;
  try {
    impact = t(item.impactKey);
  } catch {
    impact = item.impactKey;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.08, duration: 0.4, ease: EASE }}
      className={`rounded-xl border bg-[#121212] p-4 ${borderColor} ${shadowClass} ${locked ? "relative overflow-hidden" : ""}`}
    >
      {locked && (
        <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[6px]">
          <div className="flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-xs font-medium text-white/70">
            <LockIcon />
            <span>{t("locked")}</span>
          </div>
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex-shrink-0 ${statusColor}`}>
          {item.status === "pass" ? <CheckCircleIcon /> : item.status === "warning" ? <AlertCircleIcon /> : <XCircleIcon />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="mt-1 text-xs leading-relaxed text-white/60">{finding}</p>
          {!locked && (
            <p className={`mt-2 text-xs font-medium leading-relaxed ${
              item.status === "fail" ? "text-red-400/80" : item.status === "warning" ? "text-yellow-400/70" : "text-white/40"
            }`}>
              {impact}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Category Section ─── */
function CategorySection({
  icon,
  titleKey,
  category,
  unlocked,
  delay,
}: {
  icon: React.ReactNode;
  titleKey: string;
  category: AuditCategory;
  unlocked: boolean;
  delay: number;
}) {
  const t = useTranslations("seoAudit.audit");
  const tRes = useTranslations("seoAudit.page.results");
  const failCount = category.items.filter((i) => i.status === "fail").length;
  const warnCount = category.items.filter((i) => i.status === "warning").length;
  const passCount = category.items.filter((i) => i.status === "pass").length;
  const scoreColor = category.score < 30 ? "text-red-400" : category.score < 50 ? "text-yellow-400" : category.score < 70 ? "text-[#D4AF37]" : "text-green-400";

  let title: string;
  try {
    title = t(titleKey);
  } catch {
    title = titleKey;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: EASE }}
      className="mb-10"
    >
      {/* Category header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-[#D4AF37]">{icon}</div>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <span className={`text-lg font-bold ${scoreColor}`}>{category.score}/100</span>
      </div>

      {/* Summary badges */}
      <div className="mb-4 flex gap-3 text-xs">
        {failCount > 0 && (
          <span className="rounded-full bg-red-500/10 px-3 py-1 text-red-400">
            {failCount} {tRes("errors")}
          </span>
        )}
        {warnCount > 0 && (
          <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-yellow-400">
            {warnCount} {tRes("warnings")}
          </span>
        )}
        {passCount > 0 && (
          <span className="rounded-full bg-green-500/10 px-3 py-1 text-green-400">
            {passCount} {tRes("passed")}
          </span>
        )}
      </div>

      {/* Items — first one always visible, rest locked if not unlocked */}
      <div className="space-y-3">
        {category.items.map((item, i) => (
          <AuditItemRow
            key={i}
            item={item}
            index={i}
            locked={!unlocked && i > 0}
          />
        ))}
      </div>

      {/* Locked count indicator */}
      {!unlocked && category.items.length > 1 && (
        <div className="mt-3 text-center text-xs text-muted">
          <LockIcon /> {category.items.length - 1} {t("hiddenItems")}
        </div>
      )}
    </motion.div>
  );
}

/* ─── Keyword Card ─── */
function KeywordCard({ data, index }: { data: { keyword: string; volume: number; difficulty: number }; index: number }) {
  const t = useTranslations("seoAudit.page.results");
  const difficultyColor = data.difficulty < 40 ? "text-green-400" : data.difficulty < 60 ? "text-yellow-400" : "text-red-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 + index * 0.1, duration: 0.5, ease: EASE }}
      className="rounded-xl border border-[#D4AF37]/20 bg-card p-4"
    >
      <p className="mb-2 text-sm font-semibold text-foreground">{data.keyword}</p>
      <div className="flex items-center gap-4 text-xs text-muted">
        <span>{data.volume.toLocaleString()} {t("volume")}</span>
        <span className={difficultyColor}>{data.difficulty}% {t("difficulty")}</span>
      </div>
    </motion.div>
  );
}

/* ─── Main SeoAuditSimulator ─── */
export default function SeoAuditSimulator() {
  const t = useTranslations("seoAudit.page");
  const locale = useLocale();
  const searchParams = useSearchParams();

  const [phase, setPhase] = useState<"input" | "scanning" | "teaser" | "results">("input");
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [scanStep, setScanStep] = useState(0);
  const [results, setResults] = useState<ScanResults | null>(null);
  const apiResultRef = useRef<ScanResults | null>(null);
  const animDoneRef = useRef(false);

  const totalSteps = 8;

  // Check if both animation and API are done → show teaser
  const maybeShowTeaser = useCallback(() => {
    if (animDoneRef.current && apiResultRef.current) {
      setResults(apiResultRef.current);
      setPhase("teaser");
    }
  }, []);

  const startScan = useCallback(
    async (scanUrl: string, scanEmail: string) => {
      setPhase("scanning");
      setScanStep(0);
      apiResultRef.current = null;
      animDoneRef.current = false;

      // Animate through 8 steps with realistic timing
      let elapsed = 0;
      for (let i = 0; i < totalSteps; i++) {
        setTimeout(() => setScanStep(i + 1), elapsed + LOADING_DURATIONS[i]);
        elapsed += LOADING_DURATIONS[i];
      }
      // Animation done after total time
      setTimeout(() => {
        animDoneRef.current = true;
        maybeShowTeaser();
      }, TOTAL_LOADING_TIME);

      // Call API in parallel
      try {
        const res = await fetch("/api/seo-scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: scanUrl, email: scanEmail }),
        });

        if (res.status === 429) {
          // Rate limited
          apiResultRef.current = null;
          animDoneRef.current = true;
          setPhase("input");
          alert("Vous avez atteint la limite d'audits. Contactez-nous directement.");
          return;
        }

        const data = await res.json();
        apiResultRef.current = data;
        maybeShowTeaser();
      } catch {
        // Use minimal fallback
        apiResultRef.current = null;
        animDoneRef.current = true;
        setPhase("input");
      }
    },
    [maybeShowTeaser]
  );

  // Auto-start scan if URL params present
  useEffect(() => {
    const paramUrl = searchParams.get("url");
    const paramEmail = searchParams.get("email");
    if (paramUrl && paramEmail) {
      setUrl(paramUrl);
      setEmail(paramEmail);
      startScan(paramUrl, paramEmail);
    }
  }, [searchParams, startScan]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!url.trim() || !email.trim()) return;
    startScan(url, email);
  };

  const unlockResults = () => {
    setPhase("results");
  };

  const canSubmit = url.trim() !== "" && email.trim() !== "";

  const inputClass =
    "w-full rounded-xl border border-border bg-background px-5 py-4 text-sm text-foreground placeholder-muted outline-none transition-all focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20";

  return (
    <div className="min-h-screen bg-background px-6 pt-32 pb-20">
      <div className="mx-auto max-w-4xl">
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
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <Logo className="h-10 w-auto" showSubtitle={false} />
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
              <div className="mb-8 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/10">
                  <SearchIcon />
                </div>
              </div>
              <h1 className="mb-3 text-center text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h1>
              <p className="mx-auto mb-10 max-w-lg text-center text-lg text-muted">{t("subtitle")}</p>
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
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
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
              <h2 className="mb-2 text-2xl font-bold tracking-tight">{t("scanning.title")}</h2>
              <p className="mb-10 text-sm text-muted">{url}</p>
              <RadarAnimation />
              <ScanProgress step={scanStep} totalSteps={totalSteps} />
            </motion.div>
          )}

          {/* ─── Phase 3: Teaser (before lead unlock) ─── */}
          {phase === "teaser" && results && (
            <motion.div
              key="teaser"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <h2 className="mb-2 text-center text-2xl font-bold tracking-tight sm:text-3xl">{t("results.title")}</h2>
              <p className="mb-8 text-center text-sm text-muted">{url}</p>

              {/* Screenshot + Score */}
              <div className="mb-8 flex flex-col items-center gap-8 sm:flex-row sm:justify-center">
                {results.screenshot && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="w-64 overflow-hidden rounded-xl border border-border shadow-lg"
                  >
                    <Image
                      src={results.screenshot}
                      alt="Website screenshot"
                      width={320}
                      height={200}
                      className="w-full"
                      unoptimized
                    />
                  </motion.div>
                )}
                <ScoreCircle score={results.globalScore} />
              </div>

              {/* Category score bars */}
              <div className="mb-8 space-y-3">
                <ScoreBar label={t("results.performanceLabel")} score={results.performanceScore} delay={0.3} />
                <ScoreBar label={t("results.seoLabel")} score={results.seoScore} delay={0.4} />
                <ScoreBar label={t("results.accessibilityLabel")} score={results.accessibilityScore} delay={0.5} />
                <ScoreBar label={t("results.bestPracticesLabel")} score={results.bestPracticesScore} delay={0.6} />
                <ScoreBar label={t("results.positioningLabel")} score={results.positioningScore} delay={0.7} />
              </div>

              {/* Key Metrics */}
              <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <MetricCard
                  icon={<SpeedIcon />}
                  value={results.keyMetrics.loadTime}
                  label={t("results.metricLoadTime")}
                  ok={parseFloat(results.keyMetrics.loadTime) <= 2.5}
                  delay={0.4}
                />
                <MetricCard
                  icon={<MobileIcon />}
                  value={results.keyMetrics.mobileReady ? "OK" : "KO"}
                  label={t("results.metricMobile")}
                  ok={results.keyMetrics.mobileReady}
                  delay={0.5}
                />
                <MetricCard
                  icon={<SearchIcon />}
                  value={results.keyMetrics.seoReady ? "OK" : "KO"}
                  label={t("results.metricSeo")}
                  ok={results.keyMetrics.seoReady}
                  delay={0.6}
                />
                <MetricCard
                  icon={<ShieldIcon />}
                  value={results.keyMetrics.isSecure ? "HTTPS" : "HTTP"}
                  label={t("results.metricSecurity")}
                  ok={results.keyMetrics.isSecure}
                  delay={0.7}
                />
              </div>

              {/* Category previews — first item visible, rest blurred */}
              <CategorySection icon={<SpeedIcon />} titleKey="cat.performance" category={results.categories.performance} unlocked={false} delay={0.8} />
              <CategorySection icon={<SearchIcon />} titleKey="cat.seo" category={results.categories.seo} unlocked={false} delay={0.9} />
              <CategorySection icon={<MobileIcon />} titleKey="cat.mobile" category={results.categories.mobile} unlocked={false} delay={1.0} />
              <CategorySection icon={<ShieldIcon />} titleKey="cat.security" category={results.categories.security} unlocked={false} delay={1.1} />

              {/* Unlock CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3, duration: 0.5, ease: EASE }}
                className="mt-8 rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-8 text-center"
              >
                <div className="mb-4 flex justify-center text-[#D4AF37]">
                  <LockIcon />
                </div>
                <h3 className="mb-2 text-xl font-bold">{t("results.unlockTitle")}</h3>
                <p className="mb-6 text-sm text-muted">{t("results.unlockSubtitle")}</p>
                <button
                  onClick={unlockResults}
                  className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-8 py-3 text-sm font-semibold text-background transition-all hover:bg-[#C5A028] hover:shadow-lg hover:shadow-[#D4AF37]/20"
                >
                  {t("results.unlockCta")}
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* ─── Phase 4: Full Results (after unlock) ─── */}
          {phase === "results" && results && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <h2 className="mb-2 text-center text-2xl font-bold tracking-tight sm:text-3xl">{t("results.fullTitle")}</h2>
              <p className="mb-8 text-center text-sm text-muted">{url}</p>

              {/* Screenshot + Score */}
              <div className="mb-8 flex flex-col items-center gap-8 sm:flex-row sm:justify-center">
                {results.screenshot && (
                  <div className="w-64 overflow-hidden rounded-xl border border-border shadow-lg">
                    <Image
                      src={results.screenshot}
                      alt="Website screenshot"
                      width={320}
                      height={200}
                      className="w-full"
                      unoptimized
                    />
                  </div>
                )}
                <ScoreCircle score={results.globalScore} />
              </div>

              {/* Score bars */}
              <div className="mb-8 space-y-3">
                <ScoreBar label={t("results.performanceLabel")} score={results.performanceScore} delay={0.2} />
                <ScoreBar label={t("results.seoLabel")} score={results.seoScore} delay={0.3} />
                <ScoreBar label={t("results.accessibilityLabel")} score={results.accessibilityScore} delay={0.4} />
                <ScoreBar label={t("results.bestPracticesLabel")} score={results.bestPracticesScore} delay={0.5} />
                <ScoreBar label={t("results.positioningLabel")} score={results.positioningScore} delay={0.6} />
              </div>

              {/* Key Metrics */}
              <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <MetricCard
                  icon={<SpeedIcon />}
                  value={results.keyMetrics.loadTime}
                  label={t("results.metricLoadTime")}
                  ok={parseFloat(results.keyMetrics.loadTime) <= 2.5}
                  delay={0.3}
                />
                <MetricCard
                  icon={<MobileIcon />}
                  value={results.keyMetrics.mobileReady ? "OK" : "KO"}
                  label={t("results.metricMobile")}
                  ok={results.keyMetrics.mobileReady}
                  delay={0.4}
                />
                <MetricCard
                  icon={<SearchIcon />}
                  value={results.keyMetrics.seoReady ? "OK" : "KO"}
                  label={t("results.metricSeo")}
                  ok={results.keyMetrics.seoReady}
                  delay={0.5}
                />
                <MetricCard
                  icon={<ShieldIcon />}
                  value={results.keyMetrics.isSecure ? "HTTPS" : "HTTP"}
                  label={t("results.metricSecurity")}
                  ok={results.keyMetrics.isSecure}
                  delay={0.6}
                />
              </div>

              {/* Full category sections — ALL UNLOCKED */}
              <CategorySection icon={<SpeedIcon />} titleKey="cat.performance" category={results.categories.performance} unlocked={true} delay={0.5} />
              <CategorySection icon={<SearchIcon />} titleKey="cat.seo" category={results.categories.seo} unlocked={true} delay={0.6} />
              <CategorySection icon={<MobileIcon />} titleKey="cat.mobile" category={results.categories.mobile} unlocked={true} delay={0.7} />
              <CategorySection icon={<ShieldIcon />} titleKey="cat.security" category={results.categories.security} unlocked={true} delay={0.8} />

              {/* Financial Loss */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9, duration: 0.5, ease: EASE }}
                className="mb-10 rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-6 text-center"
              >
                <p className="mb-1 text-sm font-medium text-[#D4AF37]">{t("results.financialTitle")}</p>
                <p className="text-4xl font-bold text-foreground">
                  {results.financialLoss.toLocaleString("fr-FR")} €
                  <span className="text-lg font-normal text-muted">{t("results.financialPerMonth")}</span>
                </p>
                <p className="mt-2 text-xs text-muted">{t("results.financialDesc")}</p>
              </motion.div>

              {/* Stats row */}
              <div className="mb-10 grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0, duration: 0.5, ease: EASE }}
                  className="rounded-xl border border-border bg-card p-5 text-center"
                >
                  <p className="text-2xl font-bold text-[#D4AF37]">{results.competitors}</p>
                  <p className="mt-1 text-xs text-muted">{t("results.competitors")}</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1, duration: 0.5, ease: EASE }}
                  className="rounded-xl border border-border bg-card p-5 text-center"
                >
                  <p className="text-2xl font-bold text-[#D4AF37]">{results.missingPages}</p>
                  <p className="mt-1 text-xs text-muted">{t("results.missingPages")}</p>
                </motion.div>
              </div>

              {/* Keywords */}
              <div className="mb-10">
                <h3 className="mb-1 text-lg font-semibold">{t("results.keywordsTitle")}</h3>
                <p className="mb-5 text-sm text-muted">{t("results.keywordsSubtitle")}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {results.keywords.map((kw, i) => (
                    <KeywordCard key={kw.keyword} data={kw} index={i} />
                  ))}
                </div>
              </div>

              {/* Final CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.5, ease: EASE }}
                className="rounded-2xl border border-border bg-card p-8 text-center"
              >
                <h3 className="mb-2 text-xl font-bold">{t("results.ctaTitle")}</h3>
                <p className="mb-6 text-sm text-muted">{t("results.ctaSubtitle")}</p>
                <Link
                  href={`/${locale}/request-quote`}
                  className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-8 py-3 text-sm font-semibold text-background transition-all hover:bg-[#C5A028] hover:shadow-lg hover:shadow-[#D4AF37]/20"
                >
                  {t("results.ctaButton")}
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
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
