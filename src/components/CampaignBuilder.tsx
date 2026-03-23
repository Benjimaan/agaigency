"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ScrollReveal from "./ui/ScrollReveal";

/* ───────── constants ───────── */

const STEPS = [
  { id: "client", icon: "👤" },
  { id: "objective", icon: "🎯" },
  { id: "campaign_type", icon: "📢" },
  { id: "keywords", icon: "🔑" },
  { id: "ads", icon: "✍️" },
  { id: "budget", icon: "💰" },
  { id: "targeting", icon: "📍" },
  { id: "summary", icon: "📋" },
];

const OBJECTIVES = ["leads", "traffic", "sales", "awareness", "local"] as const;
const CAMPAIGN_TYPES = ["search", "display", "shopping", "pmax", "video"] as const;
const CLIENT_TYPES = ["local", "pme", "liberal", "startup", "other"] as const;

const MATCH_TYPES = [
  { id: "exact", color: "#0f766e" },
  { id: "phrase", color: "#7c3aed" },
  { id: "broad", color: "#c2410c" },
] as const;

const RECOMMENDED_MAP: Record<string, string> = {
  leads: "search",
  traffic: "search",
  sales: "shopping",
  awareness: "display",
  local: "pmax",
};

const BID_STRATEGIES = ["maximize_clicks", "maximize_conversions", "target_cpa", "manual_cpc"] as const;
const SCHEDULES = ["always", "business", "extended", "custom"] as const;
const DEVICES = ["desktop", "mobile", "tablet"] as const;

/* ───────── helpers ───────── */

type Keyword = { text: string; matchType: string };

interface CampaignData {
  clientName: string;
  clientType: string;
  clientActivity: string;
  clientWebsite: string;
  objective: string;
  campaignType: string;
  keywords: Keyword[];
  newKeyword: string;
  keywordMatchType: string;
  negativeKeywords: string[];
  newNegativeKeyword: string;
  headlines: string[];
  descriptions: string[];
  displayUrl: string;
  dailyBudget: string;
  monthlyBudget: string;
  bidStrategy: string;
  location: string;
  radius: string;
  devices: string[];
  schedule: string;
}

function generateSuggestions(activity: string, location: string): string[] {
  const base = activity.toLowerCase().trim();
  if (!base) return [];
  const loc = location.trim();
  return [
    `${base} ${loc}`.trim(),
    `${base} pas cher`,
    `${base} près de chez moi`,
    `meilleur ${base} ${loc}`.trim(),
    `${base} avis`,
    `${base} tarif`,
    `${base} devis`,
    `${base} professionnel`,
    `prix ${base}`,
    `${base} urgence`,
  ].filter((s) => s.length > 3);
}

function estimateCPC(type: string, objective: string): string {
  const base: Record<string, number> = { local: 0.8, pme: 1.5, liberal: 2.5, startup: 1.2, other: 1.0 };
  const mult: Record<string, number> = { leads: 1.3, traffic: 0.8, sales: 1.5, awareness: 0.5, local: 1.1 };
  return ((base[type] || 1) * (mult[objective] || 1)).toFixed(2);
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

function Chip({ label, onRemove, color = "#D4AF37" }: { label: string; onRemove?: () => void; color?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-medium"
      style={{
        background: `${color}22`,
        border: `1px solid ${color}44`,
        color,
      }}
    >
      {label}
      {onRemove && (
        <span onClick={onRemove} className="cursor-pointer text-base leading-none opacity-70 hover:opacity-100">
          &times;
        </span>
      )}
    </span>
  );
}

function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex items-center" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <span className="absolute bottom-[120%] left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted shadow-lg">
          {text}
        </span>
      )}
    </span>
  );
}

function AdPreview({
  website,
  displayUrl,
  headlines,
  descriptions,
  t,
}: {
  website: string;
  displayUrl: string;
  headlines: string[];
  descriptions: string[];
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-5">
      <div className="mb-1 text-[11px] text-muted">
        {t("ads.sponsored")} · {website || "www.exemple.fr"}
        {displayUrl ? `/${displayUrl}` : ""}
      </div>
      <div className="mb-1.5 text-lg font-bold leading-tight text-[#60a5fa]">
        {headlines.filter(Boolean).join(" | ") || t("ads.previewTitle")}
      </div>
      <div className="text-sm leading-relaxed text-muted">
        {descriptions.filter(Boolean).join(" ") || t("ads.previewDesc")}
      </div>
    </div>
  );
}

