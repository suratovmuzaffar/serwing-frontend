"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData?: string;
        ready?: () => void;
      };
    };
  }
}

const BOT_USERNAME = "serwing_bot";

function getLocale(pathname: string) {
  const locale = pathname.split("/").filter(Boolean)[0];
  return locale || "uz";
}

export function LoginForm() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const [error, setError] = useState("");
  const [isInsideTelegram, setIsInsideTelegram] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ ref - useEffect dependency'ga kiritmaslik uchun
  const autoLoginTriggered = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.Telegram?.WebApp?.ready?.();
    const initData = window.Telegram?.WebApp?.initData ?? "";
    setIsInsideTelegram(!!initData);

    if (initData && !autoLoginTriggered.current) {
      autoLoginTriggered.current = true;
      void doAutoLogin(initData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function doAutoLogin(initData: string) {
    try {
      setLoading(true);
      // Simulate login
      await new Promise((resolve) => setTimeout(resolve, 800));
      router.push(`/${locale}/profile`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Telegram orqali kirishda xatolik yuz berdi"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleTelegramLogin() {
    setError("");

    if (typeof window === "undefined") return;

    if (isInsideTelegram) {
      const initData = window.Telegram?.WebApp?.initData ?? "";
      if (initData) {
        await doAutoLogin(initData);
      }
    } else {
      const appUrl = encodeURIComponent(window.location.origin);
      window.open(`https://t.me/${BOT_USERNAME}?startapp=${appUrl}`, "_blank");
    }
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
        href={`/${locale}/home`}
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
