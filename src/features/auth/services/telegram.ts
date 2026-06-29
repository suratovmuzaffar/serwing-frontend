"use client";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData?: string;
        ready?: () => void;
        expand?: () => void;
        openTelegramLink?: (url: string) => void;
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

export function getTelegramInitUserId(initData = getTelegramInitData()) {
  if (!initData) return "";

  const userJson = new URLSearchParams(initData).get("user");
  if (!userJson) return "";

  try {
    const user = JSON.parse(userJson) as { id?: string | number };
    return user.id ? String(user.id) : "";
  } catch {
    return "";
  }
}

export function getTelegramStartParam(initData = getTelegramInitData()) {
  if (!initData) return "";

  return new URLSearchParams(initData).get("start_param") ?? "";
}

export function initTelegramWebApp() {
  if (typeof window === "undefined") return;

  window.Telegram?.WebApp?.ready?.();
  window.Telegram?.WebApp?.expand?.();
}

export function isTelegramWebApp() {
  return Boolean(getTelegramInitData());
}

export function getTelegramBotStartUrl(username: string, start = "login") {
  const cleanUsername = username.trim().replace(/^@/, "");
  const cleanStart = encodeURIComponent(start);

  if (!cleanUsername) return "";

  return `https://t.me/${cleanUsername}?start=${cleanStart}`;
}

export function openTelegramUrl(url: string) {
  if (typeof window === "undefined" || !url) return false;

  if (window.Telegram?.WebApp?.openTelegramLink) {
    window.Telegram.WebApp.openTelegramLink(url);
  } else {
    window.location.href = url;
  }

  return true;
}

export function openTelegramBot(username: string, start = "login") {
  const url = getTelegramBotStartUrl(username, start);
  return openTelegramUrl(url);
}
