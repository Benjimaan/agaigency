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
    <div className="relative mx-auto h-40 w-40">
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
    </div>
  );
}

/* ─── 8-Step Loading ─── */
const LOADING_DURATIONS = [800, 1500, 1500, 1200, 1000, 1200, 800, 1000];
const TOTAL_LOADING_TIME = LOADING_DURATIONS.reduce((a, b) => a + b, 0);

function ScanProgress({ step, totalSteps }: { step: number; totalSteps: number }) {
  const t = useTranslations("seoAudit.page.scanning");
  const steps = Array.from({ length: totalSteps }, (_, i) => t(`step${i + 1}`));

  return (
    <div className="mt-8 space-y-3">
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
function ScoreCircle({ score }: { score: number }) {
  const t = useTranslations("seoAudit.page.results");
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const scoreColor = score < 30 ? "#ef4444" : score < 50 ? "#f59e0b" : score < 70 ? "#D4AF37" : "#22c55e";

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-44 w-44">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 176 176">
          <circle cx="88" cy="88" r={radius} fill="none" stroke="#262626" strokeWidth="8" />
          <motion.circle
            cx="88"
            cy="88"
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
            className="text-5xl font-bold"
            style={{ color: scoreColor }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8, ease: EASE }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-muted">{t("scoreOut")}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Verdict Banner ─── */
function VerdictBanner({ score }: { score: number }) {
  const t = useTranslations("seoAudit.page.results");

  const verdictKey =
    score < 30 ? "verdictCritical" : score < 50 ? "verdictWeak" : score < 70 ? "verdictOk" : "verdictGood";
  const borderColor =
    score < 30 ? "border-red-500/30" : score < 50 ? "border-yellow-500/30" : score < 70 ? "border-[#D4AF37]/30" : "border-green-500/30";
  const bgColor =
    score < 30 ? "bg-red-500/5" : score < 50 ? "bg-yellow-500/5" : score < 70 ? "bg-[#D4AF37]/5" : "bg-green-500/5";
  const textColor =
    score < 30 ? "text-red-300" : score < 50 ? "text-yellow-300" : score < 70 ? "text-[#D4AF37]" : "text-green-300";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0, duration: 0.5, ease: EASE }}
      className={`rounded-xl border ${borderColor} ${bgColor} p-5`}
    >
      <p className={`text-center text-sm font-medium leading-relaxed ${textColor}`}>
        {t(verdictKey)}
      </p>
    </motion.div>
  );
}

/* ─── Impact Card (simple metric) ─── */
function ImpactCard({
  value,
  label,
  ok,
  delay,
}: {
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
      className={`rounded-xl border p-4 text-center ${
        ok ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"
      }`}
    >
      <p className={`text-xl font-bold ${ok ? "text-green-400" : "text-red-400"}`}>{value}</p>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </motion.div>
  );
}

