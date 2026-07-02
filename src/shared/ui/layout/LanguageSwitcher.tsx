"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { locales, type Locale } from "@/shared/i18n/config";
import { setStoredLocale } from "@/shared/i18n/preference";
import { getLocaleFromPath, stripLocale, withLocale } from "@/shared/i18n/path";

const localeNames: Record<Locale, string> = {
  en: "EN",
  uz: "UZ",
  ru: "RU",
};

export function LanguageSwitcher() {
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);
  const currentPath = stripLocale(pathname ?? "/");

  return (
    <div
      className="inline-flex h-9 items-center rounded-full border border-border bg-card p-1 shadow-sm"
      aria-label="Tilni tanlash"
    >
      <span className="flex h-7 w-7 items-center justify-center text-muted-foreground">
        <Globe2 className="h-4 w-4" />
      </span>
      {locales.map((item) => {
        const active = item === locale;

        return (
          <Link
            key={item}
            href={withLocale(item, currentPath)}
            onClick={() => setStoredLocale(item)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-7 min-w-8 items-center justify-center rounded-full px-2 text-xs font-semibold transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {localeNames[item]}
          </Link>
        );
      })}
    </div>
  );
}
