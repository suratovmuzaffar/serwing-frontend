import { defaultLocale, isLocale, type Locale } from "./config";

function normalize(path: string) {
  if (!path) return "/";
  return path.startsWith("/") ? path : `/${path}`;
}

/**
 * "/" bilan boshlanadigan pathni segmentlarga bo'lib,
 * bo'sh / undefined / null string segmentlarni olib tashlaydi.
 * Masalan: "/undefined/home" -> "/home"
 *          "/category/undefined/home" -> "/category/home"
 */
function sanitizePath(path: string) {
  const p = normalize(path);
  const parts = p.split("/").filter(Boolean);

  const cleaned = parts.filter((seg) => seg !== "undefined" && seg !== "null");
  return cleaned.length ? `/${cleaned.join("/")}` : "/";
}

/**
 * Agar path oldida locale bo'lsa olib tashlaydi:
 *  /uz/home -> /home
 *  /ru/products -> /products
 */
export function stripLocale(path: string) {
  const p = sanitizePath(path);
  const parts = p.split("/").filter(Boolean);

  const maybeLocale = parts[0];
  if (isLocale(maybeLocale)) {
    parts.shift();
  }
  return parts.length ? `/${parts.join("/")}` : "/";
}

export function getLocaleFromPath(path: string | null | undefined): Locale {
  const firstSegment = sanitizePath(path ?? "/").split("/").filter(Boolean)[0];
  return isLocale(firstSegment) ? firstSegment : defaultLocale;
}

/**
 * ✅ Safe withLocale:
 * - locale noto'g'ri/undefined bo'lsa defaultLocale ishlatadi
 * - locale `string[]` bo'lsa ham birinchi element olinadi
 * - path ichidagi locale va "undefined" segmentlarni tozalaydi
 */
export function withLocale(
  locale: string | string[] | undefined | null,
  path: string
) {
  const raw = Array.isArray(locale) ? locale[0] : locale;
  const safeLocale: Locale = isLocale(raw) ? raw : defaultLocale;

  const clean = stripLocale(path); // locale va undefined tozalanadi
  return clean === "/" ? `/${safeLocale}` : `/${safeLocale}${clean}`;
}

/**
 * ✅ Segmentsdan path yasash (undefined bo'lsa ham xavfsiz)
 * joinPath("home") -> "/home"
 * joinPath(categoryId, "home") (categoryId undefined) -> "/home"
 */
export function joinPath(...segments: Array<string | undefined | null>) {
  const cleaned = segments
    .filter((s): s is string => !!s && s !== "undefined" && s !== "null")
    .map((s) => s.replace(/^\/+|\/+$/g, "")) // trim slashes
    .filter(Boolean);

  return cleaned.length ? `/${cleaned.join("/")}` : "/";
}
