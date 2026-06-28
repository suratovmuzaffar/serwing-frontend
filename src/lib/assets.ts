import { ENV } from "@/config/env";

export function getAssetUrl(path?: string | null) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;

  try {
    const apiUrl = new URL(ENV.API_BASE_URL);
    return `${apiUrl.origin}${path.startsWith("/") ? path : `/${path}`}`;
  } catch {
    return path;
  }
}
