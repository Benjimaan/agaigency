"use client";

import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import ScrollReveal from "./ui/ScrollReveal";
import RevealText from "./ui/RevealText";

/* ─── Data ──────────────────────────────────────────── */

interface CaseImage {
  src: string;
  type: "desktop" | "mobile";
}

interface CaseStudy {
  key: string;
  liveUrl: string;
  color: string;
  images: CaseImage[];
}

const caseStudies: CaseStudy[] = [
  {
    key: "dkrEat",
    liveUrl: "https://dakareat.com",
    color: "#e87435",
    images: [
      { src: "/images/projects/dkr-eat/accueil.png", type: "desktop" },
      { src: "/images/projects/dkr-eat/menu.png", type: "desktop" },
      { src: "/images/projects/dkr-eat/admin-login.png", type: "desktop" },
      { src: "/images/projects/dkr-eat/contact.png", type: "desktop" },
    ],
  },
];

/* ─── Other Projects (grid) ─────────────────────────── */

interface OtherProject {
  key: string;
  slug: string;
  image: string;
  color: string;
}

const otherProjects: OtherProject[] = [
  {
    key: "villaAngelie",
    slug: "villa-angelie",
    image: "/images/projects/villaangelie/02-accueil-hero.png",
    color: "#C5A55A",
  },
  {
    key: "duo2mc",
    slug: "duo2mc",
    image: "/images/projects/duo2mc/homepage.png",
    color: "#d4a84a",
  },
  {
    key: "prospectPro",
    slug: "prospect-pro",
    image: "/images/projects/prospectpro/02-dashboard.png",
    color: "#3b82f6",
  },
];

const EASE = [0.25, 0.1, 0.25, 1] as [number, number, number, number];

/* ─── Frames ────────────────────────────────────────── */

function BrowserFrame({
  children,
  url,
}: {
  children: React.ReactNode;
  url?: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#141414] shadow-2xl shadow-black/50">
      <div className="flex items-center gap-3 border-b border-white/[0.06] bg-[#1a1a1a] px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <div className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        {url && (
          <div className="ml-2 flex-1 rounded-md bg-white/5 px-3 py-1 text-center">
            <span className="text-[11px] text-white/40">{url}</span>
          </div>
        )}
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}

/* ─── Other Project Card ────────────────────────────── */

function ProjectCard({ project }: { project: OtherProject }) {
  const t = useTranslations("portfolio");
  const locale = useLocale();

  return (
    <Link href={`/${locale}/projects/${project.slug}`} className="group block">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <BrowserFrame>
          <div className="relative aspect-[16/10] overflow-hidden">
            <Image
              src={project.image}
              alt={t(`items.${project.key}.title`)}
              fill
              className="object-cover object-top transition-[object-position] duration-[6s] ease-in-out group-hover:object-bottom"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        </BrowserFrame>
        <div className="mt-4">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-xs font-medium tracking-wider text-gold uppercase">
              {t(`items.${project.key}.category`)}
            </span>
          </div>
          <h3 className="mb-1 text-lg font-semibold text-white transition-colors group-hover:text-gold">
            {t(`items.${project.key}.title`)}
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-white/50">
            {t(`items.${project.key}.description`)}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}

/* ─── Case Study Block ──────────────────────────────── */

function CaseStudyBlock({ study }: { study: CaseStudy }) {
  const t = useTranslations("portfolio");
  const locale = useLocale();

  const solutionTags = t(`items.${study.key}.solutionTags`)
    .split(",")
    .map((tag) => tag.trim());

  return (
    <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
      {/* Left — Sticky copy */}
      <div className="lg:sticky lg:top-32 lg:w-2/5 lg:self-start">
        <ScrollReveal>
          {/* Client & sector */}
          <div className="mb-6">
            <span className="text-sm font-medium tracking-wider text-gold uppercase">
              {t(`items.${study.key}.title`)}
            </span>
            <span className="mx-2 text-white/20">&middot;</span>
            <span className="text-sm text-white/50">
              {t(`items.${study.key}.sector`)}
            </span>
          </div>

          {/* Big stat */}
          <p
            className="mb-1 text-7xl font-extrabold tracking-tight"
            style={{ color: study.color }}
          >
            {t(`items.${study.key}.stat`)}
          </p>
          <p className="mb-10 text-sm text-white/50">
            {t(`items.${study.key}.statLabel`)}
          </p>

          {/* Challenge */}
          <h3 className="mb-3 text-lg font-semibold text-white">
            {t("challengeTitle")}
          </h3>
          <p className="mb-8 leading-relaxed text-white/60">
            {t(`items.${study.key}.challenge`)}
          </p>

          {/* Solution tags */}
          <h4 className="mb-3 text-sm font-semibold text-white">
            {t("solutionTitle")}
          </h4>
          <div className="mb-8 flex flex-wrap gap-2">
            {solutionTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-gold/20 bg-gold/5 px-3 py-1 text-xs font-medium text-gold"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Quote */}
          <blockquote className="mb-8 border-l-2 border-gold/30 pl-4">
            <p className="mb-2 text-sm italic leading-relaxed text-white/70">
              &ldquo;{t(`items.${study.key}.quote`)}&rdquo;
            </p>
            <footer className="text-xs text-white/40">
              <span className="font-medium text-white/60">
                {t(`items.${study.key}.quoteAuthor`)}
              </span>{" "}
              &mdash; {t(`items.${study.key}.quoteRole`)}
            </footer>
          </blockquote>
        </ScrollReveal>
      </div>

      {/* Right — Scrollable mockups */}
      <div className="space-y-8 lg:w-3/5">
        {study.images.map((img, i) => (
          <motion.div
            key={img.src}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
          >
            <BrowserFrame url={i === 0 ? "dakareat.com" : undefined}>
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={img.src}
                  alt={`${t(`items.${study.key}.title`)} - screenshot ${i + 1}`}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
              </div>
            </BrowserFrame>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Section ──────────────────────────────────── */

export default function Portfolio() {
  const t = useTranslations("portfolio");

  return (
    <section id="portfolio" className="bg-[#0A0A0A] px-6 py-32">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <ScrollReveal className="mb-20 text-center">
          <span className="mb-4 inline-block rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-medium tracking-wider text-gold uppercase">
            {t("badge")}
          </span>
          <RevealText
            as="h2"
            className="mb-6 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl"
          >
            {t("title")}
          </RevealText>
          <p className="mx-auto max-w-2xl text-lg text-white/50">
            {t("subtitle")}
          </p>
        </ScrollReveal>

        {/* Case Studies */}
        {caseStudies.map((study, i) => (
          <div key={study.key}>
            <CaseStudyBlock study={study} />
            {i < caseStudies.length - 1 && (
              <div className="my-24 mx-auto h-px w-40 bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
            )}
          </div>
        ))}

        {/* Separator */}
        <div className="my-24 mx-auto h-px w-40 bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

        {/* Other Projects Grid */}
        <ScrollReveal className="mb-12 text-center">
          <h3 className="mb-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {t("otherProjects")}
          </h3>
          <p className="mx-auto max-w-xl text-sm text-white/50">
            {t("otherProjectsSubtitle")}
          </p>
        </ScrollReveal>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {otherProjects.map((project) => (
            <ProjectCard key={project.key} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
