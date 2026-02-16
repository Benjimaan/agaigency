"use client";

import { useTranslations } from "next-intl";
import ScrollReveal from "./ui/ScrollReveal";

const testimonials = [
  { key: "client1", avatar: "/images/founder.png", hasAvatar: false },
  { key: "client2", avatar: null, hasAvatar: false },
  { key: "client3", avatar: null, hasAvatar: false },
  { key: "client4", avatar: null, hasAvatar: false },
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

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((item, i) => (
            <ScrollReveal key={item.key} delay={i * 0.15}>
              <div className="gold-glow-hover relative flex h-full flex-col rounded-2xl border border-border bg-card p-8 transition-all hover:border-gold/20">
                {/* Decorative quote mark */}
                <span className="pointer-events-none absolute top-4 right-6 text-5xl font-serif text-gold/[0.08] leading-none select-none">
                  &ldquo;
                </span>

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
