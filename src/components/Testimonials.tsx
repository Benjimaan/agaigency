"use client";

import { useTranslations } from "next-intl";
import ScrollReveal from "./ui/ScrollReveal";

const testimonials = [
  { key: "client1", avatar: "/images/founder.png", hasAvatar: false, hasHighlight: true },
  { key: "client2", avatar: null, hasAvatar: false, hasHighlight: false },
  { key: "client3", avatar: null, hasAvatar: false, hasHighlight: false },
  { key: "client4", avatar: null, hasAvatar: false, hasHighlight: false },
];

function StarIcon() {
  return (
    <svg className="h-4 w-4 fill-gold" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

export default function Testimonials() {
  const t = useTranslations("testimonials");

  return (
    <section className="px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal className="mb-16 text-center">
          <span className="mb-4 inline-block rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-medium tracking-wider text-gold uppercase">
            {t("badge")}
          </span>
          <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {t("title")}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted">
            {t("subtitle")}
          </p>
        </ScrollReveal>

        {/* Google Reviews CTA */}
        <ScrollReveal className="mb-12 flex justify-center">
          <a
            href="https://share.google/GMpytWzTD9om1P59J"
            target="_blank"
            rel="noopener noreferrer"
            className="gold-glow-hover group inline-flex items-center gap-3 rounded-full border border-gold/30 bg-gold/10 px-6 py-3 text-sm font-medium text-gold transition-all hover:border-gold/50 hover:bg-gold/20"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {t("googleReview")}
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </ScrollReveal>

        <div className="grid gap-8 md:grid-cols-2">
          {testimonials.map((item, i) => (
            <ScrollReveal key={item.key} delay={i * 0.15}>
              <div className="gold-glow-hover relative flex h-full flex-col rounded-2xl border border-border bg-card p-8 transition-all hover:border-gold/20">
                {/* Decorative quote mark */}
                <span className="pointer-events-none absolute top-4 right-6 text-5xl font-serif text-gold/[0.08] leading-none select-none">
                  &ldquo;
                </span>

                {/* Quantified result highlight */}
                {item.hasHighlight && (
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-3 py-1">
                    <svg className="h-4 w-4 text-gold" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                    </svg>
                    <span className="text-xs font-bold text-gold">
                      {t(`items.${item.key}.highlight`)}
                    </span>
                  </div>
                )}

                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, j) => (
                    <StarIcon key={j} />
                  ))}
                </div>
                <p className="mb-6 flex-1 text-sm leading-relaxed text-muted italic">
                  &ldquo;{t(`items.${item.key}.quote`)}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/20 text-sm font-bold text-gold">
                    {t(`items.${item.key}.name`).charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t(`items.${item.key}.name`)}</p>
                    <p className="text-xs text-muted">{t(`items.${item.key}.role`)}</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