/* ─── Top Issue Row (simplified) ─── */
function TopIssueRow({ item, index }: { item: AuditItem; index: number }) {
  const t = useTranslations("seoAudit.audit");

  const statusIcon = item.status === "fail" ? "!" : "!";
  const statusColor = item.status === "fail"
    ? "text-red-400 bg-red-500/10 border-red-500/20"
    : "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
  const borderColor = item.status === "fail" ? "border-red-500/20" : "border-yellow-500/15";

  let finding: string;
  try { finding = t(item.findingKey, item.findingArgs || {}); } catch { finding = item.findingKey; }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.08, duration: 0.4, ease: EASE }}
      className={`rounded-xl border bg-[#121212] p-4 ${borderColor}`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border text-xs font-bold ${statusColor}`}>
          {statusIcon}
        </div>
        <p className="text-sm leading-relaxed text-white/80">{finding}</p>
      </div>
    </motion.div>
  );
}

/* ─── Budget Tier Card ─── */
interface BudgetTier {
  key: string;
  monthly: number;
  recommended?: boolean;
}

function BudgetTierCard({
  tier,
  selected,
  onSelect,
  delay,
}: {
  tier: BudgetTier;
  selected: boolean;
  onSelect: () => void;
  delay: number;
}) {
  const t = useTranslations("seoAudit.page.strategy");

  const isRecommended = tier.recommended;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: EASE }}
      onClick={onSelect}
      className={`relative w-full rounded-2xl border p-5 text-left transition-all ${
        selected
          ? "border-[#D4AF37] bg-[#D4AF37]/10 shadow-lg shadow-[#D4AF37]/10"
          : "border-border bg-card hover:border-white/20"
      }`}
    >
      {isRecommended && (
        <div className="absolute -top-3 right-4 rounded-full bg-[#D4AF37] px-3 py-0.5 text-[10px] font-bold text-black uppercase tracking-wider">
          {t("recommended")}
        </div>
      )}

      <h4 className={`text-base font-bold ${selected ? "text-[#D4AF37]" : "text-foreground"}`}>
        {t(`${tier.key}.name`)}
      </h4>
      <p className="mt-1 text-xs text-muted leading-relaxed">
        {t(`${tier.key}.desc`)}
      </p>

      <div className="mt-4 flex items-baseline gap-1">
        <span className={`text-2xl font-bold ${selected ? "text-[#D4AF37]" : "text-foreground"}`}>
          {tier.monthly.toLocaleString("fr-FR")} €
        </span>
        <span className="text-xs text-muted">{t("perMonth")}</span>
      </div>

      {/* What's included */}
      <ul className="mt-4 space-y-2">
        {[1, 2, 3, 4].map((i) => {
          let feature: string;
          try { feature = t(`${tier.key}.feature${i}`); } catch { return null; }
          if (!feature) return null;
          return (
            <li key={i} className="flex items-start gap-2 text-xs text-white/60">
              <svg className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              {feature}
            </li>
          );
        })}
      </ul>

      {/* Selection indicator */}
      <div className={`mt-4 flex items-center justify-center rounded-lg py-2 text-xs font-semibold transition-all ${
        selected ? "bg-[#D4AF37] text-black" : "bg-white/5 text-muted"
      }`}>
        {selected ? t("selected") : t("select")}
      </div>
    </motion.button>
  );
}

/* ─── ROI Projection ─── */
function RoiProjection({
  tier,
  score,
  financialLoss,
}: {
  tier: BudgetTier;
  score: number;
  financialLoss: number;
}) {
  const t = useTranslations("seoAudit.page.roi");

  // ROI computation based on tier + current score
  // Lower score = more room for improvement = higher ROI
  const improvementFactor = score < 30 ? 3.5 : score < 50 ? 2.5 : score < 70 ? 1.8 : 1.3;
  const tierMultiplier = tier.key === "essential" ? 1 : tier.key === "growth" ? 1.8 : 2.8;

  const monthlyInvestment = tier.monthly;
  const estimatedLeadsPerMonth = Math.round(
    (tierMultiplier * improvementFactor * 3) + (tier.key === "performance" ? 10 : tier.key === "growth" ? 5 : 2)
  );
  const estimatedTrafficIncrease = Math.round(tierMultiplier * improvementFactor * 25);
  const estimatedRevenue = Math.round(financialLoss * tierMultiplier * 0.6);
  const roi = estimatedRevenue > 0 ? Math.round((estimatedRevenue / monthlyInvestment) * 100) / 100 : 0;

  const projections = [
    {
      label: t("trafficIncrease"),
      value: `+${estimatedTrafficIncrease}%`,
      sub: t("over6months"),
    },
    {
      label: t("leadsPerMonth"),
      value: `${estimatedLeadsPerMonth}`,
      sub: t("qualifiedLeads"),
    },
    {
      label: t("estimatedRevenue"),
      value: `${estimatedRevenue.toLocaleString("fr-FR")} €`,
      sub: t("perMonthExtra"),
    },
    {
      label: t("returnOnInvestment"),
      value: `${roi}x`,
      sub: t("roiExplanation"),
    },
  ];

  return (
    <motion.div
      key={tier.key}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
    >
      {/* Header */}
      <div className="mb-6 rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-5 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-[#D4AF37]">{t("investmentLabel")}</p>
        <p className="mt-1 text-3xl font-bold text-foreground">
          {monthlyInvestment.toLocaleString("fr-FR")} €<span className="text-base font-normal text-muted">/mois</span>
        </p>
      </div>

      {/* Simulation grid */}
      <div className="mb-6 text-center">
        <p className="mb-4 text-sm font-semibold text-[#D4AF37]">{t("simulationTitle")}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {projections.map((proj, i) => (
          <motion.div
            key={proj.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08, duration: 0.4, ease: EASE }}
            className="rounded-xl border border-border bg-card p-4 text-center"
          >
            <p className="text-2xl font-bold text-[#D4AF37]">{proj.value}</p>
            <p className="mt-1 text-xs font-medium text-foreground">{proj.label}</p>
            <p className="mt-0.5 text-[10px] text-muted">{proj.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* ROI summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-6 rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-5"
      >
        <p className="text-center text-sm leading-relaxed text-white/70">
          {t("roiSummary", {
            investment: monthlyInvestment.toLocaleString("fr-FR"),
            revenue: estimatedRevenue.toLocaleString("fr-FR"),
            roi: roi.toString(),
          })}
        </p>
      </motion.div>
    </motion.div>
  );
}

/* ─── 3-Month Timeline ─── */
function Timeline() {
  const t = useTranslations("seoAudit.page.timeline");

  const months = [
    { key: "month1", icon: "M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611l-.772.13A18.142 18.142 0 0112 21a18.142 18.142 0 01-7.363-1.557l-.772-.13c-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" },
    { key: "month2", icon: "M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" },
    { key: "month3", icon: "M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" },
  ];

  return (
    <div className="space-y-3">
      {months.map((month, i) => (
        <motion.div
          key={month.key}
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 + i * 0.12, duration: 0.4, ease: EASE }}
          className="flex gap-4 rounded-xl border border-border bg-card p-4"
        >
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#D4AF37]/10">
            <svg className="h-5 w-5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d={month.icon} />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">{t(`${month.key}.title`)}</h4>
            <p className="mt-0.5 text-xs text-muted leading-relaxed">{t(`${month.key}.desc`)}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Main ─── */
export default function SeoAuditSimulator() {
  const t = useTranslations("seoAudit.page");
  const locale = useLocale();
  const searchParams = useSearchParams();

  const [phase, setPhase] = useState<"input" | "scanning" | "results">("input");
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [scanStep, setScanStep] = useState(0);
  const [results, setResults] = useState<ScanResults | null>(null);
  const [selectedTier, setSelectedTier] = useState<string>("growth");
  const apiResultRef = useRef<ScanResults | null>(null);
  const animDoneRef = useRef(false);
  const totalSteps = 8;

  const maybeShowResults = useCallback(() => {
    if (animDoneRef.current && apiResultRef.current) {
      setResults(apiResultRef.current);
      setPhase("results");
    }
  }, []);

  const startScan = useCallback(
    async (scanUrl: string, scanEmail: string) => {
      setPhase("scanning");
      setScanStep(0);
      apiResultRef.current = null;
      animDoneRef.current = false;

      let elapsed = 0;
      for (let i = 0; i < totalSteps; i++) {
        setTimeout(() => setScanStep(i + 1), elapsed + LOADING_DURATIONS[i]);
        elapsed += LOADING_DURATIONS[i];
      }
      setTimeout(() => {
        animDoneRef.current = true;
        maybeShowResults();
      }, TOTAL_LOADING_TIME);

      try {
        const res = await fetch("/api/seo-scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: scanUrl, email: scanEmail }),
        });
        if (res.status === 429) {
          apiResultRef.current = null;
          animDoneRef.current = true;
          setPhase("input");
          return;
        }
        const data = await res.json();
        apiResultRef.current = data;
        maybeShowResults();
      } catch {
        apiResultRef.current = null;
        animDoneRef.current = true;
        setPhase("input");
      }
    },
    [maybeShowResults]
  );

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

  /* ─── Budget tiers based on score ─── */
  const getBudgetTiers = (score: number): BudgetTier[] => {
    // Adjust pricing based on how much work is needed
    const base = score < 40 ? 1.3 : score < 60 ? 1.0 : 0.8;
    return [
      { key: "essential", monthly: Math.round(500 * base / 50) * 50, recommended: false },
      { key: "growth", monthly: Math.round(1000 * base / 50) * 50, recommended: true },
      { key: "performance", monthly: Math.round(2000 * base / 50) * 50, recommended: false },
    ];
  };

  /* ─── Top issues extraction ─── */
  const getTopIssues = (): AuditItem[] => {
    if (!results) return [];
    const allItems = [
      ...results.categories.performance.items,
      ...results.categories.seo.items,
      ...results.categories.mobile.items,
      ...results.categories.security.items,
    ];
    // Get fails first, then warnings, max 5
    const fails = allItems.filter((i) => i.status === "fail");
    const warnings = allItems.filter((i) => i.status === "warning");
    return [...fails, ...warnings].slice(0, 5);
  };

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
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <Logo className="h-10 w-auto" showSubtitle={false} />
          </Link>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Phase 1: Input */}
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
                  <svg className="h-8 w-8 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
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

          {/* Phase 2: Scanning */}
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
              <p className="mb-8 text-sm text-muted">{url}</p>
              <RadarAnimation />
              <ScanProgress step={scanStep} totalSteps={totalSteps} />
            </motion.div>
          )}

          {/* Phase 3: Full Results (diagnostic + strategy + ROI + CTA) */}
          {phase === "results" && results && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              {/* ═══ Section 1: Diagnostic ═══ */}
              <h2 className="mb-2 text-center text-2xl font-bold tracking-tight sm:text-3xl">
                {t("results.title")}
              </h2>
              <p className="mb-8 text-center text-sm text-muted">{url}</p>

              {/* Score + Screenshot */}
              <div className="mb-6 flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
                {results.screenshot && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="w-56 overflow-hidden rounded-xl border border-border shadow-lg"
                  >
                    <Image
                      src={results.screenshot}
                      alt="Aperçu du site"
                      width={280}
                      height={175}
                      className="w-full"
                      unoptimized
                    />
                  </motion.div>
                )}
                <ScoreCircle score={results.globalScore} />
              </div>

              {/* Verdict */}
              <div className="mb-6">
                <VerdictBanner score={results.globalScore} />
              </div>

              {/* 4 Impact Cards */}
              <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <ImpactCard
                  value={parseFloat(results.keyMetrics.loadTime) > 0 ? results.keyMetrics.loadTime : "N/A"}
                  label={t("results.cardSpeed")}
                  ok={parseFloat(results.keyMetrics.loadTime) <= 2.5 && parseFloat(results.keyMetrics.loadTime) > 0}
                  delay={0.5}
                />
                <ImpactCard
                  value={results.keyMetrics.mobileReady ? t("results.cardOk") : t("results.cardKo")}
                  label={t("results.cardMobile")}
                  ok={results.keyMetrics.mobileReady}
                  delay={0.6}
                />
                <ImpactCard
                  value={`${Object.values(results.categories).reduce((sum, cat) => sum + cat.items.filter((i) => i.status === "fail").length, 0)}`}
                  label={t("results.cardProblems")}
                  ok={Object.values(results.categories).reduce((sum, cat) => sum + cat.items.filter((i) => i.status === "fail").length, 0) === 0}
                  delay={0.7}
                />
                <ImpactCard
                  value={results.keyMetrics.isSecure ? "HTTPS" : "HTTP"}
                  label={t("results.cardSecurity")}
                  ok={results.keyMetrics.isSecure}
                  delay={0.8}
                />
              </div>

              {/* Top Issues */}
              {getTopIssues().length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                  className="mb-10"
                >
                  <h3 className="mb-4 text-lg font-semibold">{t("results.issuesTitle")}</h3>
                  <div className="space-y-2">
                    {getTopIssues().map((item, i) => (
                      <TopIssueRow key={i} item={item} index={i} />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Financial impact */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1, duration: 0.5, ease: EASE }}
                className="mb-12 rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-6 text-center"
              >
                <p className="mb-1 text-sm font-medium text-[#D4AF37]">{t("results.financialTitle")}</p>
                <p className="text-4xl font-bold text-foreground">
                  {results.financialLoss.toLocaleString("fr-FR")} €
                  <span className="text-lg font-normal text-muted">{t("results.financialPerMonth")}</span>
                </p>
                <p className="mt-2 text-xs text-muted">{t("results.financialDesc")}</p>
              </motion.div>

              {/* ═══ Divider ═══ */}
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 1.3, duration: 0.6, ease: EASE }}
                className="mb-12 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent"
              />

              {/* ═══ Section 2: Strategy ═══ */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.5, ease: EASE }}
                className="mb-8 text-center"
              >
                <p className="mb-2 text-xs font-medium uppercase tracking-widest text-[#D4AF37]">
                  {t("strategy.badge")}
                </p>
                <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {t("strategy.title")}
                </h3>
                <p className="mx-auto mt-3 max-w-lg text-sm text-muted leading-relaxed">
                  {t("strategy.subtitle")}
                </p>
              </motion.div>

              {/* Budget Tiers */}
              <div className="mb-10 grid gap-4 sm:grid-cols-3">
                {getBudgetTiers(results.globalScore).map((tier, i) => (
                  <BudgetTierCard
                    key={tier.key}
                    tier={tier}
                    selected={selectedTier === tier.key}
                    onSelect={() => setSelectedTier(tier.key)}
                    delay={1.5 + i * 0.1}
                  />
                ))}
              </div>

              {/* ═══ Section 3: ROI Projection ═══ */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8, duration: 0.5, ease: EASE }}
                className="mb-8 text-center"
              >
                <h3 className="text-xl font-bold">{t("roi.title")}</h3>
                <p className="mt-2 text-sm text-muted">{t("roi.subtitle")}</p>
              </motion.div>

              <div className="mb-12">
                <RoiProjection
                  tier={getBudgetTiers(results.globalScore).find((t) => t.key === selectedTier)!}
                  score={results.globalScore}
                  financialLoss={results.financialLoss}
                />
              </div>

              {/* ═══ Section 4: Timeline ═══ */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.0, duration: 0.5, ease: EASE }}
                className="mb-8"
              >
                <h3 className="mb-4 text-lg font-bold text-center">{t("timeline.title")}</h3>
                <Timeline />
              </motion.div>

              {/* ═══ Divider ═══ */}
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 2.2, duration: 0.6, ease: EASE }}
                className="my-12 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent"
              />

              {/* ═══ Section 5: Final CTA ═══ */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.3, duration: 0.5, ease: EASE }}
                className="rounded-2xl border border-border bg-card p-8 text-center"
              >
                <div className="mb-4 flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D4AF37]/10">
                    <svg className="h-6 w-6 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-bold">{t("results.ctaTitle")}</h3>
                <p className="mb-6 text-sm text-muted leading-relaxed">{t("results.ctaSubtitle")}</p>
                <Link
                  href={`/${locale}/request-quote`}
                  className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-8 py-3 text-sm font-semibold text-background transition-all hover:bg-[#C5A028] hover:shadow-lg hover:shadow-[#D4AF37]/20"
                >
                  {t("results.ctaButton")}
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                <p className="mt-3 text-xs text-muted">{t("results.ctaFree")}</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
