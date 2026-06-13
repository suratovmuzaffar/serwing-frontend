"use client";

import React, { createContext, useCallback, useContext, useMemo } from "react";
import type { Locale } from "./config";
import type { Dictionary } from "./types";

type I18nCtx = {
  locale: Locale;
  dictionary: Dictionary;
};

const I18nContext = createContext<I18nCtx | null>(null);

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function getByPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (!isRecord(acc)) return undefined;
    return acc[key];
  }, obj);
}

export function I18nProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: React.ReactNode;
}) {
  // ✅ stringify key - dictionary object reference o'zgarsa ham, content bir xil bo'lsa
  // useMemo qayta ishlamaydi. Bu "Maximum update depth exceeded" xatoni oldini oladi.
  const dictionaryKey = React.useMemo(
    () => JSON.stringify(dictionary ?? {}),
    [dictionary]
  );

  const value = useMemo<I18nCtx>(
    () => ({ locale, dictionary }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, dictionaryKey]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/**
 * useTranslations("SearchInput") => t("placeholder")
 */
export function useTranslations(namespace?: string) {
  const ctx = useContext(I18nContext);

  // ✅ useCallback - parent re-render bo'lganda yangi funksiya yaratilmasligi uchun
  return useCallback(
    (key: string, fallback?: string) => {
      if (!ctx) return fallback ?? key;

      const fullKey = namespace ? `${namespace}.${key}` : key;
      const v = getByPath(ctx.dictionary as unknown, fullKey);

      return typeof v === "string" ? v : fallback ?? key;
    },
    [ctx, namespace]
  );
}
