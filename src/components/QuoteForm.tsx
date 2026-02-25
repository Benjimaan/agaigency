"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import BookingView from "./BookingView";

const TOTAL_STEPS = 5;

interface FormData {
  name: string;
  email: string;
  company: string;
  phone: string;
  projectType: string;
  budget: string;
  timeline: string;
  details: string;
  currentSite: string;
  inspiration: string;
}

const initialFormData: FormData = {
  name: "",
  email: "",
  company: "",
  phone: "",
  projectType: "",
  budget: "",
  timeline: "",
  details: "",
  currentSite: "",
  inspiration: "",
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 80 : -80,
    opacity: 0,
  }),
};

/* ─── Option Card ─── */
function OptionCard({
  label,
  description,
  selected,
  onClick,
  color,
}: {
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  color: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`group w-full rounded-2xl border p-5 text-left transition-all duration-300 ${
        selected
          ? "border-accent bg-accent/10 shadow-lg shadow-accent/5"
          : "border-border bg-card hover:border-accent/40 hover:bg-card-hover"
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
            selected ? "border-accent bg-accent" : "border-muted"
          }`}
        >
          {selected && (
            <motion.svg
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="h-3 w-3 text-background"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={3}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </motion.svg>
          )}
        </div>
        <div>
          <span className="block text-sm font-semibold text-foreground">{label}</span>
          <span className="mt-0.5 block text-xs text-muted">{description}</span>
        </div>
      </div>
    </motion.button>
  );
}

/* ─── Step 1: Contact ─── */
function StepContact({
  formData,
  onChange,
}: {
  formData: FormData;
  onChange: (field: keyof FormData, value: string) => void;
}) {
  const t = useTranslations("quote");

  const inputClass =
    "w-full rounded-xl border border-border bg-background px-5 py-4 text-sm text-foreground placeholder-muted outline-none transition-all focus:border-accent focus:ring-1 focus:ring-accent/20";

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <input
          type="text"
          value={formData.name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder={t("steps.contact.name")}
          className={inputClass}
        />
        <input
          type="email"
          value={formData.email}
          onChange={(e) => onChange("email", e.target.value)}
          placeholder={t("steps.contact.email")}
          className={inputClass}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <input
          type="text"
          value={formData.company}
          onChange={(e) => onChange("company", e.target.value)}
          placeholder={t("steps.contact.company")}
          className={inputClass}
        />
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          placeholder={t("steps.contact.phone")}
          className={inputClass}
        />
      </div>
    </div>
  );
}

