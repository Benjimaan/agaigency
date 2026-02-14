"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRef } from "react";
import ScrollReveal from "./ui/ScrollReveal";

interface Project {
  key: string;
  images: string[];
  color: string;
  liveUrl?: string;
}

const projects: Project[] = [
  {
    key: "dkrEat",
    images: [
      "/images/projects/dkr-eat-home.png",
      "/images/projects/dkr-eat-menu.png",
      "/images/projects/dkr-eat-about.png",
    ],
    color: "#e87435",
  },
  {
    key: "project2",
    images: [],
    color: "#8b9dc3",
  },
  {
    key: "project3",
    images: [],
    color: "#a8d5ba",
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
      {/* Browser top bar */}
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
      {/* Content */}
      <div className="relative">{children}</div>
    </div>
  );
}

function ProjectCarousel({ project }: { project: Project }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("portfolio");

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="scrollbar-hide flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {project.images.map((image, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              delay: i * 0.15,
              duration: 0.6,
              ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
            }}
            className="w-[85vw] max-w-[900px] flex-shrink-0 snap-center first:ml-0"
          >
            <BrowserFrame url={`${t(`items.${project.key}.title`).toLowerCase().replace(/\s/g, "")}.com`}>
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={image}
                  alt={`${t(`items.${project.key}.title`)} - Screen ${i + 1}`}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 85vw, 900px"
                />
              </div>
            </BrowserFrame>
          </motion.div>
        ))}
      </div>

      {/* Scroll hint gradient */}
      <div className="pointer-events-none absolute top-0 right-0 bottom-4 w-20 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}

function FeaturedProject({ project }: { project: Project }) {
  const t = useTranslations("portfolio");
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [30, -30]);

  return (
    <div ref={sectionRef} className="mb-32">
      {/* Project header */}
      <ScrollReveal className="mb-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="mb-3 inline-block text-xs font-medium tracking-wider text-accent uppercase">
              {t(`items.${project.key}.category`)}
            </span>
            <h3 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t(`items.${project.key}.title`)}
            </h3>
          </div>
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
            >
              Voir le site
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </a>
          )}
        </div>
      </ScrollReveal>

      {/* Screenshot carousel */}
      <motion.div style={{ y }}>
        <ProjectCarousel project={project} />
      </motion.div>

      {/* Description */}
      <ScrollReveal delay={0.2} className="mt-8 max-w-2xl">
        <p className="text-lg leading-relaxed text-muted">
          {t(`items.${project.key}.description`)}
        </p>
      </ScrollReveal>
    </div>
  );
}

function PlaceholderProject({ project }: { project: Project }) {
  const t = useTranslations("portfolio");

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
      }}
      className="group cursor-pointer"
    >
      <BrowserFrame>
        <div
          className="flex aspect-[16/10] items-center justify-center transition-colors duration-300 group-hover:brightness-110"
          style={{ backgroundColor: `${project.color}12` }}
        >
          <div
            className="h-16 w-16 rounded-2xl opacity-20"
            style={{ backgroundColor: project.color }}
          />
        </div>
      </BrowserFrame>

      <div className="mt-6">
        <span className="mb-2 inline-block text-xs font-medium tracking-wider text-accent uppercase">
          {t(`items.${project.key}.category`)}
        </span>
        <h3 className="mb-2 text-xl font-semibold transition-colors group-hover:text-accent">
          {t(`items.${project.key}.title`)}
        </h3>
        <p className="text-sm leading-relaxed text-muted">
          {t(`items.${project.key}.description`)}
        </p>
      </div>
    </motion.div>
  );
}

export default function Portfolio() {
  const t = useTranslations("portfolio");

  const featuredProjects = projects.filter((p) => p.images.length > 0);
  const placeholderProjects = projects.filter((p) => p.images.length === 0);

  return (
    <section id="portfolio" className="px-6 py-32">
      <div className="mx-auto max-w-7xl">
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

        {/* Featured projects with carousel */}
        {featuredProjects.map((project) => (
          <FeaturedProject key={project.key} project={project} />
        ))}

        {/* Placeholder projects in grid */}
        {placeholderProjects.length > 0 && (
          <div className="grid gap-8 md:grid-cols-2">
            {placeholderProjects.map((project) => (
              <PlaceholderProject key={project.key} project={project} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
