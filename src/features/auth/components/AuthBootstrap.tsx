"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { telegramLinkLoginApi, telegramLoginApi } from "@/features/auth/api";
import { setMe } from "@/features/auth/slice";
import {
  getTelegramInitData,
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

    if (tokenStore.getAccessToken()) return;

    const searchParams = new URLSearchParams(window.location.search);
    const loginToken = searchParams.get("tgLoginToken");
    const initData = getTelegramInitData();
    const loginKey = loginToken ? `link:${loginToken}` : initData ? `init:${initData}` : "";

    if (!loginKey || attemptedKeyRef.current === loginKey) return;

    attemptedKeyRef.current = loginKey;

    let cancelled = false;

    async function login() {
      try {
        const result = loginToken
          ? await telegramLinkLoginApi(loginToken)
          : await telegramLoginApi(initData);

        if (cancelled) return;

        tokenStore.setTokens(result.token, result.refreshToken);
        dispatch(setMe(result.user));
        queryClient.setQueryData(["auth-me"], result.user);

        if (loginToken) {
          const cleanUrl = new URL(window.location.href);
          cleanUrl.searchParams.delete("tgLoginToken");
          window.history.replaceState(null, "", cleanUrl.toString());
        }

        if (pathname.includes("/login")) {
          router.replace(withLocale(getLocaleFromPath(pathname), "/profile"));
          return;
        }

        router.refresh();
      } catch {
        tokenStore.clear();
      }
    }

    void login();

    return () => {
      cancelled = true;
    };
  }, [dispatch, pathname, queryClient, router]);

  return null;
}
