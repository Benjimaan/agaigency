"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";

export default function LangSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = () => {
    const newLocale = locale === "fr" ? "en" : "fr";
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <button
      onClick={switchLocale}
      className="relative flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-medium tracking-wider uppercase text-muted transition-all hover:border-accent hover:text-foreground"
    >
      <span className={locale === "fr" ? "text-foreground" : ""}>FR</span>
      <span className="text-border">/</span>
      <span className={locale === "en" ? "text-foreground" : ""}>EN</span>
    </button>
  );
}
