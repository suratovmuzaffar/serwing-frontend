"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { locales, type Locale } from "@/shared/i18n/config";
import { setStoredLocale } from "@/shared/i18n/preference";
import { getLocaleFromPath, stripLocale, withLocale } from "@/shared/i18n/path";

const localeLabels: Record<Locale, { short: string; flag: string; name: string }> = {
  en: { short: "EN", flag: "/assets/flag-en.svg", name: "English" },
  uz: { short: "UZ", flag: "/assets/flag-uz.svg", name: "O'zbekcha" },
  ru: { short: "RU", flag: "/assets/flag-ru.svg", name: "Русский" },
};

export function LanguageSwitcher() {
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);
  const currentPath = stripLocale(pathname ?? "/");

  return (
    <div
      className="inline-flex h-10 items-center rounded-full border border-border bg-card p-1 shadow-sm"
      aria-label="Tilni tanlash"
    >
      {locales.map((item) => {
        const active = item === locale;
        const label = localeLabels[item];

        return (
          <Link
            key={item}
            href={withLocale(item, currentPath)}
            onClick={() => setStoredLocale(item)}
            aria-current={active ? "page" : undefined}
            aria-label={label.name}
            title={label.name}
            className={cn(
              "flex h-8 min-w-8 items-center justify-center rounded-full px-1.5 text-sm font-semibold transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Image
              src={label.flag}
              alt=""
              width={20}
              height={20}
              className="h-5 w-5 rounded-full object-cover"
            />
            <span className="sr-only">{label.short}</span>
          </Link>
        );
      })}
    </div>
  );
}
