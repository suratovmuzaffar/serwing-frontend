import { defaultLocale, isLocale, type Locale } from "./config";

const LOCALE_STORAGE_KEY = "serwing_locale";
const DEFAULT_LOCALE_STORAGE_KEY = "serwing_default_locale";
type UserLocalePreference = {
  defaultLanguage: unknown;
  currentLanguage: unknown;
};

export function normalizeLocale(value: unknown): Locale | null {
  if (isLocale(value)) return value;

  if (typeof value !== "string") return null;

  const normalized = value.toLowerCase();
  if (normalized.startsWith("en")) return "en";
  if (normalized.startsWith("ru")) return "ru";
  if (normalized.startsWith("uz")) return "uz";

  return null;
}

export function getStoredLocale(): Locale | null {
  if (typeof window === "undefined") return null;

  return normalizeLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY));
}

export function getStoredDefaultLocale(): Locale | null {
  if (typeof window === "undefined") return null;

  return normalizeLocale(window.localStorage.getItem(DEFAULT_LOCALE_STORAGE_KEY));
}

export function setStoredLocale(locale: Locale) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
}

export function clearStoredLocale() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(LOCALE_STORAGE_KEY);
}

export function setStoredDefaultLocale(locale: Locale) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(DEFAULT_LOCALE_STORAGE_KEY, locale);
}

export function getPreferredLocale(fallback: Locale = defaultLocale): Locale {
  return getStoredLocale() ?? getStoredDefaultLocale() ?? fallback;
}

export function getEffectiveStoredLocale(): Locale | null {
  return getStoredLocale() ?? getStoredDefaultLocale();
}

export function syncStoredUserLocale(user: UserLocalePreference) {
  const defaultLanguage = normalizeLocale(user.defaultLanguage);
  const currentLanguage = normalizeLocale(user.currentLanguage);

  if (defaultLanguage) {
    setStoredDefaultLocale(defaultLanguage);
  }

  if (currentLanguage) {
    setStoredLocale(currentLanguage);
    return currentLanguage;
  }

  clearStoredLocale();
  return defaultLanguage;
}
