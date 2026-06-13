"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cookie } from "@/lib/cookie";

type Mode = "yes" | "no";

/**
 * mode:
 *  - "no": accessToken YO‘Q bo‘lsa -> to ga redirect (protected page)
 *  - "yes": accessToken BOR bo‘lsa -> to ga redirect (guest-only page, masalan login)
 */
export function useAuthRedirect(to: string, mode: Mode) {
  const router = useRouter();
  const pathname = usePathname();

  // ✅ cookie snapshot (SSR-safe)
  const accessToken = useSyncExternalStore(
    // subscribe: cookie o‘zgarishini "poll" bilan kuzatamiz (browser cookie event yo‘q)
    (cb) => {
      const i = window.setInterval(cb, 500);
      return () => window.clearInterval(i);
    },
    () => cookie.get("accessToken") ?? "",
    () => "" // server snapshot
  );

  const hasAccess = Boolean(accessToken);

  // ✅ qachon UI ko‘rsatish kerak?
  // protected page (mode="no") => token bo'lmasa UI yashiramiz
  // guest-only page (mode="yes") => token bo'lsa UI yashiramiz
  const allowRender = useMemo(() => {
    if (pathname === to) return true; // shu sahifaga o'zi bo'lsa, render bo'laversin
    if (mode === "no") return hasAccess; // token bo'lsa render
    return !hasAccess; // mode === "yes": token bo'lmasa render (login page)
  }, [hasAccess, mode, pathname, to]);

  useEffect(() => {
    if (pathname === to) return;

    if (mode === "no") {
      if (!hasAccess) router.replace(to);
      return;
    }

    // mode === "yes"
    if (hasAccess) router.replace(to);
  }, [hasAccess, mode, pathname, router, to]);

  return { allowRender, hasAccess };
}