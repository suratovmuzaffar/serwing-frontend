import { defaultLocale, isLocale, type Locale } from "./config";
import type { Dictionary } from "./types";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  uz: () => import("./dictionaries/uz.json").then((m) => m.default),
  ru: () => import("./dictionaries/ru.json").then((m) => m.default),
};

export async function getDictionary(locale: unknown): Promise<Dictionary> {
  const safeLocale: Locale = isLocale(locale) ? locale : defaultLocale;
  return dictionaries[safeLocale]();
}