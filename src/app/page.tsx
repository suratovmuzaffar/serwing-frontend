"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  getTelegramInitData,
  getTelegramInitUserLanguage,
  initTelegramWebApp,
} from "@/features/auth/services/telegram";
import { defaultLocale } from "@/shared/i18n/config";
import {
  getStoredLocale,
  normalizeLocale,
  setStoredLocale,
} from "@/shared/i18n/preference";
import { withLocale } from "@/shared/i18n/path";

const TELEGRAM_LOCALE_WAIT_MS = 4000;
const TELEGRAM_LOCALE_POLL_MS = 100;

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    initTelegramWebApp();

    const storedLocale = getStoredLocale();
    if (storedLocale) {
      router.replace(withLocale(storedLocale, "/profile"));
      return;
    }

    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      initTelegramWebApp();

      const initData = getTelegramInitData();
      const telegramLocale = normalizeLocale(getTelegramInitUserLanguage(initData));

      if (telegramLocale) {
        setStoredLocale(telegramLocale);
        window.clearInterval(interval);
        router.replace(withLocale(telegramLocale, "/profile"));
        return;
      }

      if (Date.now() - startedAt >= TELEGRAM_LOCALE_WAIT_MS) {
        window.clearInterval(interval);
        router.replace(withLocale(defaultLocale, "/profile"));
      }
    }, TELEGRAM_LOCALE_POLL_MS);

    return () => window.clearInterval(interval);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
      Yuklanmoqda...
    </div>
  );
}
