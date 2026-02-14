"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";

export default function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");

  const currentYear = new Date().getFullYear();

  const navLinks = [
    { href: "#services", label: nav("services") },
    { href: "#portfolio", label: nav("portfolio") },
    { href: "#process", label: nav("process") },
    { href: "#about", label: nav("about") },
    { href: "#contact", label: nav("contact") },
  ];

  return (
    <footer className="border-t border-border px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Brand */}
          <div>
            <a href="#" className="mb-4 inline-block">
              <Image
                src="/images/logo.png"
                alt="AgaiGency"
                width={200}
                height={50}
                className="h-12 w-auto"
              />
            </a>
            <p className="max-w-xs text-sm leading-relaxed text-muted">
              {t("description")}
            </p>
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
                    className="text-sm text-muted transition-colors hover:text-foreground"
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
                <a href="#" className="text-sm text-muted transition-colors hover:text-foreground">
                  {t("legal")}
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted transition-colors hover:text-foreground">
                  {t("privacy")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted">
            &copy; {currentYear} AgaiGency. {t("rights")}
          </p>
          <div className="flex gap-4">
            {/* Social placeholders */}
            {["LinkedIn", "Twitter", "Instagram"].map((social) => (
              <a
                key={social}
                href="#"
                className="text-xs text-muted transition-colors hover:text-foreground"
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
