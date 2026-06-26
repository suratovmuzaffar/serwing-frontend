"use client";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData?: string;
        ready?: () => void;
        expand?: () => void;
      };
    };
  }
}

export function getTelegramInitData() {
  if (typeof window === "undefined") return "";

  const sdkInitData = window.Telegram?.WebApp?.initData ?? "";
  if (sdkInitData) return sdkInitData;

  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  const hashParams = new URLSearchParams(hash);

  return hashParams.get("tgWebAppData") ?? "";
}

export function initTelegramWebApp() {
  if (typeof window === "undefined") return;

  window.Telegram?.WebApp?.ready?.();
  window.Telegram?.WebApp?.expand?.();
}

