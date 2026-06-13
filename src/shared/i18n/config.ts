export const locales = ["uz", "ru"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "uz";

export function isLocale(v: unknown): v is Locale {
  return v === "uz" || v === "ru";
}