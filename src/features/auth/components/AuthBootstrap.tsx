"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import {
  fetchMe,
  telegramLinkLoginApi,
  telegramLoginApi,
} from "@/features/auth/api";
import { clearMe, setMe } from "@/features/auth/slice";
import {
  hasTelegramLoginSignal,
  getTelegramInitData,
  getTelegramInitUserId,
  getTelegramStartParam,
  initTelegramWebApp,
} from "@/features/auth/services/telegram";
import { tokenStore } from "@/lib/tokenStore";
import { useAppDispatch } from "@/store/hooks";
import { defaultLocale } from "@/shared/i18n/config";
import { getLocaleFromPath, stripLocale, withLocale } from "@/shared/i18n/path";
import {
  getPreferredLocale,
  syncStoredUserLocale,
} from "@/shared/i18n/preference";

const TELEGRAM_LOGIN_WAIT_MS = 20000;
const TELEGRAM_LOGIN_POLL_MS = 100;

export function AuthBootstrap() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const attemptedKeyRef = useRef("");
  const inFlightKeyRef = useRef("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    initTelegramWebApp();

    const currentLocale = getLocaleFromPath(pathname);
    if (!tokenStore.getAccessToken() && !hasTelegramLoginSignal()) {
      const preferredLocale = getPreferredLocale(defaultLocale);

      if (currentLocale !== preferredLocale) {
        router.replace(withLocale(preferredLocale, stripLocale(pathname)));
        return;
      }
    }

    async function syncExistingSessionLocale() {
      if (!tokenStore.getAccessToken() || hasTelegramLoginSignal()) return;

      try {
        const user = await fetchMe();
        dispatch(setMe(user));
        queryClient.setQueryData(["auth-me"], user);

        const userLocale = syncStoredUserLocale(user);
        if (getLocaleFromPath(pathname) !== userLocale) {
          router.replace(withLocale(userLocale, stripLocale(pathname)));
        }
      } catch {
        tokenStore.clear();
        dispatch(clearMe());
        queryClient.removeQueries({ queryKey: ["auth-me"] });
      }
    }

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
      loginKey,
    }: {
      initData: string;
      initTelegramId: string;
      loginToken: string;
      rawLoginToken: string | null;
      startParam: string;
      openTarget: string;
      loginKey: string;
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

        if (initTelegramId && result.user.telegramId !== initTelegramId) {
          throw new Error("Telegram account mismatch");
        }

        tokenStore.setTokens(result.token, result.refreshToken);
        dispatch(setMe(result.user));
        queryClient.setQueryData(["auth-me"], result.user);
        attemptedKeyRef.current = loginKey;
        const userLocale = syncStoredUserLocale(result.user);

        cleanLoginParamsFromUrl(rawLoginToken);

        const shouldOpenProfile =
          pathname.includes("/login") ||
          openTarget === "profile" ||
          startParam === "login" ||
          startParam === "profile" ||
          startParam.startsWith("ref");
        const nextLocale = userLocale ?? getPreferredLocale(getLocaleFromPath(pathname));

        if (shouldOpenProfile) {
          router.replace(withLocale(nextLocale, "/profile"));
          return;
        }

        if (getLocaleFromPath(pathname) !== nextLocale) {
          router.replace(withLocale(nextLocale, stripLocale(pathname)));
          return;
        }

        router.refresh();
      } catch (error) {
        const isTelegramAccountMismatch =
          error instanceof Error && error.message === "Telegram account mismatch";
        const hasTelegramLoginSignal = Boolean(initData || loginToken);
        attemptedKeyRef.current = loginKey;

        if (previousAccessToken && !hasTelegramLoginSignal && !isTelegramAccountMismatch) {
          tokenStore.setTokens(previousAccessToken, previousRefreshToken);
          void queryClient.invalidateQueries({ queryKey: ["auth-me"] });
          router.refresh();
        } else {
          tokenStore.clear();
          dispatch(clearMe());
          queryClient.removeQueries({ queryKey: ["auth-me"] });
        }

        if (hasTelegramLoginSignal || !pathname.includes("/login")) {
          const loginUrl = new URL(
            withLocale(getPreferredLocale(getLocaleFromPath(pathname)), "/login"),
            window.location.origin
          );

          if (hasTelegramLoginSignal) {
            loginUrl.searchParams.set("tgAuthFailed", "start_required");
          }

          router.replace(loginUrl.pathname + loginUrl.search);
        }
      } finally {
        if (inFlightKeyRef.current === loginKey) {
          inFlightKeyRef.current = "";
        }
      }
    }

    const startedAt = Date.now();
    void syncExistingSessionLocale();

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

      if (inFlightKeyRef.current === loginKey) {
        return;
      }

      if (attemptedKeyRef.current === loginKey) {
        window.clearInterval(interval);
        return;
      }

      inFlightKeyRef.current = loginKey;
      window.clearInterval(interval);
      void login({
        initData,
        initTelegramId,
        loginToken,
        rawLoginToken,
        startParam,
        openTarget,
        loginKey,
      });
    }, TELEGRAM_LOGIN_POLL_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [dispatch, pathname, queryClient, router]);

  return null;
}
