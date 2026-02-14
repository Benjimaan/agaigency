"use client";

import { useTranslations } from "next-intl";
import ScrollReveal from "./ui/ScrollReveal";

export default function Contact() {
  const t = useTranslations("contact");

  return (
    <section id="contact" className="px-6 py-32">
      <div className="mx-auto max-w-4xl">
        <ScrollReveal className="mb-16 text-center">
          <span className="mb-4 inline-block rounded-full border border-border px-4 py-1.5 text-xs font-medium tracking-wider text-accent uppercase">
            {t("badge")}
          </span>
          <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {t("title")}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted">
            {t("subtitle")}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="space-y-6 rounded-3xl border border-border bg-card p-8 sm:p-12"
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <input
                  type="text"
                  placeholder={t("form.name")}
                  className="w-full rounded-xl border border-border bg-background px-5 py-4 text-sm text-foreground placeholder-muted outline-none transition-colors focus:border-accent"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder={t("form.email")}
                  className="w-full rounded-xl border border-border bg-background px-5 py-4 text-sm text-foreground placeholder-muted outline-none transition-colors focus:border-accent"
                />
              </div>
            </div>
            <div>
              <textarea
                rows={6}
                placeholder={t("form.message")}
                className="w-full resize-none rounded-xl border border-border bg-background px-5 py-4 text-sm text-foreground placeholder-muted outline-none transition-colors focus:border-accent"
              />
            </div>
            <div className="text-center">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-10 py-4 text-sm font-semibold text-background transition-all hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/20"
              >
                {t("form.send")}
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
                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                  />
                </svg>
              </button>
            </div>
          </form>
        </ScrollReveal>
      </div>
    </section>
  );
}
