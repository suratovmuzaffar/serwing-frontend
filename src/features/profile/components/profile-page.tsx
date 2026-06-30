"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  ChevronRight,
  CircleUserRound,
  Loader2,
  LogOut,
  Package,
  Send,
  Settings,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useAuthMe } from "@/features/auth/hooks/useAuthMe";
import { useLogout } from "@/features/auth/hooks/useLogout";
import {
  getTelegramInitUserId,
  hasTelegramLoginSignal,
} from "@/features/auth/services/telegram";
import type { AuthUser } from "@/features/auth/types";
import { getAssetUrl } from "@/lib/assets";
import { subscribeToTokenChanges, tokenStore } from "@/lib/tokenStore";
import { getLocaleFromPath, withLocale } from "@/shared/i18n/path";

const AUTH_WAIT_MS = 15000;
const AUTH_POLL_MS = 150;

function Avatar({
  name,
  photoUrl,
  size = "lg",
}: {
  name: string;
  photoUrl?: string | null;
  size?: "sm" | "lg" | "xl";
}) {
  const className = {
    sm: "h-11 w-11 text-sm",
    lg: "h-16 w-16 text-2xl",
    xl: "h-24 w-24 text-4xl",
  }[size];
  const initial = (name || "U").charAt(0).toUpperCase();

  if (photoUrl) {
    return (
      <div
        className={`${className} shrink-0 rounded-full bg-cover bg-center`}
        style={{ backgroundImage: `url("${getAssetUrl(photoUrl)}")` }}
        aria-label={name}
      />
    );
  }

  return (
    <div
      className={`${className} flex shrink-0 items-center justify-center rounded-full bg-gradient-primary font-bold text-primary-foreground`}
    >
      {initial}
    </div>
  );
}

function getDisplayName(user: AuthUser) {
  const fullName = [user.profileFirstName, user.profileLastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || user.profileName || "Anonim foydalanuvchi";
}

function getDisplayPhoto(user: AuthUser) {
  return getAssetUrl(user.profilePhotoUrl);
}

function TelegramAvatar({ photoUrl }: { photoUrl?: string | null }) {
  if (photoUrl) {
    return (
      <div
        className="h-11 w-11 shrink-0 rounded-full bg-cover bg-center"
        style={{ backgroundImage: `url("${getAssetUrl(photoUrl)}")` }}
        aria-label="Telegram rasmi"
      />
    );
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
      <Send className="h-5 w-5" />
    </div>
  );
}

export function ProfilePage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);
  const logout = useLogout();
  const redirectedToLoginRef = useRef(false);
  const [isTelegramContext, setIsTelegramContext] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState("");
  const [telegramInitId, setTelegramInitId] = useState(() =>
    typeof window === "undefined" ? "" : getTelegramInitUserId()
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const startedAt = Date.now();

    function syncToken() {
      const hasLoginSignal = hasTelegramLoginSignal();
      const existingToken = tokenStore.getAccessToken();

      setIsTelegramContext(hasLoginSignal);
      setTelegramInitId(getTelegramInitUserId());
      setHasToken(Boolean(existingToken));

      if (existingToken) {
        redirectedToLoginRef.current = false;
        setAuthChecked(true);
        setAuthError("");
        return true;
      }

      if (!hasLoginSignal) {
        setAuthChecked(true);
        if (!redirectedToLoginRef.current) {
          redirectedToLoginRef.current = true;
          router.replace(withLocale(locale, "/login"));
        }
        return false;
      }

      if (Date.now() - startedAt > AUTH_WAIT_MS) {
        setAuthChecked(true);
        setAuthError(
          "Telegram orqali kirish yakunlanmadi. Iltimos, botdan qayta oching."
        );
      } else {
        setAuthChecked(false);
      }

      return false;
    }

    syncToken();

    const interval = window.setInterval(syncToken, AUTH_POLL_MS);
    const unsubscribe = subscribeToTokenChanges(syncToken);

    return () => {
      window.clearInterval(interval);
      unsubscribe();
    };
  }, [locale, router]);

  const meQuery = useAuthMe(hasToken);
  const user = meQuery.data;

  useEffect(() => {
    if (meQuery.isError && authChecked) {
      tokenStore.clear();
      router.replace(withLocale(locale, hasTelegramLoginSignal() ? "/profile" : "/login"));
    }
  }, [authChecked, locale, meQuery.isError, router]);

  const displayName = useMemo(
    () => (user ? getDisplayName(user) : "Anonim foydalanuvchi"),
    [user]
  );
  const displayPhoto = user ? getDisplayPhoto(user) : null;
  const displayBio = user?.profileBio || "";

  function handleLogout() {
    logout.mutate(undefined, {
      onSettled: () =>
        router.replace(
          withLocale(locale, hasTelegramLoginSignal() ? "/home" : "/login")
        ),
    });
  }

  if (!authChecked || (hasToken && meQuery.isLoading)) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (authError) {
    return (
      <div className="px-4 pt-10 text-center text-sm text-muted-foreground">
        {authError}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="px-4 pt-10 text-center text-sm text-muted-foreground">
        Profil yuklanmoqda...
      </div>
    );
  }

  if (telegramInitId && user.telegramId !== telegramInitId) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6">
      <section className="px-2 pb-2 pt-2">
        <div className="relative flex flex-col items-center text-center">
          <Avatar name={displayName} photoUrl={displayPhoto} size="xl" />
          <div className="mt-3 w-full min-w-0 px-10">
            <h1 className="truncate text-2xl font-bold leading-tight">{displayName}</h1>
            {displayBio && (
              <p className="mx-auto mt-1.5 line-clamp-2 max-w-[280px] text-sm leading-5 text-muted-foreground">
                {displayBio}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="mt-5 rounded-2xl border border-border bg-card p-5">
        <p className="text-sm font-semibold">Ulanganlar</p>
        <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-primary">
            <Send className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Telegram</p>
            <p className="truncate text-xs text-muted-foreground">
              {user.telegramId ? `ID: ${user.telegramId}` : "Ulanmagan"}
            </p>
          </div>
          <TelegramAvatar photoUrl={user.telegramPhotoUrl} />
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-card">
        {[
          { label: "Profil sozlamalari", icon: CircleUserRound, action: "profile" },
          { label: "E'lonlarim", icon: Package, action: "listings" },
          { label: "Sozlamalar", icon: Settings },
          ...(isTelegramContext
            ? []
            : [{ label: "Chiqish", icon: LogOut, danger: true }]),
        ].map((item, index) => (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              if (item.action === "profile") {
                router.push(withLocale(locale, "/profile-settings"));
              }

              if (item.action === "listings") {
                router.push(withLocale(locale, "/my-announcements"));
              }

              if (item.label === "Chiqish") {
                handleLogout();
              }
            }}
            className={`flex w-full items-center gap-3 px-4 py-3.5 text-sm transition-colors hover:bg-secondary ${
              index > 0 ? "border-t border-border" : ""
            } ${
              item.danger ? "text-destructive" : ""
            }`}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="min-w-0 flex-1 text-left font-medium">
              {item.label}
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default ProfilePage;
