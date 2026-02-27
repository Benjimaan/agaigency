"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { track } from "@vercel/analytics/react";
import { splitTextIntoLines } from "@/lib/splitText";

export default function Hero() {
  const t = useTranslations("hero");
  const locale = useLocale();
  const title = t("title");

  // Refs for GSAP targets
  const sectionRef = useRef<HTMLElement>(null);
  const dotGridRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const goldLineRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollDotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Master timeline — fires on page load
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      // 1. Canvas fade in (dot grid + glow)
      tl.fromTo(
        [dotGridRef.current, glowRef.current],
        { opacity: 0 },
        { opacity: (i) => (i === 0 ? 0.12 : 1), duration: 1.2 },
        0
      );

      // 2. Badge fade in
      tl.fromTo(
        badgeRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6 },
        0.3
      );

      // 3. H1 Luxury Reveal — line by line from bottom
      const h1El = h1Ref.current;
      if (h1El) {
        const lines = splitTextIntoLines(h1El);

        // Apply gold gradient to the last word of the last line
        const lastLine = h1El.querySelector("span > span:last-child");
        if (lastLine) {
          const wordSpans = lastLine.querySelectorAll("span");
          const lastWord = wordSpans[wordSpans.length - 1];
          if (lastWord) {
            (lastWord as HTMLElement).style.backgroundImage =
              "linear-gradient(to right, #D4AF37, #E8D48B)";
            (lastWord as HTMLElement).style.webkitBackgroundClip = "text";
            (lastWord as HTMLElement).style.backgroundClip = "text";
            (lastWord as HTMLElement).style.color = "transparent";
          }
        }

        if (lines.length > 0) {
          gsap.set(lines, { yPercent: 100 });
          tl.to(
            lines,
            { yPercent: 0, duration: 1.2, stagger: 0.12 },
            0.5
          );
        }
      }

      // 4. Gold decorative line
      tl.fromTo(
        goldLineRef.current,
        { width: 0 },
        { width: 200, duration: 0.8 },
        "-=0.4"
      );

      // 5. Subtitle fade
      tl.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 },
        "-=0.3"
      );

      // 6. Trust proof fade
      tl.fromTo(
        trustRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 },
        "-=0.2"
      );

      // 7. CTAs fade
      tl.fromTo(
        ctaRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 },
        "-=0.2"
      );

      // 8. Scroll indicator fade
      tl.fromTo(
        scrollRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.6 },
        "-=0.1"
      );

      // Scroll indicator bounce loop (independent)
      if (scrollDotRef.current) {
        gsap.to(scrollDotRef.current, {
          y: 8,
          duration: 0.75,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-24 pb-28"
    >
      {/* Dot grid background */}
      <div
        ref={dotGridRef}
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: 0,
          backgroundImage:
            "radial-gradient(circle, rgba(212,175,55,0.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Golden ambient glow */}
      <div ref={glowRef} className="pointer-events-none absolute inset-0" style={{ opacity: 0 }}>
        <div className="absolute top-1/3 left-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/5 blur-[150px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl text-center">
        {/* Badge */}
        <span
          ref={badgeRef}
          className="mb-6 inline-block rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-medium tracking-wider text-gold uppercase"
          style={{ opacity: 0 }}
        >
          {t("badge")}
        </span>

        {/* H1 — Luxury Reveal (line by line, no scroll) */}
        <h1
          ref={h1Ref}
          className="mb-8 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-6xl"
        >
          {title}
        </h1>

        {/* Gold decorative line */}
        <div
          ref={goldLineRef}
          className="mx-auto mb-8 h-px bg-gradient-to-r from-transparent via-gold to-transparent"
          style={{ width: 0 }}
        />

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="mx-auto mb-12 max-w-2xl text-lg text-muted sm:text-xl"
          style={{ opacity: 0 }}
        >
          {t("subtitle")}
        </p>

        {/* Trust proof */}
        <div
          ref={trustRef}
          className="mb-12 flex items-center justify-center gap-2"
          style={{ opacity: 0 }}
        >
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="h-4 w-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-sm font-semibold text-foreground">4.9/5</span>
          <span className="text-sm text-muted">&middot;</span>
          <span className="text-sm text-muted">{t("trustProof")}</span>
        </div>

        {/* CTAs */}
        <div
          ref={ctaRef}
          className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          style={{ opacity: 0 }}
        >
          <Link
            href={`/${locale}/request-quote`}
            onClick={() => track("Click_Demarrer_Projet", { location: "hero" })}
            className="inline-flex items-center gap-2 rounded-full bg-gold px-8 py-4 text-sm font-semibold text-background transition-all hover:bg-gold-dark hover:shadow-[0_8px_30px_rgba(212,175,55,0.3)]"
          >
            {t("cta")}
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <a
            href="#portfolio"
            className="inline-flex items-center gap-2 rounded-full border border-border px-8 py-4 text-sm font-medium text-foreground transition-all hover:border-gold/40 hover:text-gold"
          >
            {t("ctaSecondary")}
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        ref={scrollRef}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        style={{ opacity: 0 }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs tracking-widest text-muted uppercase">
            {t("scroll")}
          </span>
          <div
            ref={scrollDotRef}
            className="h-10 w-6 rounded-full border-2 border-gold/30 p-1"
          >
            <div className="h-2 w-full rounded-full bg-gold" />
          </div>
        </div>
      </div>
    </section>
  );
}
