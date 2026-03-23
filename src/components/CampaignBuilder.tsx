"use client";

import { useState, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ScrollReveal from "./ui/ScrollReveal";

/* ───────── constants ───────── */

const STEPS = [
  { id: "client", icon: "👤" },
  { id: "objective", icon: "🎯" },
  { id: "campaign_type", icon: "📢" },
  { id: "budget", icon: "💰" },
  { id: "summary", icon: "📋" },
];

const OBJECTIVES = ["leads", "traffic", "sales", "awareness", "local"] as const;
const CAMPAIGN_TYPES = ["search", "display", "shopping", "pmax", "video"] as const;
const CLIENT_TYPES = ["local", "pme", "liberal", "startup", "other"] as const;

const RECOMMENDED_MAP: Record<string, string> = {
  leads: "search",
  traffic: "search",
  sales: "shopping",
  awareness: "display",
  local: "pmax",
};

/* ───────── helpers ───────── */

interface CampaignData {
  clientName: string;
  clientType: string;
  clientActivity: string;
  clientWebsite: string;
  clientEmail: string;
  objective: string;
  campaignType: string;
  dailyBudget: string;
  monthlyBudget: string;
}

function estimateCPC(type: string, objective: string): number {
  const base: Record<string, number> = { local: 0.8, pme: 1.5, liberal: 2.5, startup: 1.2, other: 1.0 };
  const mult: Record<string, number> = { leads: 1.3, traffic: 0.8, sales: 1.5, awareness: 0.5, local: 1.1 };
  return parseFloat(((base[type] || 1) * (mult[objective] || 1)).toFixed(2));
}

function estimateConversionRate(objective: string): number {
  const rates: Record<string, number> = { leads: 0.035, traffic: 0.02, sales: 0.025, awareness: 0.01, local: 0.04 };
  return rates[objective] || 0.025;
}

/* ───────── sub-components ───────── */

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-1.5 flex gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-1 flex-1 rounded-full transition-all duration-500"
          style={{
            background: i <= current ? "linear-gradient(90deg, #D4AF37, #E8D48B)" : "rgba(255,255,255,0.08)",
          }}
        />
      ))}
    </div>
  );
}