/* ───────── slide variants ───────── */

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir < 0 ? 80 : -80, opacity: 0 }),
};

/* ───────── main component ───────── */

export default function CampaignBuilder() {
  const t = useTranslations("campaignBuilder");

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [exported, setExported] = useState(false);

  const [data, setData] = useState<CampaignData>({
    clientName: "",
    clientType: "",
    clientActivity: "",
    clientWebsite: "",
    objective: "",
    campaignType: "",
    keywords: [],
    newKeyword: "",
    keywordMatchType: "phrase",
    negativeKeywords: [],
    newNegativeKeyword: "",
    headlines: ["", "", ""],
    descriptions: ["", ""],
    displayUrl: "",
    dailyBudget: "",
    monthlyBudget: "",
    bidStrategy: "maximize_clicks",
    location: "",
    radius: "30",
    devices: ["desktop", "mobile"],
    schedule: "always",
  });

  const update = <K extends keyof CampaignData>(key: K, val: CampaignData[K]) =>
    setData((prev) => ({ ...prev, [key]: val }));

  const goTo = (target: number) => {
    setDirection(target > step ? 1 : -1);
    setStep(target);
  };

  /* validation */
  const canProceed = (): boolean => {
    switch (step) {
      case 0:
        return !!(data.clientName && data.clientType && data.clientActivity);
      case 1:
        return !!data.objective;
      case 2:
        return !!data.campaignType;
      case 3:
        return data.keywords.length > 0;
      case 4:
        return data.headlines.filter((h) => h.length > 0).length >= 2 && data.descriptions.filter((d) => d.length > 0).length >= 1;
      case 5:
        return !!(data.dailyBudget || data.monthlyBudget);
      case 6:
        return !!data.location;
      default:
        return true;
    }
  };

  /* keyword helpers */
  const addKeyword = (kw?: string) => {
    const keyword = (kw || data.newKeyword).trim();
    if (keyword && !data.keywords.find((k) => k.text === keyword)) {
      update("keywords", [...data.keywords, { text: keyword, matchType: data.keywordMatchType }]);
      update("newKeyword", "");
    }
  };

  const addNegativeKeyword = () => {
    const kw = data.newNegativeKeyword.trim();
    if (kw && !data.negativeKeywords.includes(kw)) {
      update("negativeKeywords", [...data.negativeKeywords, kw]);
      update("newNegativeKeyword", "");
    }
  };

  /* budget calculations */
  const cpc = estimateCPC(data.clientType, data.objective);
  const dailyBudget = data.dailyBudget || (data.monthlyBudget ? (Number(data.monthlyBudget) / 30.4).toFixed(2) : "0");
  const estimatedClicks = Number(dailyBudget) ? Math.round(Number(dailyBudget) / Number(cpc)) : 0;
  const estimatedMonthly = Number(dailyBudget) ? (Number(dailyBudget) * 30.4).toFixed(0) : "0";

  /* export helpers */
  const exportTxt = () => {
    const summary = `CAMPAGNE GOOGLE ADS — ${data.clientName}
${"=".repeat(50)}

CLIENT
Nom: ${data.clientName}
Type: ${t(`client.types.${data.clientType}`)}
Activité: ${data.clientActivity}
Site: ${data.clientWebsite}

OBJECTIF: ${t(`objective.items.${data.objective}`)}
TYPE: ${t(`campaignType.items.${data.campaignType}.label`)}

MOTS-CLÉS:
${data.keywords.map((k) => `  ${t(`keywords.matchTypes.${k.matchType}`)} ${k.text}`).join("\n")}

Mots-clés négatifs:
${data.negativeKeywords.map((n) => `  -${n}`).join("\n") || "  Aucun"}

ANNONCES
Titres: ${data.headlines.filter(Boolean).join(" | ")}
Descriptions: ${data.descriptions.filter(Boolean).join(" | ")}
URL affichée: ${data.clientWebsite}${data.displayUrl ? `/${data.displayUrl}` : ""}

BUDGET
Quotidien: ${dailyBudget}€/jour
Mensuel: ~${estimatedMonthly}€/mois
Stratégie: ${t(`budget.strategies.${data.bidStrategy}.label`)}

CIBLAGE
Zone: ${data.location} (rayon ${data.radius}km)
Appareils: ${data.devices.map((d) => t(`targeting.devices.${d}`)).join(", ")}
Diffusion: ${t(`targeting.schedules.${data.schedule}.label`)}`;

    const blob = new Blob([summary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `campagne-google-ads-${data.clientName.replace(/\s+/g, "-").toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  const exportCsv = () => {
    const csvRows = [["Mot-clé", "Type de correspondance", "Négatif"]];
    data.keywords.forEach((k) => csvRows.push([k.text, k.matchType, "Non"]));
    data.negativeKeywords.forEach((n) => csvRows.push([n, "exact", "Oui"]));
    const csv = csvRows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mots-cles-${data.clientName.replace(/\s+/g, "-").toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ───────── step renders ───────── */

  const renderStep0 = () => (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">{t("client.title")}</h2>
      <p className="mt-1.5 text-sm text-muted">{t("client.desc")}</p>
      <div className="mt-6 grid gap-4">
        <InputField label={t("client.name")} value={data.clientName} onChange={(v) => update("clientName", v)} placeholder={t("client.namePlaceholder")} />
        <InputField label={t("client.activity")} value={data.clientActivity} onChange={(v) => update("clientActivity", v)} placeholder={t("client.activityPlaceholder")} />
        <InputField label={t("client.website")} value={data.clientWebsite} onChange={(v) => update("clientWebsite", v)} placeholder="www.exemple.fr" />
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

  const renderStep3 = () => {
    const suggestions = generateSuggestions(data.clientActivity, data.location || "");
    return (
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t("keywords.title")}</h2>
        <p className="mt-1.5 text-sm text-muted">{t("keywords.desc")}</p>
        <div className="mt-6">
          {/* Match type selector */}
          <div className="mb-3 flex gap-2">
            {MATCH_TYPES.map((mt) => (
              <button
                key={mt.id}
                onClick={() => update("keywordMatchType", mt.id)}
                className="rounded-lg border px-3.5 py-1.5 text-[13px] font-semibold transition-all"
                style={{
                  borderColor: data.keywordMatchType === mt.id ? mt.color : "rgba(255,255,255,0.1)",
                  background: data.keywordMatchType === mt.id ? `${mt.color}22` : "transparent",
                  color: data.keywordMatchType === mt.id ? mt.color : "#808080",
                }}
              >
                <Tooltip text={t(`keywords.matchDescs.${mt.id}`)}>
                  {t(`keywords.matchTypes.${mt.id}`)}
                </Tooltip>
              </button>
            ))}
          </div>

          {/* Add keyword */}
          <div className="mb-4 flex gap-2">
            <div className="flex-1">
              <InputField
                value={data.newKeyword}
                onChange={(v) => update("newKeyword", v)}
                placeholder={t("keywords.addPlaceholder")}
              />
            </div>
            <button
              onClick={() => addKeyword()}
              className="h-[46px] shrink-0 self-start rounded-xl bg-gold px-5 text-sm font-bold text-background transition-colors hover:bg-gold-light"
            >
              {t("keywords.add")}
            </button>
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="mb-5">
              <button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="text-[13px] font-semibold text-gold transition-colors hover:text-gold-light"
              >
                {showSuggestions ? "▾" : "▸"} {t("keywords.suggestionsLabel")} &ldquo;{data.clientActivity}&rdquo;
              </button>
              {showSuggestions && (
                <div className="mt-2.5 flex flex-wrap gap-2 rounded-xl border border-gold/15 bg-gold/[0.04] p-4">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => addKeyword(s)}
                      className="rounded-full border border-border bg-white/[0.04] px-3 py-1 text-[13px] text-foreground/80 transition-all hover:border-gold/40 hover:bg-gold/10"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Added keywords */}
          {data.keywords.length > 0 && (
            <div>
              <label className="text-[13px] font-medium text-muted">
                {t("keywords.added")} ({data.keywords.length})
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {data.keywords.map((kw, i) => {
                  const mt = MATCH_TYPES.find((m) => m.id === kw.matchType);
                  return (
                    <Chip
                      key={i}
                      label={`${kw.text} (${t(`keywords.matchTypes.${kw.matchType}`)})`}
                      color={mt?.color}
                      onRemove={() => update("keywords", data.keywords.filter((_, j) => j !== i))}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Negative keywords */}
          <div className="mt-6 rounded-xl border border-gold/20 bg-gold/[0.04] p-4">
            <div className="mb-1.5 text-sm font-bold text-gold">{t("keywords.negativeTitle")}</div>
            <p className="mb-3 text-[13px] text-muted">{t("keywords.negativeDesc")}</p>
            <div className="flex gap-2">
              <div className="flex-1">
                <InputField
                  value={data.newNegativeKeyword}
                  onChange={(v) => update("newNegativeKeyword", v)}
                  placeholder={t("keywords.negativePlaceholder")}
                />
              </div>
              <button
                onClick={addNegativeKeyword}
                className="h-[46px] shrink-0 self-start rounded-xl border border-border bg-white/[0.04] px-4 text-sm font-semibold text-foreground transition-colors hover:border-gold/30"
              >
                {t("keywords.exclude")}
              </button>
            </div>
            {data.negativeKeywords.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {data.negativeKeywords.map((nk, i) => (
                  <Chip
                    key={i}
                    label={`-${nk}`}
                    color="#ef4444"
                    onRemove={() => update("negativeKeywords", data.negativeKeywords.filter((_, j) => j !== i))}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderStep4 = () => (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">{t("ads.title")}</h2>
      <p className="mt-1.5 text-sm text-muted">{t("ads.desc")}</p>
      <div className="mt-6">
        {/* Preview */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-5">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted">{t("ads.preview")}</div>
          <AdPreview
            website={data.clientWebsite}
            displayUrl={data.displayUrl}
            headlines={data.headlines}
            descriptions={data.descriptions}
            t={t}
          />
        </div>

        {/* Headlines */}
        <div>
          <label className="mb-2 block text-[13px] font-medium text-muted">{t("ads.headlinesLabel")}</label>
          {data.headlines.map((h, i) => (
            <div key={i} className="relative">
              <InputField
                value={h}
                onChange={(v) => {
                  if (v.length <= 30) {
                    const arr = [...data.headlines];
                    arr[i] = v;
                    update("headlines", arr);
                  }
                }}
                placeholder={`${t("ads.headlinePlaceholder")} ${i + 1}${i < 2 ? ` (${t("ads.required")})` : ` (${t("ads.optional")})`}`}
                suffix={`${h.length}/30`}
              />
            </div>
          ))}
          {data.headlines.length < 15 && (
            <button
              onClick={() => update("headlines", [...data.headlines, ""])}
              className="mt-1 text-[13px] font-semibold text-gold hover:text-gold-light"
            >
              + {t("ads.addHeadline")}
            </button>
          )}
        </div>

        {/* Descriptions */}
        <div className="mt-4">
          <label className="mb-2 block text-[13px] font-medium text-muted">{t("ads.descriptionsLabel")}</label>
          {data.descriptions.map((d, i) => (
            <div key={i}>
              <InputField
                value={d}
                onChange={(v) => {
                  if (v.length <= 90) {
                    const arr = [...data.descriptions];
                    arr[i] = v;
                    update("descriptions", arr);
                  }
                }}
                placeholder={`${t("ads.descriptionPlaceholder")} ${i + 1}${i === 0 ? ` (${t("ads.required")})` : ` (${t("ads.optional")})`}`}
                suffix={`${d.length}/90`}
              />
            </div>
          ))}
          {data.descriptions.length < 4 && (
            <button
              onClick={() => update("descriptions", [...data.descriptions, ""])}
              className="mt-1 text-[13px] font-semibold text-gold hover:text-gold-light"
            >
              + {t("ads.addDescription")}
            </button>
          )}
        </div>

        <InputField
          label={t("ads.displayUrlLabel")}
          value={data.displayUrl}
          onChange={(v) => update("displayUrl", v)}
          placeholder={t("ads.displayUrlPlaceholder")}
          prefix="/"
        />

        {/* Tips */}
        <div className="mt-4 rounded-xl border border-gold/15 bg-gold/[0.04] p-4">
          <div className="mb-2 text-sm font-bold text-gold">{t("ads.tipsTitle")}</div>
          <div className="text-[13px] leading-7 text-muted">
            {[0, 1, 2, 3].map((i) => (
              <div key={i}>• {t(`ads.tips.${i}`)}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">{t("budget.title")}</h2>
      <p className="mt-1.5 text-sm text-muted">{t("budget.desc")}</p>
      <div className="mt-6 grid gap-4">
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

        {/* Bid strategy */}
        <div>
          <label className="mb-2.5 block text-[13px] font-medium text-muted">{t("budget.strategyLabel")}</label>
          <div className="grid gap-2.5">
            {BID_STRATEGIES.map((bs) => (
              <SelectCard key={bs} selected={data.bidStrategy === bs} onClick={() => update("bidStrategy", bs)}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-[15px] font-semibold ${data.bidStrategy === bs ? "text-gold" : "text-foreground"}`}>
                      {t(`budget.strategies.${bs}.label`)}
                    </div>
                    <div className="mt-0.5 text-xs text-muted">{t(`budget.strategies.${bs}.desc`)}</div>
                  </div>
                  <span
                    className="rounded-md px-2.5 py-1 text-[11px] font-bold"
                    style={{
                      background:
                        t(`budget.strategies.${bs}.level`) === t("budget.levelBeginner")
                          ? "rgba(34,197,94,0.15)"
                          : t(`budget.strategies.${bs}.level`) === t("budget.levelIntermediate")
                            ? "rgba(251,191,36,0.15)"
                            : "rgba(239,68,68,0.15)",
                      color:
                        t(`budget.strategies.${bs}.level`) === t("budget.levelBeginner")
                          ? "#4ade80"
                          : t(`budget.strategies.${bs}.level`) === t("budget.levelIntermediate")
                            ? "#fbbf24"
                            : "#f87171",
                    }}
                  >
                    {t(`budget.strategies.${bs}.level`)}
                  </span>
                </div>
              </SelectCard>
            ))}
          </div>
        </div>

        {/* Estimates */}
        {Number(dailyBudget) > 0 && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 text-sm font-bold text-gold">{t("budget.estimatesTitle")}</div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-white/[0.03] p-3 text-center">
                <div className="text-2xl font-extrabold text-foreground">~{cpc}€</div>
                <div className="mt-0.5 text-xs text-muted">{t("budget.cpc")}</div>
              </div>
              <div className="rounded-xl bg-white/[0.03] p-3 text-center">
                <div className="text-2xl font-extrabold text-[#4ade80]">~{estimatedClicks}</div>
                <div className="mt-0.5 text-xs text-muted">{t("budget.clicksDay")}</div>
              </div>
              <div className="rounded-xl bg-white/[0.03] p-3 text-center">
                <div className="text-2xl font-extrabold text-gold">{estimatedMonthly}€</div>
                <div className="mt-0.5 text-xs text-muted">{t("budget.monthlyBudget")}</div>
              </div>
            </div>
            <p className="mt-2.5 text-center text-xs text-muted/70">{t("budget.disclaimer")}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">{t("targeting.title")}</h2>
      <p className="mt-1.5 text-sm text-muted">{t("targeting.desc")}</p>
      <div className="mt-6 grid gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr]">
          <InputField
            label={t("targeting.locationLabel")}
            value={data.location}
            onChange={(v) => update("location", v)}
            placeholder={t("targeting.locationPlaceholder")}
          />
          <InputField
            label={t("targeting.radiusLabel")}
            value={data.radius}
            onChange={(v) => update("radius", v)}
            placeholder="30"
            type="number"
            suffix="km"
          />
        </div>

        {/* Devices */}
        <div>
          <label className="mb-2.5 block text-[13px] font-medium text-muted">{t("targeting.devicesLabel")}</label>
          <div className="flex gap-2.5">
            {DEVICES.map((d) => {
              const active = data.devices.includes(d);
              return (
                <button
                  key={d}
                  onClick={() => {
                    const devs = active ? data.devices.filter((x) => x !== d) : [...data.devices, d];
                    update("devices", devs);
                  }}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
                    active ? "border-gold/50 bg-gold/10 text-gold" : "border-border bg-transparent text-muted hover:border-gold/20"
                  }`}
                >
                  {t(`targeting.devices.${d}`)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Schedule */}
        <div>
          <label className="mb-2.5 block text-[13px] font-medium text-muted">{t("targeting.scheduleLabel")}</label>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {SCHEDULES.map((s) => (
              <SelectCard key={s} selected={data.schedule === s} onClick={() => update("schedule", s)}>
                <div className="text-center">
                  <div className={`text-sm font-semibold ${data.schedule === s ? "text-gold" : "text-foreground"}`}>
                    {t(`targeting.schedules.${s}.label`)}
                  </div>
                  <div className="mt-0.5 text-xs text-muted/70">{t(`targeting.schedules.${s}.desc`)}</div>
                </div>
              </SelectCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep7 = () => (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">{t("summary.title")}</h2>
      <p className="mt-1.5 text-sm text-muted">{t("summary.desc")}</p>
      <div className="mt-6 grid gap-4">
        {/* Client */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted">{t("steps.client")}</div>
          <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            <div><span className="text-muted">{t("client.name")} :</span> <span className="font-semibold">{data.clientName}</span></div>
            <div><span className="text-muted">{t("client.typeLabel")} :</span> <span>{data.clientType && t(`client.types.${data.clientType}`)}</span></div>
            <div><span className="text-muted">{t("client.activity")} :</span> <span>{data.clientActivity}</span></div>
            <div><span className="text-muted">{t("client.website")} :</span> <span className="text-gold">{data.clientWebsite}</span></div>
          </div>
        </div>

        {/* Objective + Campaign */}
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

        {/* Keywords */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted">
            {t("steps.keywords")} ({data.keywords.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {data.keywords.map((kw, i) => {
              const mt = MATCH_TYPES.find((m) => m.id === kw.matchType);
              return <Chip key={i} label={`${kw.text} (${t(`keywords.matchTypes.${kw.matchType}`)})`} color={mt?.color} />;
            })}
          </div>
          {data.negativeKeywords.length > 0 && (
            <div className="mt-3">
              <div className="mb-1.5 text-xs text-muted">{t("keywords.negativeTitle")} :</div>
              <div className="flex flex-wrap gap-1.5">
                {data.negativeKeywords.map((nk, i) => (
                  <Chip key={i} label={`-${nk}`} color="#ef4444" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Ad Preview */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted">{t("steps.ads")}</div>
          <AdPreview
            website={data.clientWebsite}
            displayUrl={data.displayUrl}
            headlines={data.headlines}
            descriptions={data.descriptions}
            t={t}
          />
        </div>

        {/* Budget + Targeting */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted">{t("steps.budget")}</div>
            <div className="text-3xl font-extrabold">
              {dailyBudget}€<span className="text-sm font-normal text-muted">/jour</span>
            </div>
            <div className="mt-1 text-[13px] text-muted">≈ {estimatedMonthly}€/mois</div>
            <div className="mt-1 text-xs text-muted/70">
              {t("budget.strategyLabel")} : {t(`budget.strategies.${data.bidStrategy}.label`)}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted">{t("steps.targeting")}</div>
            <div className="text-base font-bold">📍 {data.location}</div>
            <div className="mt-1 text-[13px] text-muted">{t("targeting.radiusLabel")} : {data.radius}km</div>
            <div className="mt-0.5 text-xs text-muted/70">
              {t("targeting.devicesLabel")} : {data.devices.map((d) => t(`targeting.devices.${d}`)).join(", ")}
            </div>
            <div className="mt-0.5 text-xs text-muted/70">
              {t("targeting.scheduleLabel")} : {t(`targeting.schedules.${data.schedule}.label`)}
            </div>
          </div>
        </div>

        {/* Export buttons */}
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            onClick={exportTxt}
            className="rounded-xl bg-gold px-6 py-3 text-sm font-bold text-background transition-colors hover:bg-gold-light"
          >
            {exported ? "✓ Exporté !" : t("summary.exportTxt")}
          </button>
          <button
            onClick={exportCsv}
            className="rounded-xl border border-border bg-white/[0.04] px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-gold/30"
          >
            {t("summary.exportCsv")}
          </button>
        </div>
      </div>
    </div>
  );

  const stepRenderers = [renderStep0, renderStep1, renderStep2, renderStep3, renderStep4, renderStep5, renderStep6, renderStep7];

  return (
    <>
      <Navbar />
      <main className="min-h-screen px-4 pb-20 pt-32">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <ScrollReveal className="mb-10 text-center">
            <span className="mb-4 inline-block rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-medium tracking-wider text-gold uppercase">
              AgaiGency · Google Ads Builder
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
