"use client";

import { useEffect, useRef, useState } from "react";
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
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const current = localeLabels[locale];

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative inline-flex" aria-label="Tilni tanlash">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-card transition-colors hover:bg-muted"
      >
        <Image
          src={current.flag}
          alt=""
          width={30}
          height={22}
          className="h-[18px] w-[26px] rounded-[2px] object-cover"
        />
        <span className="sr-only">{current.name}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-10 rounded-md bg-card py-2 shadow-xl ring-1 ring-border/60">
          <div className="flex w-full flex-col items-center gap-2" role="menu">
            {locales.map((item) => {
              const active = item === locale;
              const label = localeLabels[item];

              return (
                <Link
                  key={item}
                  href={withLocale(item, currentPath)}
                  onClick={() => {
                    setStoredLocale(item);
                    setOpen(false);
                  }}
                  aria-current={active ? "page" : undefined}
                  aria-label={label.name}
                  title={label.name}
                  role="menuitem"
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                    active
                      ? "bg-sky-100"
                      : "hover:bg-muted"
                  )}
                >
                  <Image
                    src={label.flag}
                    alt=""
                    width={25}
                    height={18}
                    className="h-[18px] w-[25px] rounded-[2px] object-cover"
                  />
                  <span className="sr-only">{label.short}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
