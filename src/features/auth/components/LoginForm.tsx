"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { useEffect, useState } from "react";

import {
  getTelegramInitData,
  initTelegramWebApp,
  openTelegramMiniApp,
} from "@/features/auth/services/telegram";
import { ENV } from "@/config/env";
import { getLocaleFromPath, withLocale } from "@/shared/i18n/path";

const TELEGRAM_DETECT_WAIT_MS = 4000;
const TELEGRAM_DETECT_POLL_MS = 100;

export function LoginForm() {
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);
  const [error, setError] = useState("");
  const [isInsideTelegram, setIsInsideTelegram] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    initTelegramWebApp();
    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      initTelegramWebApp();

      if (getTelegramInitData()) {
        setIsInsideTelegram(true);
        window.clearInterval(interval);
        return;
      }

      if (Date.now() - startedAt >= TELEGRAM_DETECT_WAIT_MS) {
        window.clearInterval(interval);
      }
    }, TELEGRAM_DETECT_POLL_MS);

    return () => window.clearInterval(interval);
  }, []);

  function handleTelegramLogin() {
    setError("");

    if (typeof window === "undefined") return;

    setLoading(true);
    const opened = openTelegramMiniApp(
      ENV.TELEGRAM_BOT_USERNAME,
      "profile",
      ENV.TELEGRAM_WEB_APP_SHORT_NAME
    );

    if (!opened) {
      setError("Telegram bot username sozlanmagan");
      setLoading(false);
      return;
    }

    window.setTimeout(() => setLoading(false), 1200);
  }

  if (isInsideTelegram && loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pt-6">
      <Link
        href={withLocale(locale, "/home")}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card"
        aria-label="Ortga"
      >
        <ArrowLeft className="h-5 w-5" />
      </Link>

      <div className="mt-10 rounded-2xl border border-border bg-card p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Send className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-2xl font-bold">Profilga kirish</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Telegram orqali tez va xavfsiz kiring
        </p>

        {error && (
          <div className="mt-5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleTelegramLogin}
          disabled={loading}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#229ED9] py-3.5 text-sm font-bold text-white transition-transform active:scale-[0.98] disabled:opacity-70"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Telegram orqali kirish
        </button>
      </div>
    </div>
  );
}

export default LoginForm;
