"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import ScrollReveal from "./ui/ScrollReveal";

interface Project {
  key: string;
  image: string | null;
  color: string;
}

const projects: Project[] = [
  {
    key: "dkrEat",
    image: "/images/projects/dkr-eat-home.png",
    color: "#e87435",
  },
  {
    key: "project2",
    image: null,
    color: "#8b9dc3",
  },
  {
    key: "project3",
    image: null,
    color: "#a8d5ba",
  },
];

export default function Portfolio() {
  const t = useTranslations("portfolio");

  return (
    <section id="portfolio" className="px-6 py-32">
      <div className="mx-auto max-w-7xl">
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

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <motion.div
              key={project.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                delay: i * 0.15,
                duration: 0.5,
                ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
              }}
              className="group cursor-pointer"
            >
              {/* Project thumbnail */}
              <div
                className="relative mb-6 aspect-[4/3] overflow-hidden rounded-2xl"
                style={{ backgroundColor: `${project.color}15` }}
              >
                {project.image ? (
                  <Image
                    src={project.image}
                    alt={t(`items.${project.key}.title`)}
                    fill
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div
                    className="absolute inset-0 flex items-center justify-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundColor: `${project.color}10` }}
                  >
                    <div
                      className="h-16 w-16 rounded-2xl opacity-30"
                      style={{ backgroundColor: project.color }}
                    />
                  </div>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-background/80 to-transparent p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="flex items-center gap-2 text-sm font-medium text-accent">
                    {t("viewProject")}
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Project info */}
              <span className="mb-2 inline-block text-xs font-medium tracking-wider text-accent uppercase">
                {t(`items.${project.key}.category`)}
              </span>
              <h3 className="mb-2 text-xl font-semibold transition-colors group-hover:text-accent">
                {t(`items.${project.key}.title`)}
              </h3>
              <p className="text-sm leading-relaxed text-muted">
                {t(`items.${project.key}.description`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
