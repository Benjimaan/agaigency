"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";

export default function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const locale = useLocale();

  const currentYear = new Date().getFullYear();

  const navLinks = [
    { href: "#services", label: nav("services") },
    { href: "#portfolio", label: nav("portfolio") },
    { href: "#process", label: nav("process") },
    { href: "#about", label: nav("about") },
    { href: "#contact", label: nav("contact") },
  ];

  return (
    <footer className="border-t border-gold/10 px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Brand */}
          <div>
            <a href="#" className="gold-glow-hover mb-4 inline-block rounded-lg p-1 transition-all">
              <img
                src="/images/logo.svg"
                alt="AgaiGency"
                className="h-12 w-auto"
              />
            </a>
            <p className="max-w-xs text-sm leading-relaxed text-muted">
              {t("description")}
            </p>
            <a
              href="mailto:contact@agaigency.com"
              className="mt-3 inline-block text-sm text-muted transition-colors hover:text-gold"
            >
              contact@agaigency.com
            </a>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              {t("navigation")}
            </h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-muted transition-colors hover:text-gold"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href={`/${locale}/legal`} className="text-sm text-muted transition-colors hover:text-gold">
                  {t("legal")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/legal`} className="text-sm text-muted transition-colors hover:text-gold">
                  {t("privacy")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-gold/10 pt-8 sm:flex-row">
          <p className="text-xs text-muted">
            &copy; {currentYear} AgaiGency. {t("rights")}
          </p>
          <a
            href="mailto:contact@agaigency.com"
            className="text-xs text-muted transition-colors hover:text-gold"
          >
            contact@agaigency.com
          </a>
        </div>
      </div>
    </footer>
  );
}