function SelectCard({
  selected,
  onClick,
  children,
  className = "",
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`cursor-pointer rounded-2xl border-2 p-5 transition-all duration-300 ${
        selected
          ? "border-gold/60 bg-gold/[0.08] shadow-[0_0_30px_rgba(212,175,55,0.12)]"
          : "border-border bg-card hover:border-gold/20"
      } ${className}`}
    >
      {children}
    </motion.div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  prefix,
  suffix,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div className="mb-4">
      {label && <label className="mb-1.5 block text-[13px] font-medium tracking-wide text-muted">{label}</label>}
      <div className="relative flex items-center">
        {prefix && <span className="pointer-events-none absolute left-3.5 text-sm text-muted">{prefix}</span>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-border bg-white/[0.04] text-[15px] text-foreground outline-none transition-colors placeholder:text-muted/50 focus:border-gold/50 ${
            prefix ? "pl-8" : "pl-3.5"
          } ${suffix ? "pr-12" : "pr-3.5"} py-3`}
        />
        {suffix && <span className="absolute right-3.5 text-[13px] text-muted">{suffix}</span>}
      </div>
    </div>
  );
}

/* ───────── slide animation ───────── */

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir < 0 ? 80 : -80, opacity: 0 }),
};

/* ───────── main component ───────── */

export default function CampaignBuilder() {
  const t = useTranslations("campaignBuilder");
  const locale = useLocale();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const [data, setData] = useState<CampaignData>({
    clientName: "",
    clientType: "",
    clientActivity: "",
    clientWebsite: "",
    clientEmail: "",
    objective: "",
    campaignType: "",
    dailyBudget: "",
    monthlyBudget: "",
  });

  const leadSentRef = useRef(false);
  const [leadSent, setLeadSent] = useState(false);

  const update = <K extends keyof CampaignData>(key: K, val: CampaignData[K]) =>
    setData((prev) => ({ ...prev, [key]: val }));

  const goTo = (target: number) => {
    setDirection(target > step ? 1 : -1);
    setStep(target);
    // Auto-send lead when arriving at summary step
    if (target === 4 && !leadSentRef.current) {
      leadSentRef.current = true;
      sendLead();
    }
  };

  const sendLead = async () => {
    try {
      const mBudget = Number(data.monthlyBudget) || (data.dailyBudget ? Number(data.dailyBudget) * 30.4 : 0);
      const cpcVal = estimateCPC(data.clientType, data.objective);
      const dBudget = Number(data.dailyBudget) || (data.monthlyBudget ? Number(data.monthlyBudget) / 30.4 : 0);
      const clicksMonth = dBudget ? Math.round(dBudget / cpcVal) * 30 : 0;
      const convR = estimateConversionRate(data.objective);
      const leadsMonth = Math.round(clicksMonth * convR);
      const cpl = leadsMonth > 0 ? (mBudget / leadsMonth).toFixed(0) : "—";

      await fetch("/api/send-campaign-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: data.clientName,
          clientEmail: data.clientEmail,
          clientActivity: data.clientActivity,
          clientWebsite: data.clientWebsite,
          clientType: data.clientType,
          objective: data.objective,
          campaignType: data.campaignType,
          monthlyBudget: mBudget.toFixed(0),
          estimatedClicks: clicksMonth,
          estimatedLeads: leadsMonth,
          costPerLead: cpl,
          cpc: cpcVal,
        }),
      });
      setLeadSent(true);
    } catch {
      // Silent fail — don't block the UX
    }
  };

  /* validation */
  const canProceed = (): boolean => {
    switch (step) {
      case 0:
        return !!(data.clientName && data.clientType && data.clientActivity && data.clientEmail);
      case 1:
        return !!data.objective;
      case 2:
        return !!data.campaignType;
      case 3:
        return !!(data.dailyBudget || data.monthlyBudget);
      default:
        return true;
    }
  };

  /* budget calculations */
  const cpc = estimateCPC(data.clientType, data.objective);
  const dailyBudget = Number(data.dailyBudget) || (data.monthlyBudget ? Number(data.monthlyBudget) / 30.4 : 0);
  const monthlyBudget = Number(data.monthlyBudget) || (data.dailyBudget ? Number(data.dailyBudget) * 30.4 : 0);
  const estimatedClicksDay = dailyBudget ? Math.round(dailyBudget / cpc) : 0;
  const estimatedClicksMonth = estimatedClicksDay * 30;
  const convRate = estimateConversionRate(data.objective);
  const estimatedLeadsMonth = Math.round(estimatedClicksMonth * convRate);
  const costPerLead = estimatedLeadsMonth > 0 ? (monthlyBudget / estimatedLeadsMonth).toFixed(0) : "—";

  /* ───────── Step 0: Client Info ───────── */
  const renderStep0 = () => (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">{t("client.title")}</h2>
      <p className="mt-1.5 text-sm text-muted">{t("client.desc")}</p>
      <div className="mt-6 grid gap-4">
        <InputField label={t("client.name")} value={data.clientName} onChange={(v) => update("clientName", v)} placeholder={t("client.namePlaceholder")} />
        <InputField label={t("client.activity")} value={data.clientActivity} onChange={(v) => update("clientActivity", v)} placeholder={t("client.activityPlaceholder")} />
        <InputField label={t("client.website")} value={data.clientWebsite} onChange={(v) => update("clientWebsite", v)} placeholder="www.exemple.fr" />
        <InputField label={t("client.email")} value={data.clientEmail} onChange={(v) => update("clientEmail", v)} placeholder={t("client.emailPlaceholder")} type="email" />
        <div>
          <label className="mb-2.5 block text-[13px] font-medium text-muted">{t("client.typeLabel")}</label>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
            {CLIENT_TYPES.map((ct) => (
              <SelectCard key={ct} selected={data.clientType === ct} onClick={() => update("clientType", ct)}>
                <div className="text-center">
                  <div className={`text-sm font-semibold ${data.clientType === ct ? "text-gold" : "text-foreground"}`}>
                    {t(`client.types.${ct}`)}
                  </div>
                </div>
              </SelectCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  /* ───────── Step 1: Objective ───────── */
  const renderStep1 = () => (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">{t("objective.title")}</h2>
      <p className="mt-1.5 text-sm text-muted">{t("objective.desc")}</p>
      <div className="mt-6 grid gap-3">
        {OBJECTIVES.map((obj) => (
          <SelectCard key={obj} selected={data.objective === obj} onClick={() => update("objective", obj)}>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className={`text-base font-bold ${data.objective === obj ? "text-gold" : "text-foreground"}`}>
                  {t(`objective.items.${obj}`)}
                </div>
                <div className="mt-0.5 text-[13px] text-muted">{t(`objective.descs.${obj}`)}</div>
              </div>
            </div>
          </SelectCard>
        ))}
      </div>
    </div>
  );

  /* ───────── Step 2: Campaign Type ───────── */
  const renderStep2 = () => (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">{t("campaignType.title")}</h2>
      <p className="mt-1.5 text-sm text-muted">{t("campaignType.desc")}</p>
      <div className="mt-6 grid gap-3">
        {CAMPAIGN_TYPES.map((ct) => {
          const recommended = RECOMMENDED_MAP[data.objective] === ct;
          return (
            <SelectCard key={ct} selected={data.campaignType === ct} onClick={() => update("campaignType", ct)}>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-base font-bold ${data.campaignType === ct ? "text-gold" : "text-foreground"}`}>
                      {t(`campaignType.items.${ct}.label`)}
                    </span>
                    {recommended && (
                      <span className="rounded-md bg-gold/20 px-2 py-0.5 text-[10px] font-bold tracking-wide text-gold">
                        {t("campaignType.recommended")}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-[13px] text-muted">{t(`campaignType.items.${ct}.desc`)}</div>
                  <div className="mt-1 text-xs text-muted/70">{t(`campaignType.items.${ct}.best`)}</div>
                </div>
              </div>
            </SelectCard>
          );
        })}
      </div>
    </div>
  );

  /* ───────── Step 3: Budget & ROI ───────── */
  const renderStep3 = () => (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">{t("budget.title")}</h2>
      <p className="mt-1.5 text-sm text-muted">{t("budget.desc")}</p>
      <div className="mt-6 grid gap-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputField
            label={t("budget.daily")}
            value={data.dailyBudget}
            onChange={(v) => {
              update("dailyBudget", v);
              if (v) update("monthlyBudget", (Number(v) * 30.4).toFixed(0));
            }}
            placeholder="20"
            type="number"
            prefix="€"
            suffix="/jour"
          />
          <InputField
            label={t("budget.monthly")}
            value={data.monthlyBudget}
            onChange={(v) => {
              update("monthlyBudget", v);
              if (v) update("dailyBudget", (Number(v) / 30.4).toFixed(2));
            }}
            placeholder="600"
            type="number"
            prefix="€"
            suffix="/mois"
          />
        </div>

        {/* Budget note */}
        <p className="text-center text-xs text-muted/70 italic">
          {t("budget.budgetNote")}
        </p>

        {/* ROI Estimates */}
        {dailyBudget > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-gold/20 bg-gold/[0.04] p-6"
          >
            <div className="mb-4 text-center">
              <div className="text-sm font-bold uppercase tracking-wider text-gold">{t("budget.roiTitle")}</div>
              <p className="mt-1 text-xs text-muted">{t("budget.roiSubtitle")}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl bg-white/[0.04] p-4 text-center">
                <div className="text-2xl font-extrabold text-foreground">~{cpc}€</div>
                <div className="mt-1 text-xs text-muted">{t("budget.cpc")}</div>
              </div>
              <div className="rounded-xl bg-white/[0.04] p-4 text-center">
                <div className="text-2xl font-extrabold text-foreground">~{estimatedClicksMonth}</div>
                <div className="mt-1 text-xs text-muted">{t("budget.clicksMonth")}</div>
              </div>
              <div className="rounded-xl bg-white/[0.04] p-4 text-center">
                <div className="text-2xl font-extrabold text-gold">~{estimatedLeadsMonth}</div>
                <div className="mt-1 text-xs text-muted">{t("budget.leadsMonth")}</div>
              </div>
              <div className="rounded-xl bg-white/[0.04] p-4 text-center">
                <div className="text-2xl font-extrabold text-[#4ade80]">{costPerLead}€</div>
                <div className="mt-1 text-xs text-muted">{t("budget.costPerLead")}</div>
              </div>
            </div>
            <p className="mt-3 text-center text-[11px] text-muted/60">{t("budget.disclaimer")}</p>
          </motion.div>
        )}
      </div>
    </div>
  );

  /* ───────── Step 4: Summary + CTA ───────── */
  const renderStep4 = () => (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">{t("summary.title")}</h2>
      <p className="mt-1.5 text-sm text-muted">{t("summary.desc")}</p>
      <div className="mt-6 grid gap-4">
        {/* Client recap */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted">{t("steps.client")}</div>
          <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            <div><span className="text-muted">{t("client.name")} :</span> <span className="font-semibold">{data.clientName}</span></div>
            <div><span className="text-muted">{t("client.typeLabel")} :</span> <span>{data.clientType && t(`client.types.${data.clientType}`)}</span></div>
            <div><span className="text-muted">{t("client.activity")} :</span> <span>{data.clientActivity}</span></div>
            <div><span className="text-muted">{t("client.website")} :</span> <span className="text-gold">{data.clientWebsite}</span></div>
          </div>
        </div>

        {/* Strategy recap */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted">{t("steps.objective")}</div>
            <div className="text-lg font-bold">{data.objective && t(`objective.items.${data.objective}`)}</div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted">{t("steps.campaign_type")}</div>
            <div className="text-lg font-bold">{data.campaignType && t(`campaignType.items.${data.campaignType}.label`)}</div>
          </div>
        </div>

        {/* Budget + ROI recap */}
        <div className="rounded-2xl border border-gold/20 bg-gold/[0.04] p-5">
          <div className="mb-3 text-[11px] font-bold uppercase tracking-widest text-gold">{t("summary.investmentTitle")}</div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-extrabold">{monthlyBudget.toFixed(0)}€<span className="text-sm font-normal text-muted">/mois</span></div>
              <div className="text-xs text-muted">{t("budget.monthly")}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-extrabold text-foreground">~{estimatedClicksMonth}</div>
              <div className="text-xs text-muted">{t("budget.clicksMonth")}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-extrabold text-gold">~{estimatedLeadsMonth}</div>
              <div className="text-xs text-muted">{t("budget.leadsMonth")}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-extrabold text-[#4ade80]">{costPerLead}€</div>
              <div className="text-xs text-muted">{t("budget.costPerLead")}</div>
            </div>
          </div>
        </div>

        {/* CTA block */}
        <div className="mt-4 rounded-2xl border border-gold/30 bg-gradient-to-b from-gold/[0.08] to-transparent p-8 text-center">
          <div className="mb-2 text-sm font-bold uppercase tracking-wider text-gold">{t("summary.ctaBadge")}</div>
          <h3 className="mb-3 text-2xl font-bold tracking-tight">{t("summary.ctaTitle")}</h3>
          <p className="mx-auto mb-6 max-w-md text-sm text-muted">{t("summary.ctaDesc")}</p>
          <a
            href={`/${locale}#contact`}
            className="gold-glow-hover inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3.5 text-sm font-bold text-background transition-all hover:bg-gold-light"
          >
            {t("summary.ctaButton")}
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
          {leadSent && (
            <p className="mt-3 text-xs text-[#4ade80]">{t("summary.emailSent")}</p>
          )}
          <p className="mt-2 text-xs text-muted/60">{t("summary.ctaReassurance")}</p>
        </div>
      </div>
    </div>
  );

  const stepRenderers = [renderStep0, renderStep1, renderStep2, renderStep3, renderStep4];

  return (
    <>
      <Navbar />
      <main className="min-h-screen px-4 pb-20 pt-32">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <ScrollReveal className="mb-10 text-center">
            <span className="mb-4 inline-block rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-medium tracking-wider text-gold uppercase">
              AgaiGency · Google Ads
            </span>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("pageTitle")}</h1>
            <p className="mx-auto mt-2 max-w-xl text-muted">{t("pageSubtitle")}</p>
          </ScrollReveal>

          {/* Progress */}
          <ProgressBar current={step} total={STEPS.length} />
          <div className="mb-8 flex justify-between overflow-x-auto pb-1">
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => (i <= step ? goTo(i) : undefined)}
                className={`flex flex-col items-center gap-1 px-1 py-1 transition-opacity ${
                  i <= step ? "cursor-pointer opacity-100" : "cursor-default opacity-30"
                }`}
              >
                <span className="text-lg">{s.icon}</span>
                <span className={`whitespace-nowrap text-[10px] font-semibold ${i === step ? "text-gold" : "text-muted"}`}>
                  {t(`steps.${s.id}`)}
                </span>
              </button>
            ))}
          </div>

          {/* Step content */}
          <div className="relative min-h-[400px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {stepRenderers[step]()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between gap-3">
            {step > 0 ? (
              <button
                onClick={() => goTo(step - 1)}
                className="rounded-xl border border-border bg-white/[0.04] px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-gold/30"
              >
                ← {t("prev")}
              </button>
            ) : (
              <div />
            )}
            {step < STEPS.length - 1 && (
              <button
                onClick={() => canProceed() && goTo(step + 1)}
                className={`rounded-xl bg-gold px-6 py-3 text-sm font-bold text-background transition-all ${
                  canProceed() ? "cursor-pointer hover:bg-gold-light" : "cursor-not-allowed opacity-40"
                }`}
              >
                {t("next")} →
              </button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
