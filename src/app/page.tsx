"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { initTelegramWebApp } from "@/features/auth/services/telegram";
import { defaultLocale } from "@/shared/i18n/config";
import { getEffectiveStoredLocale } from "@/shared/i18n/preference";
import { withLocale } from "@/shared/i18n/path";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    initTelegramWebApp();

    const storedLocale = getEffectiveStoredLocale();
    if (storedLocale) {
      router.replace(withLocale(storedLocale, "/profile"));
      return;
    }

    router.replace(withLocale(defaultLocale, "/profile"));
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
      Yuklanmoqda...
    </div>
  );
}
