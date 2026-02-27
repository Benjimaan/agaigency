"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { track } from "@vercel/analytics/react";
import LangSwitcher from "./ui/LangSwitcher";

const navLinks = [
  { href: "#services", key: "services" },
  { href: "#portfolio", key: "portfolio" },
  { href: "#process", key: "process" },
  { href: "#about", key: "about" },
  { href: "#seo-audit", key: "seoAudit" },
  { href: "#contact", key: "contact" },
] as const;

export default function Navbar() {
  const t = useTranslations("nav");
  const tContact = useTranslations("hero");
  const locale = useLocale();
  const { scrollY } = useScroll();
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  const bgOpacity = useTransform(scrollY, [0, 100], [0, 0.8]);
  const backdropBlur = useTransform(scrollY, [0, 100], [0, 20]);
  const borderOpacity = useTransform(scrollY, [0, 100], [0, 0.1]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <motion.header
      className="fixed top-0 right-0 left-0 z-50"
      style={{
        backgroundColor: useTransform(
          bgOpacity,
          (v) => `rgba(10, 10, 10, ${v})`
        ),
        backdropFilter: useTransform(backdropBlur, (v) => `blur(${v}px)`),
        borderBottom: useTransform(
          borderOpacity,
          (v) => `1px solid rgba(255, 255, 255, ${v})`
        ),
      }}
    >
      <nav aria-label="Navigation principale" className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        {/* Logo */}
        <Link href={`/${locale}`} className="block">
          <img
            src="/images/logo.svg"
            alt="AgaiGency"
            className="h-12 w-auto"
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.key}
              href={link.href}
              onMouseEnter={() => setHoveredLink(link.key)}
              onMouseLeave={() => setHoveredLink(null)}
              className="relative text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              {t(link.key)}
              {/* Gold underline on hover */}
              {hoveredLink === link.key && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute -bottom-1 left-0 right-0 h-px bg-gold"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </a>
          ))}

          {/* CTA button */}
          <Link
            href={`/${locale}/request-quote`}
            onClick={() => track("Click_Demarrer_Projet", { location: "navbar" })}
            className="rounded-full border border-gold/20 bg-gold/10 px-5 py-2 text-sm font-medium text-gold transition-all hover:bg-gold/20"
          >
            {tContact("cta")}
          </Link>

          <LangSwitcher />
        </div>

        {/* Mobile burger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex min-h-11 min-w-11 flex-col items-center justify-center gap-1.5 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          <motion.span
            animate={isOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
            className="block h-0.5 w-6 bg-foreground"
          />
          <motion.span
            animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
            className="block h-0.5 w-6 bg-foreground"
          />
          <motion.span
            animate={isOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
            className="block h-0.5 w-6 bg-foreground"
          />
        </button>
      </nav>

      {/* Mobile menu */}
      <motion.div
        initial={false}
        animate={isOpen ? { height: "100dvh", opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="overflow-hidden bg-background md:hidden"
      >
        <div className="flex flex-col items-center gap-8 px-6 pt-12">
          {navLinks.map((link) => (
            <a
              key={link.key}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="text-2xl font-medium text-foreground transition-colors hover:text-gold"
            >
              {t(link.key)}
            </a>
          ))}
          <Link
            href={`/${locale}/request-quote`}
            onClick={() => { track("Click_Demarrer_Projet", { location: "navbar_mobile" }); setIsOpen(false); }}
            className="rounded-full border border-gold/20 bg-gold/10 px-8 py-3 text-lg font-medium text-gold transition-all hover:bg-gold/20"
          >
            {tContact("cta")}
          </Link>
          <LangSwitcher />
        </div>
      </motion.div>
    </motion.header>
  );
}
