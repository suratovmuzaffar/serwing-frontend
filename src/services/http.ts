import axios, {
  AxiosError,
  AxiosHeaders,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { cookie } from "@/lib/cookie";
import { ENV } from "@/config/env";

// ✅ Type augmentation: config.meta va config._retry
declare module "axios" {
  export interface InternalAxiosRequestConfig {
    meta?: { start: number };
    _retry?: boolean;
  }
}

export const http = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 10_000,
});

// refresh uchun alohida instance (Authorization yo‘q)
const refreshHttp = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 10_000,
});

// ---------- helpers ----------
function isRefreshUrl(url?: string) {
  return Boolean(url && url.includes("/admin/auth/refresh/"));
}

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const MIN_PENDING_MS = 200;

// bitta refresh jarayoni
let refreshPromise: Promise<string> | null = null;

async function ensureMinPending(config?: InternalAxiosRequestConfig) {
  if (!config?.meta?.start) return;
  if (isRefreshUrl(config.url)) return;

  const spent = Date.now() - config.meta.start;
  const remain = Math.max(0, MIN_PENDING_MS - spent);
  if (remain > 0) await delay(remain);
}

// Request: refreshdan tashqari access qo‘shamiz + timer start
http.interceptors.request.use((config) => {
  if (!isRefreshUrl(config.url)) {
    config.meta = { start: Date.now() };
  }

  if (isRefreshUrl(config.url)) return config;

  const access = cookie.get("accessToken");
  if (access) {
    config.headers = new AxiosHeaders(config.headers);
    config.headers.set("Authorization", `Bearer ${access}`);
  }

  return config;
});

// Response: 401 bo‘lsa refresh qilib retry (single-flight) + min pending
http.interceptors.response.use(
  async (res: AxiosResponse) => {
    await ensureMinPending(res.config);
    return res;
  },
  async (error: AxiosError) => {
    const config = error.config;
    await ensureMinPending(config);

    const status = error.response?.status;
    if (status !== 401 || !config) return Promise.reject(error);

    // refresh endpoint o‘zidan 401 kelsa yoki allaqachon retry bo‘lsa -> logout
    if (config._retry || isRefreshUrl(config.url)) {
      cookie.clear("accessToken");
      cookie.clear("refreshToken");
      return Promise.reject(error);
    }

    const refresh = cookie.get("refreshToken");
    if (!refresh) {
      cookie.clear("accessToken");
      cookie.clear("refreshToken");
      return Promise.reject(error);
    }

    config._retry = true;

    try {
      // ✅ agar refresh allaqachon ketayotgan bo‘lsa — o‘shani kutamiz
      if (!refreshPromise) {
        refreshPromise = (async () => {
          const { data } = await refreshHttp.post<{ access?: string; refresh?: string }>(
            "/admin/auth/refresh/",
            { refresh }
          );

          const newAccess = data?.access;
          const newRefresh = data?.refresh;

          if (!newAccess) throw new Error("No access token returned from refresh");

          cookie.set("accessToken", newAccess);
          if (newRefresh) cookie.set("refreshToken", newRefresh);

          return newAccess;
        })().finally(() => {
          refreshPromise = null;
        });
      }

      const newAccess = await refreshPromise;

      // ✅ original requestni yangi access bilan qayta yuboramiz
      config.headers = new AxiosHeaders(config.headers);
      config.headers.set("Authorization", `Bearer ${newAccess}`);

      return http(config);
    } catch (e) {
      cookie.clear("accessToken");
      cookie.clear("refreshToken");
      return Promise.reject(e);
    }
  }
);