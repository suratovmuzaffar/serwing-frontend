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
  getTelegramInitData,
  getTelegramInitUserId,
  initTelegramWebApp,
} from "@/features/auth/services/telegram";
import { tokenStore } from "@/lib/tokenStore";
import { useAppDispatch } from "@/store/hooks";
import { getLocaleFromPath, withLocale } from "@/shared/i18n/path";

export function AuthBootstrap() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const attemptedKeyRef = useRef("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    initTelegramWebApp();

    const searchParams = new URLSearchParams(window.location.search);
    const rawLoginToken = searchParams.get("tgLoginToken");
    const initData = getTelegramInitData();
    const initTelegramId = getTelegramInitUserId(initData);
    const loginToken = initData ? "" : rawLoginToken;
    const loginKey = initData ? `init:${initData}` : loginToken ? `link:${loginToken}` : "";

    if (!loginKey || attemptedKeyRef.current === loginKey) return;

    attemptedKeyRef.current = loginKey;

    let cancelled = false;

    function cleanLoginTokenFromUrl() {
      if (!rawLoginToken) return;

      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete("tgLoginToken");
      window.history.replaceState(null, "", cleanUrl.toString());
    }

    async function login() {
      try {
        const existingToken = tokenStore.getAccessToken();

        if (existingToken && !loginToken && initTelegramId) {
          const currentUser = await fetchMe().catch(() => null);

          if (cancelled) return;

          if (currentUser?.telegramId === initTelegramId) {
            dispatch(setMe(currentUser));
            queryClient.setQueryData(["auth-me"], currentUser);
            cleanLoginTokenFromUrl();
            return;
          }

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

        cleanLoginTokenFromUrl();

        if (pathname.includes("/login")) {
          router.replace(withLocale(getLocaleFromPath(pathname), "/profile"));
          return;
        }

        router.refresh();
      } catch {
        tokenStore.clear();
        dispatch(clearMe());
        queryClient.removeQueries({ queryKey: ["auth-me"] });

        if (!pathname.includes("/login")) {
          router.replace(withLocale(getLocaleFromPath(pathname), "/login"));
        }
      }
    }

    void login();

    return () => {
      cancelled = true;
    };
  }, [dispatch, pathname, queryClient, router]);

  return null;
}
