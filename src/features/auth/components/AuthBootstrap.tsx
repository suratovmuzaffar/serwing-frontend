"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import {
  telegramLinkLoginApi,
  telegramLoginApi,
} from "@/features/auth/api";
import { clearMe, setMe } from "@/features/auth/slice";
import {
  getTelegramInitData,
  getTelegramInitUserId,
  getTelegramStartParam,
  initTelegramWebApp,
} from "@/features/auth/services/telegram";
import { tokenStore } from "@/lib/tokenStore";
import { useAppDispatch } from "@/store/hooks";
import { getLocaleFromPath, withLocale } from "@/shared/i18n/path";

const TELEGRAM_LOGIN_WAIT_MS = 4000;
const TELEGRAM_LOGIN_POLL_MS = 100;

export function AuthBootstrap() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const attemptedKeyRef = useRef("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    initTelegramWebApp();

    let cancelled = false;

    function cleanLoginParamsFromUrl(rawLoginToken: string | null) {
      if (!rawLoginToken) return;

      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete("tgLoginToken");
      cleanUrl.searchParams.delete("tgOpen");
      window.history.replaceState(null, "", cleanUrl.toString());
    }

    async function login({
      initData,
      initTelegramId,
      loginToken,
      rawLoginToken,
      startParam,
      openTarget,
    }: {
      initData: string;
      initTelegramId: string;
      loginToken: string;
      rawLoginToken: string | null;
      startParam: string;
      openTarget: string;
    }) {
      const previousAccessToken = tokenStore.getAccessToken();
      const previousRefreshToken = tokenStore.getRefreshToken() || undefined;

      try {
        if (initTelegramId) {
          tokenStore.clear();
          dispatch(clearMe());
          queryClient.removeQueries({ queryKey: ["auth-me"] });
        }

        const result = loginToken
          ? await telegramLinkLoginApi(loginToken)
          : await telegramLoginApi(initData);

        if (cancelled) return;

        if (initTelegramId && result.user.telegramId !== initTelegramId) {
          throw new Error("Telegram account mismatch");
        }

        tokenStore.setTokens(result.token, result.refreshToken);
        dispatch(setMe(result.user));
        queryClient.setQueryData(["auth-me"], result.user);

        cleanLoginParamsFromUrl(rawLoginToken);

        const shouldOpenProfile =
          pathname.includes("/login") ||
          openTarget === "profile" ||
          startParam === "login" ||
          startParam === "profile" ||
          startParam.startsWith("ref");

        if (shouldOpenProfile) {
          router.replace(withLocale(getLocaleFromPath(pathname), "/profile"));
          return;
        }

        router.refresh();
      } catch (error) {
        const isTelegramAccountMismatch =
          error instanceof Error && error.message === "Telegram account mismatch";
        const hasTelegramLoginSignal = Boolean(initData || loginToken);

        if (previousAccessToken && !isTelegramAccountMismatch) {
          tokenStore.setTokens(previousAccessToken, previousRefreshToken);
          void queryClient.invalidateQueries({ queryKey: ["auth-me"] });
          router.refresh();
        } else {
          tokenStore.clear();
          dispatch(clearMe());
          queryClient.removeQueries({ queryKey: ["auth-me"] });
        }

        if (!hasTelegramLoginSignal && !pathname.includes("/login")) {
          router.replace(withLocale(getLocaleFromPath(pathname), "/login"));
        }
      }
    }

    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      initTelegramWebApp();

      const searchParams = new URLSearchParams(window.location.search);
      const rawLoginToken = searchParams.get("tgLoginToken");
      const openTarget = searchParams.get("tgOpen") || "";
      const initData = getTelegramInitData();
      const initTelegramId = getTelegramInitUserId(initData);
      const startParam = getTelegramStartParam(initData);
      const loginToken = initData ? "" : rawLoginToken || "";
      const loginKey = initData ? `init:${initData}` : loginToken ? `link:${loginToken}` : "";

      if (!loginKey) {
        if (Date.now() - startedAt >= TELEGRAM_LOGIN_WAIT_MS) {
          window.clearInterval(interval);
        }
        return;
      }

      if (attemptedKeyRef.current === loginKey) {
        window.clearInterval(interval);
        return;
      }

      attemptedKeyRef.current = loginKey;
      window.clearInterval(interval);
      void login({
        initData,
        initTelegramId,
        loginToken,
        rawLoginToken,
        startParam,
        openTarget,
      });
    }, TELEGRAM_LOGIN_POLL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [dispatch, pathname, queryClient, router]);

  return null;
}
