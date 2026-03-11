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

/* ─── Finding Row ─── */
function FindingRow({
  item,
  index,
  locked,
}: {
  item: AuditItem;
  index: number;
  locked: boolean;
}) {
  const t = useTranslations("seoAudit.audit");

  const statusIcon =
    item.status === "pass" ? "✓" : item.status === "warning" ? "!" : "✗";
  const statusColor =
    item.status === "pass" ? "text-green-400 bg-green-500/10 border-green-500/20" :
    item.status === "warning" ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" :
    "text-red-400 bg-red-500/10 border-red-500/20";
  const borderColor =
    item.status === "pass" ? "border-white/[0.06]" :
    item.status === "warning" ? "border-yellow-500/15" :
    "border-red-500/20";

  let finding: string;
  try { finding = t(item.findingKey, item.findingArgs || {}); } catch { finding = item.findingKey; }
  let impact: string;
  try { impact = t(item.impactKey); } catch { impact = item.impactKey; }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.06, duration: 0.4, ease: EASE }}
      className={`relative rounded-xl border bg-[#121212] p-4 ${borderColor} ${
        locked ? "overflow-hidden" : ""
      }`}
    >
      {locked && (
        <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[6px]">
          <div className="flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-xs font-medium text-white/60">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border text-xs font-bold ${statusColor}`}>
          {statusIcon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-relaxed text-white/80">{finding}</p>
          {!locked && item.status !== "pass" && (
            <p className="mt-2 text-xs leading-relaxed text-white/40">{impact}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Section Group ─── */
function SectionGroup({
  title,
  score,
  items,
  unlocked,
  delay,
}: {
  title: string;
  score: number;
  items: AuditItem[];
  unlocked: boolean;
  delay: number;
}) {
  const t = useTranslations("seoAudit.page.results");
  const failCount = items.filter((i) => i.status === "fail").length;
  const warnCount = items.filter((i) => i.status === "warning").length;
  const scoreColor = score < 30 ? "text-red-400" : score < 50 ? "text-yellow-400" : score < 70 ? "text-[#D4AF37]" : "text-green-400";

  if (items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: EASE }}
      className="mb-8"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold">{title}</h3>
        <span className={`text-sm font-bold ${scoreColor}`}>{score}/100</span>
      </div>

      {/* Problem count */}
      {(failCount > 0 || warnCount > 0) && (
        <div className="mb-3 flex gap-2 text-xs">
          {failCount > 0 && (
            <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-red-400">
              {failCount} {t("problems")}
            </span>
          )}
          {warnCount > 0 && (
            <span className="rounded-full bg-yellow-500/10 px-2.5 py-1 text-yellow-400">
              {warnCount} {t("improvements")}
            </span>
          )}
        </div>
      )}

      <div className="space-y-2">
        {items.map((item, i) => (
          <FindingRow
            key={i}
            item={item}
            index={i}
            locked={!unlocked && i > 0}
          />
        ))}
      </div>

      {!unlocked && items.length > 1 && (
        <p className="mt-2 text-center text-xs text-muted">
          + {items.length - 1} {t("hiddenFindings")}
        </p>
      )}
    </motion.div>
  );
}

/* ─── Keyword Card ─── */
function KeywordCard({ data, index }: { data: { keyword: string; volume: number; difficulty: number }; index: number }) {
  const t = useTranslations("seoAudit.page.results");

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 + index * 0.08, duration: 0.4, ease: EASE }}
      className="rounded-xl border border-[#D4AF37]/15 bg-card p-4"
    >
      <p className="mb-1 text-sm font-semibold text-foreground">{data.keyword}</p>
      <p className="text-xs text-muted">
        {data.volume.toLocaleString()} {t("searchesMonth")}
      </p>
    </motion.div>
  );
}

/* ─── Main ─── */
export default function SeoAuditSimulator() {
  const t = useTranslations("seoAudit.page");
  const tAudit = useTranslations("seoAudit.audit");
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

      let elapsed = 0;
      for (let i = 0; i < totalSteps; i++) {
        setTimeout(() => setScanStep(i + 1), elapsed + LOADING_DURATIONS[i]);
        elapsed += LOADING_DURATIONS[i];
      }
      setTimeout(() => {
        animDoneRef.current = true;
        maybeShowTeaser();
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
        maybeShowTeaser();
      } catch {
        apiResultRef.current = null;
        animDoneRef.current = true;
        setPhase("input");
      }
    },
    [maybeShowTeaser]
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!url.trim() || !email.trim()) return;
    startScan(url, email);
  };

  const canSubmit = url.trim() !== "" && email.trim() !== "";

  const inputClass =
    "w-full rounded-xl border border-border bg-background px-5 py-4 text-sm text-foreground placeholder-muted outline-none transition-all focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20";

  /* ─── Helpers for results rendering ─── */
  const renderResults = (unlocked: boolean) => {
    if (!results) return null;

    const loadTimeSec = parseFloat(results.keyMetrics.loadTime) || 0;
    const totalProblems =
      Object.values(results.categories).reduce(
        (sum, cat) => sum + cat.items.filter((i) => i.status === "fail").length, 0
      );

    return (
      <>
        {/* Header */}
        <h2 className="mb-2 text-center text-2xl font-bold tracking-tight sm:text-3xl">
          {unlocked ? t("results.fullTitle") : t("results.title")}
        </h2>
        <p className="mb-8 text-center text-sm text-muted">{url}</p>

        {/* Score + Screenshot side by side */}
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
            value={loadTimeSec > 0 ? `${loadTimeSec.toFixed(1)}s` : "N/A"}
            label={t("results.cardSpeed")}
            ok={loadTimeSec <= 2.5 && loadTimeSec > 0}
            delay={0.5}
          />
          <ImpactCard
            value={results.keyMetrics.mobileReady ? t("results.cardOk") : t("results.cardKo")}
            label={t("results.cardMobile")}
            ok={results.keyMetrics.mobileReady}
            delay={0.6}
          />
          <ImpactCard
            value={`${totalProblems}`}
            label={t("results.cardProblems")}
            ok={totalProblems === 0}
            delay={0.7}
          />
          <ImpactCard
            value={results.keyMetrics.isSecure ? "HTTPS" : "HTTP"}
            label={t("results.cardSecurity")}
            ok={results.keyMetrics.isSecure}
            delay={0.8}
          />
        </div>

        {/* Findings by section — business language */}
        <SectionGroup
          title={tAudit("section.visitors")}
          score={results.performanceScore}
          items={results.categories.performance.items}
          unlocked={unlocked}
          delay={0.9}
        />
        <SectionGroup
          title={tAudit("section.google")}
          score={results.seoScore}
          items={results.categories.seo.items}
          unlocked={unlocked}
          delay={1.0}
        />
        <SectionGroup
          title={tAudit("section.mobile")}
          score={results.categories.mobile.score}
          items={results.categories.mobile.items}
          unlocked={unlocked}
          delay={1.1}
        />
        <SectionGroup
          title={tAudit("section.trust")}
          score={results.categories.security.score}
          items={results.categories.security.items}
          unlocked={unlocked}
          delay={1.2}
        />

        {/* Teaser: unlock CTA */}
        {!unlocked && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.5, ease: EASE }}
            className="mt-6 rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-8 text-center"
          >
            <h3 className="mb-2 text-lg font-bold">{t("results.unlockTitle")}</h3>
            <p className="mb-5 text-sm text-muted">{t("results.unlockSubtitle")}</p>
            <button
              onClick={() => setPhase("results")}
              className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-8 py-3 text-sm font-semibold text-background transition-all hover:bg-[#C5A028] hover:shadow-lg hover:shadow-[#D4AF37]/20"
            >
              {t("results.unlockCta")}
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </motion.div>
        )}

        {/* Full results: financial + keywords + CTA */}
        {unlocked && (
          <>
            {/* Financial loss */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.3, duration: 0.5, ease: EASE }}
              className="mb-8 rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-6 text-center"
            >
              <p className="mb-1 text-sm font-medium text-[#D4AF37]">{t("results.financialTitle")}</p>
              <p className="text-4xl font-bold text-foreground">
                {results.financialLoss.toLocaleString("fr-FR")} €
                <span className="text-lg font-normal text-muted">{t("results.financialPerMonth")}</span>
              </p>
              <p className="mt-2 text-xs text-muted">{t("results.financialDesc")}</p>
            </motion.div>

            {/* Competitors + missed pages */}
            <div className="mb-8 grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.4, ease: EASE }}
                className="rounded-xl border border-border bg-card p-5 text-center"
              >
                <p className="text-2xl font-bold text-[#D4AF37]">{results.competitors}</p>
                <p className="mt-1 text-xs text-muted">{t("results.competitors")}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.4, ease: EASE }}
                className="rounded-xl border border-border bg-card p-5 text-center"
              >
                <p className="text-2xl font-bold text-[#D4AF37]">{results.missingPages}</p>
                <p className="mt-1 text-xs text-muted">{t("results.missingPages")}</p>
              </motion.div>
            </div>

            {/* Keywords */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.5 }}
              className="mb-10"
            >
              <h3 className="mb-1 text-base font-semibold">{t("results.keywordsTitle")}</h3>
              <p className="mb-4 text-sm text-muted">{t("results.keywordsSubtitle")}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {results.keywords.map((kw, i) => (
                  <KeywordCard key={kw.keyword} data={kw} index={i} />
                ))}
              </div>
            </motion.div>

            {/* Final CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.7, duration: 0.5, ease: EASE }}
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
          </>
        )}
      </>
    );
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

          {/* Phase 3: Teaser */}
          {phase === "teaser" && results && (
            <motion.div
              key="teaser"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              {renderResults(false)}
            </motion.div>
          )}

          {/* Phase 4: Full Results */}
          {phase === "results" && results && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              {renderResults(true)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