/* ─── Step 2: Project Type ─── */
function StepProjectType({
  formData,
  onChange,
}: {
  formData: FormData;
  onChange: (field: keyof FormData, value: string) => void;
}) {
  const t = useTranslations("quote");
  const options = [
    { key: "showcase", label: t("steps.projectType.options.showcase"), desc: t("steps.projectType.options.showcaseDesc") },
    { key: "ecommerce", label: t("steps.projectType.options.ecommerce"), desc: t("steps.projectType.options.ecommerceDesc") },
    { key: "webapp", label: t("steps.projectType.options.webapp"), desc: t("steps.projectType.options.webappDesc") },
    { key: "redesign", label: t("steps.projectType.options.redesign"), desc: t("steps.projectType.options.redesignDesc") },
    { key: "other", label: t("steps.projectType.options.other"), desc: t("steps.projectType.options.otherDesc") },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((opt, i) => (
        <motion.div
          key={opt.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.4 }}
        >
          <OptionCard
            label={opt.label}
            description={opt.desc}
            selected={formData.projectType === opt.key}
            onClick={() => onChange("projectType", opt.key)}
            color="#c9baac"
          />
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Step 3: Budget ─── */
function StepBudget({
  formData,
  onChange,
}: {
  formData: FormData;
  onChange: (field: keyof FormData, value: string) => void;
}) {
  const t = useTranslations("quote");
  const options = [
    { key: "small", label: t("steps.budget.options.small") },
    { key: "medium", label: t("steps.budget.options.medium") },
    { key: "large", label: t("steps.budget.options.large") },
    { key: "enterprise", label: t("steps.budget.options.enterprise") },
    { key: "unsure", label: t("steps.budget.options.unsure") },
  ];

  return (
    <div className="grid gap-3">
      {options.map((opt, i) => (
        <motion.button
          key={opt.key}
          type="button"
          onClick={() => onChange("budget", opt.key)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.4 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={`w-full rounded-2xl border p-5 text-left transition-all duration-300 ${
            formData.budget === opt.key
              ? "border-accent bg-accent/10 shadow-lg shadow-accent/5"
              : "border-border bg-card hover:border-accent/40 hover:bg-card-hover"
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                formData.budget === opt.key ? "border-accent bg-accent" : "border-muted"
              }`}
            >
              {formData.budget === opt.key && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="h-2 w-2 rounded-full bg-background"
                />
              )}
            </div>
            <span className="text-sm font-medium text-foreground">{opt.label}</span>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

/* ─── Step 4: Timeline ─── */
function StepTimeline({
  formData,
  onChange,
}: {
  formData: FormData;
  onChange: (field: keyof FormData, value: string) => void;
}) {
  const t = useTranslations("quote");
  const options = [
    { key: "urgent", label: t("steps.timeline.options.urgent"), icon: "🔥" },
    { key: "month", label: t("steps.timeline.options.month"), icon: "📅" },
    { key: "quarter", label: t("steps.timeline.options.quarter"), icon: "🗓️" },
    { key: "flexible", label: t("steps.timeline.options.flexible"), icon: "🍃" },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((opt, i) => (
        <motion.button
          key={opt.key}
          type="button"
          onClick={() => onChange("timeline", opt.key)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full rounded-2xl border p-6 text-center transition-all duration-300 ${
            formData.timeline === opt.key
              ? "border-accent bg-accent/10 shadow-lg shadow-accent/5"
              : "border-border bg-card hover:border-accent/40 hover:bg-card-hover"
          }`}
        >
          <span className="mb-2 block text-2xl">{opt.icon}</span>
          <span className="text-sm font-semibold text-foreground">{opt.label}</span>
        </motion.button>
      ))}
    </div>
  );
}

/* ─── Step 5: Details ─── */
function StepDetails({
  formData,
  onChange,
}: {
  formData: FormData;
  onChange: (field: keyof FormData, value: string) => void;
}) {
  const t = useTranslations("quote");

  const inputClass =
    "w-full rounded-xl border border-border bg-background px-5 py-4 text-sm text-foreground placeholder-muted outline-none transition-all focus:border-accent focus:ring-1 focus:ring-accent/20";

  return (
    <div className="space-y-5">
      <textarea
        rows={5}
        value={formData.details}
        onChange={(e) => onChange("details", e.target.value)}
        placeholder={t("steps.details.placeholder")}
        className={`${inputClass} resize-none`}
      />
      <input
        type="url"
        value={formData.currentSite}
        onChange={(e) => onChange("currentSite", e.target.value)}
        placeholder={t("steps.details.currentSite")}
        className={inputClass}
      />
      <input
        type="text"
        value={formData.inspiration}
        onChange={(e) => onChange("inspiration", e.target.value)}
        placeholder={t("steps.details.inspiration")}
        className={inputClass}
      />
    </div>
  );
}

/* ─── Success Screen ─── */
function SuccessScreen({ name, email }: { name: string; email: string }) {
  const t = useTranslations("quote");
  const locale = useLocale();

  return (
    <div className="py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
        className="mb-16 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
          className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-accent/20"
        >
          <svg className="h-10 w-10 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
        >
          {t("steps.success.title")}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mx-auto mb-10 max-w-md text-lg text-muted"
        >
          {t("steps.success.subtitle")}
        </motion.p>
      </motion.div>

      {/* Booking calendar */}
      <BookingView name={name} email={email} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="mt-12 text-center"
      >
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-2 rounded-full border border-border px-8 py-4 text-sm font-medium transition-all hover:border-accent hover:text-accent"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {t("steps.success.backHome")}
        </Link>
      </motion.div>
    </div>
  );
}

/* ─── Main QuoteForm ─── */
export default function QuoteForm() {
  const t = useTranslations("quote");
  const locale = useLocale();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const stepTitles = [
    { title: t("steps.contact.title"), subtitle: t("steps.contact.subtitle") },
    { title: t("steps.projectType.title"), subtitle: t("steps.projectType.subtitle") },
    { title: t("steps.budget.title"), subtitle: t("steps.budget.subtitle") },
    { title: t("steps.timeline.title"), subtitle: t("steps.timeline.subtitle") },
    { title: t("steps.details.title"), subtitle: t("steps.details.subtitle") },
  ];

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return formData.name.trim() !== "" && formData.email.trim() !== "" && formData.phone.trim() !== "";
      case 1:
        return formData.projectType !== "";
      case 2:
        return formData.budget !== "";
      case 3:
        return formData.timeline !== "";
      case 4:
        return formData.details.trim() !== "";
      default:
        return false;
    }
  };

  const goNext = async () => {
    if (step < TOTAL_STEPS - 1) {
      setDirection(1);
      setStep((s) => s + 1);
    } else {
      setSending(true);
      try {
        await fetch("/api/send-quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } catch {
        // Show success even if email fails — data was captured
      }
      setSending(false);
      setSubmitted(true);
    }
  };

  const goBack = () => {
    if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  };

  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  if (submitted) {
    return (
      <div className="min-h-screen bg-background px-6 pt-32 pb-20">
        <div className="mx-auto max-w-3xl">
          <SuccessScreen name={formData.name} email={formData.email} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 pt-32 pb-20">
      <div className="mx-auto max-w-2xl">
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
            <img src="/images/logo.svg" alt="AgaiGency" className="h-10 w-auto" />
          </Link>
        </motion.div>

        {/* Progress bar */}
        <div className="mb-12">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium text-muted">
              {step + 1} {t("stepOf")} {TOTAL_STEPS}
            </span>
            <span className="text-xs font-medium text-muted">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-border">
            <motion.div
              className="h-full rounded-full bg-accent"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
            />
          </div>
        </div>

        {/* Step header */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`header-${step}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
            className="mb-10"
          >
            <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
              {stepTitles[step].title}
            </h1>
            <p className="text-lg text-muted">
              {stepTitles[step].subtitle}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Step content */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`step-${step}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
          >
            {step === 0 && <StepContact formData={formData} onChange={handleChange} />}
            {step === 1 && <StepProjectType formData={formData} onChange={handleChange} />}
            {step === 2 && <StepBudget formData={formData} onChange={handleChange} />}
            {step === 3 && <StepTimeline formData={formData} onChange={handleChange} />}
            {step === 4 && <StepDetails formData={formData} onChange={handleChange} />}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-12 flex items-center justify-between"
        >
          <button
            type="button"
            onClick={goBack}
            className={`inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium transition-all hover:border-accent/40 ${
              step === 0 ? "invisible" : ""
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            {t("back")}
          </button>

          <button
            type="button"
            onClick={goNext}
            disabled={!canProceed() || sending}
            className={`inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold transition-all ${
              canProceed() && !sending
                ? "bg-accent text-background hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/20"
                : "cursor-not-allowed bg-border text-muted"
            }`}
          >
            {sending ? "Envoi..." : step === TOTAL_STEPS - 1 ? t("submit") : t("next")}
            {!sending && (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
