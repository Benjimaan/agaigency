"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import type { ProjectData } from "@/lib/projects";
import ScrollReveal from "./ui/ScrollReveal";

/* ─── Browser Frame ─── */
function BrowserFrame({
  children,
  url,
}: {
  children: React.ReactNode;
  url?: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/50">
      <div className="flex items-center gap-3 border-b border-border bg-[#1a1a1a] px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <div className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        {url && (
          <div className="ml-2 flex-1 rounded-md bg-background/50 px-3 py-1 text-center">
            <span className="text-[11px] text-muted">{url}</span>
          </div>
        )}
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}

/* ─── Hero Section ─── */
function CaseStudyHero({ project }: { project: ProjectData }) {
  const t = useTranslations("portfolio");
  const locale = useLocale();
  const k = project.translationKey;
  const title = t(`items.${k}.title`);

  const wordVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.2 + i * 0.1,
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
      },
    }),
  };

  return (
    <section className="relative flex min-h-[70vh] items-end overflow-hidden px-6 pb-20 pt-32">
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(ellipse at 50% 80%, ${project.color}40, transparent 70%)`,
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href={`/${locale}#portfolio`}
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Portfolio
          </Link>
        </motion.div>

        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-6 inline-block rounded-full px-4 py-1.5 text-xs font-medium tracking-wider uppercase"
          style={{ backgroundColor: `${project.color}20`, color: project.color }}
        >
          {t(`items.${k}.category`)}
        </motion.span>

        <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
          {title.split(" ").map((word, i) => (
            <motion.span
              key={i}
              custom={i}
              variants={wordVariants}
              initial="hidden"
              animate="visible"
              className="mr-[0.25em] inline-block"
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="max-w-2xl text-xl text-muted"
        >
          {t(`items.${k}.heroSubtitle`)}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-12 flex gap-12"
        >
          {[
            { value: "12+", label: t(`items.${k}.stats.pages`) },
            { value: "25+", label: t(`items.${k}.stats.features`) },
            { value: "8", label: t(`items.${k}.stats.duration`) },
          ].map((stat, i) => (
            <div key={i}>
              <div className="text-3xl font-bold" style={{ color: project.color }}>
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-muted">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Scrolling Mockup Window ─── */
function ScrollingMockup({ project }: { project: ProjectData }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0.1, 0.9], ["0%", "-40%"]);

  return (
    <div ref={containerRef} className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <BrowserFrame url="dakareat.com">
          <div className="relative h-[400px] overflow-hidden sm:h-[500px] md:h-[600px]">
            <motion.div style={{ y: imageY }} className="absolute inset-x-0 top-0">
              <Image
                src={project.heroImage}
                alt="Full page screenshot"
                width={1440}
                height={3000}
                className="w-full"
                priority
              />
            </motion.div>
          </div>
        </BrowserFrame>
      </div>
    </div>
  );
}

/* ─── Screenshot Carousel ─── */
function ScreenshotCarousel({ project }: { project: ProjectData }) {
  const t = useTranslations("portfolio");
  const k = project.translationKey;

  return (
    <div className="relative">
      <div
        className="flex gap-6 overflow-x-auto px-6 pb-6 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {project.pages.map((page, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              delay: i * 0.1,
              duration: 0.6,
              ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
            }}
            className="w-[80vw] max-w-[700px] flex-shrink-0 snap-center"
          >
            <BrowserFrame url={`dakareat.com/${page.label.toLowerCase().replace(/\s|à/g, "-")}`}>
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={page.image}
                  alt={`${t(`items.${k}.title`)} - ${page.label}`}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 80vw, 700px"
                />
              </div>
            </BrowserFrame>
            <p className="mt-3 text-center text-sm font-medium text-muted">{page.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="pointer-events-none absolute top-0 left-0 bottom-6 w-10 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute top-0 right-0 bottom-6 w-20 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}

/* ─── Sticky Section ─── */
function StickySection({
  project,
  sectionKey,
  images,
  reverse = false,
}: {
  project: ProjectData;
  sectionKey: string;
  images: string[];
  reverse?: boolean;
}) {
  const t = useTranslations("portfolio");
  const k = project.translationKey;
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <div
      ref={sectionRef}
      className={`flex flex-col gap-12 px-6 py-20 lg:flex-row lg:items-start lg:gap-20 ${
        reverse ? "lg:flex-row-reverse" : ""
      }`}
    >
      <div className="lg:sticky lg:top-32 lg:w-1/3">
        <ScrollReveal>
          <h3 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {t(`items.${k}.sections.${sectionKey}.title`)}
          </h3>
          <p className="text-lg leading-relaxed text-muted">
            {t(`items.${k}.sections.${sectionKey}.description`)}
          </p>
        </ScrollReveal>
      </div>

      <motion.div style={{ y }} className="flex-1 space-y-6">
        {images.map((img, i) => (
          <ScrollReveal key={i} delay={i * 0.1}>
            <BrowserFrame>
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={img}
                  alt={`Screenshot ${i + 1}`}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
              </div>
            </BrowserFrame>
          </ScrollReveal>
        ))}
      </motion.div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function CaseStudyPage({ project }: { project: ProjectData }) {
  const t = useTranslations("portfolio");
  const locale = useLocale();
  const k = project.translationKey;

  return (
    <div className="min-h-screen bg-background">
      <CaseStudyHero project={project} />

      <ScrollingMockup project={project} />

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <ScrollReveal className="mb-12">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              {t(`items.${k}.sections.website.title`)}
            </h2>
            <p className="max-w-2xl text-lg text-muted">
              {t(`items.${k}.sections.website.description`)}
            </p>
          </ScrollReveal>
        </div>
        <ScreenshotCarousel project={project} />
      </section>

      <section className="mx-auto max-w-7xl py-20">
        <StickySection
          project={project}
          sectionKey="dashboard"
          images={["/images/projects/dkr-eat/admin-login.png"]}
          reverse
        />
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <ScrollReveal>
            <span
              className="mb-6 inline-block rounded-full px-4 py-1.5 text-xs font-medium tracking-wider uppercase"
              style={{ backgroundColor: `${project.color}20`, color: project.color }}
            >
              {t(`items.${k}.sections.results.title`)}
            </span>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="text-2xl font-light leading-relaxed text-muted sm:text-3xl">
              {t(`items.${k}.sections.results.description`)}
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="px-6 py-32 text-center">
        <ScrollReveal>
          <Link
            href={`/${locale}#portfolio`}
            className="inline-flex items-center gap-3 rounded-full border border-border px-8 py-4 text-lg font-medium transition-all hover:border-accent hover:text-accent"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Portfolio
          </Link>
        </ScrollReveal>
      </section>
    </div>
  );
}
