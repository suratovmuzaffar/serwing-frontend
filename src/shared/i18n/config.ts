export const locales = ["en", "uz", "ru"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export function isLocale(v: unknown): v is Locale {
  return v === "en" || v === "uz" || v === "ru";
}
