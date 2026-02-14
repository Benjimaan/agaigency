"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import ScrollReveal from "./ui/ScrollReveal";

interface Project {
  key: string;
  slug: string | null;
  image: string | null;
  color: string;
}

const projects: Project[] = [
  {
    key: "dkrEat",
    slug: "dakar-eat",
    image: "/images/projects/dkr-eat/accueil.png",
    color: "#e87435",
  },
  {
    key: "nisware",
    slug: "nisware",
    image: "/images/projects/nisware/desktop-hero.png",
    color: "#e74c3c",
  },
  {
    key: "duo2mc",
    slug: "duo2mc",
    image: "/images/projects/duo2mc/homepage.png",
    color: "#d4a84a",
  },
];

function BrowserFrame({
  children,
  url,
}: {
  children: React.ReactNode;
  url?: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/40">
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

function ProjectCard({ project }: { project: Project }) {
  const t = useTranslations("portfolio");
  const locale = useLocale();
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [30, -30]);

  const content = (
    <div ref={sectionRef} className="group mb-20 cursor-pointer last:mb-0">
      {/* Project header */}
      <ScrollReveal className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="mb-3 inline-block text-xs font-medium tracking-wider text-accent uppercase">
              {t(`items.${project.key}.category`)}
            </span>
            <h3 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t(`items.${project.key}.title`)}
            </h3>
          </div>
          {project.slug && (
            <span className="inline-flex items-center gap-2 text-sm font-medium text-accent transition-colors group-hover:text-accent-hover">
              {t("viewProject")}
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </span>
          )}
        </div>
      </ScrollReveal>

      {/* Screenshot in browser frame */}
      <motion.div style={{ y }}>
        <BrowserFrame url={project.slug ? `${t(`items.${project.key}.title`).toLowerCase().replace(/\s/g, "")}.com` : undefined}>
          <div
            className="relative aspect-[16/9] overflow-hidden transition-transform duration-700 group-hover:scale-[1.02]"
            style={!project.image ? { backgroundColor: `${project.color}12` } : undefined}
          >
            {project.image ? (
              <Image
                src={project.image}
                alt={t(`items.${project.key}.title`)}
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 100vw, 1200px"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <div
                  className="h-16 w-16 rounded-2xl opacity-20"
                  style={{ backgroundColor: project.color }}
                />
              </div>
            )}
          </div>
        </BrowserFrame>
      </motion.div>

      {/* Description */}
      <ScrollReveal delay={0.15} className="mt-6 max-w-2xl">
        <p className="text-lg leading-relaxed text-muted">
          {t(`items.${project.key}.description`)}
        </p>
      </ScrollReveal>
    </div>
  );

  if (project.slug) {
    return (
      <Link href={`/${locale}/projects/${project.slug}`} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

export default function Portfolio() {
  const t = useTranslations("portfolio");

  return (
    <section id="portfolio" className="px-6 py-32">
      <div className="mx-auto max-w-5xl">
        <ScrollReveal className="mb-20 text-center">
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

        {projects.map((project) => (
          <ProjectCard key={project.key} project={project} />
        ))}
      </div>
    </section>
  );
}
