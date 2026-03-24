"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Logo from "./ui/Logo";

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
    { href: "#seo-audit", label: nav("seoAudit") },
    { href: "#google-ads", label: nav("googleAds") },
    { href: "#contact", label: nav("contact") },
  ];

  return (
    <footer className="border-t border-gold/10 px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Brand */}
          <div>
            <a href="#" className="gold-glow-hover mb-4 inline-block rounded-lg p-1 text-white transition-all hover:text-[#D4AF37]">
              <Logo className="h-12 w-auto" showSubtitle={false} />
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
            <a
              href="https://share.google/GMpytWzTD9om1P59J"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center gap-2 text-sm text-muted transition-colors hover:text-gold"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {t("googleReview")}
            </a>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              {t("navigation")}
            </h3>
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
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href={`/${locale}/legal#mentions`} className="text-sm text-muted transition-colors hover:text-gold">
                  {t("legal")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/legal#confidentialite`} className="text-sm text-muted transition-colors hover:text-gold">
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
