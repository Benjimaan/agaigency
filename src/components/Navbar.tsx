"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
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
  const { scrollY } = useScroll();
  const [isOpen, setIsOpen] = useState(false);

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
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        {/* Logo */}
        <a href="#" className="block">
          <img
            src="/images/logo.svg"
            alt="AgaiGency"
            className="h-12 w-auto"
          />
        </a>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.key}
              href={link.href}
              className="text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              {t(link.key)}
            </a>
          ))}
          <LangSwitcher />
        </div>

        {/* Mobile burger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex flex-col gap-1.5 md:hidden"
          aria-label="Toggle menu"
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
              className="text-2xl font-medium text-foreground transition-colors hover:text-accent"
            >
              {t(link.key)}
            </a>
          ))}
          <LangSwitcher />
        </div>
      </motion.div>
    </motion.header>
  );
}
