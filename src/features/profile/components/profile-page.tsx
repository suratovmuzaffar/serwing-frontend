"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  Coins,
  Gift,
  Loader2,
  LogOut,
  Package,
  Save,
  Send,
  Settings,
  Star,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { telegramLoginApi, updateMeApi } from "@/features/auth/api";
import { useAuthMe } from "@/features/auth/hooks/useAuthMe";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { setMe } from "@/features/auth/slice";
import {
  getTelegramInitData,
  initTelegramWebApp,
} from "@/features/auth/services/telegram";
import type { AuthUser } from "@/features/auth/types";
import { tokenStore } from "@/lib/tokenStore";
import { useAppDispatch } from "@/store/hooks";
import { getLocaleFromPath, withLocale } from "@/shared/i18n/path";

function Avatar({
  name,
  photoUrl,
  size = "lg",
}: {
  name: string;
  photoUrl?: string | null;
  size?: "sm" | "lg";
}) {
  const className =
    size === "lg"
      ? "h-16 w-16 text-2xl"
      : "h-11 w-11 text-sm";
  const initial = (name || "U").charAt(0).toUpperCase();

  if (photoUrl) {
    return (
      <div
        className={`${className} shrink-0 rounded-full bg-cover bg-center`}
        style={{ backgroundImage: `url("${photoUrl}")` }}
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
  return (
    user.profileName ||
    user.telegramName ||
    user.telegramUsername ||
    (user.telegramId ? `Telegram ${user.telegramId}` : "Anonim foydalanuvchi")
  );
}

function getDisplayPhoto(user: AuthUser) {
  return user.profilePhotoUrl || user.telegramPhotoUrl || null;
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Package;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 text-center">
      <Icon className="mx-auto h-4 w-4 text-primary" />
      <p className="mt-1 text-lg font-bold">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

export function ProfilePage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const logout = useLogout();
  const [hasToken, setHasToken] = useState(false);
  const [autoLoginLoading, setAutoLoginLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ profileName: "", profilePhotoUrl: "" });
  const [points] = useState(5);

  useEffect(() => {
    if (typeof window === "undefined") return;

    initTelegramWebApp();
    const existingToken = tokenStore.getAccessToken();
    if (existingToken) {
      setHasToken(true);
      setAutoLoginLoading(false);
      return;
    }

    const initData = getTelegramInitData();
    if (!initData) {
      setAutoLoginLoading(false);
      router.replace(withLocale(locale, "/login"));
      return;
    }

    let cancelled = false;

    async function loginFromTelegram() {
      try {
        const result = await telegramLoginApi(initData);
        if (cancelled) return;

        tokenStore.setTokens(result.token, result.refreshToken);
        dispatch(setMe(result.user));
        queryClient.setQueryData(["auth-me"], result.user);
        setHasToken(true);
      } catch (err) {
        if (cancelled) return;
        setAuthError(
          err instanceof Error
            ? err.message
            : "Telegram orqali kirishda xatolik yuz berdi"
        );
        router.replace(withLocale(locale, "/login"));
      } finally {
        if (!cancelled) setAutoLoginLoading(false);
      }
    }

    void loginFromTelegram();

    return () => {
      cancelled = true;
    };
  }, [dispatch, locale, queryClient, router]);

  const meQuery = useAuthMe(hasToken);
  const user = meQuery.data;

  useEffect(() => {
    if (meQuery.isError && !autoLoginLoading) {
      tokenStore.clear();
      router.replace(withLocale(locale, "/login"));
    }
  }, [autoLoginLoading, locale, meQuery.isError, router]);

  useEffect(() => {
    if (!user) return;

    setForm({
      profileName: user.profileName || user.telegramName || user.telegramUsername || "",
      profilePhotoUrl: user.profilePhotoUrl || user.telegramPhotoUrl || "",
    });
  }, [user]);

  const updateProfile = useMutation({
    mutationFn: updateMeApi,
    onSuccess: (updatedUser) => {
      dispatch(setMe(updatedUser));
      queryClient.setQueryData(["auth-me"], updatedUser);
      setEditing(false);
    },
  });

  const displayName = useMemo(
    () => (user ? getDisplayName(user) : "Anonim foydalanuvchi"),
    [user]
  );
  const displayPhoto = user ? getDisplayPhoto(user) : null;
  const referralCode = user?.telegramId ? `TG${user.telegramId}` : "SERWING";

  function handleLogout() {
    logout.mutate(undefined, {
      onSettled: () => router.replace(withLocale(locale, "/login")),
    });
  }

  if (autoLoginLoading || (hasToken && meQuery.isLoading)) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="px-4 pt-10 text-center text-sm text-muted-foreground">
        {authError || "Profil yuklanmoqda..."}
      </div>
    );
  }

  return (
    <div className="px-4 pt-6">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-4">
          <Avatar name={displayName} photoUrl={displayPhoto} />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold">{displayName}</h1>
            <p className="truncate text-sm text-muted-foreground">
              {user.email || (user.telegramUsername ? `@${user.telegramUsername}` : `ID ${user.telegramId}`)}
            </p>
            <div className="mt-1 flex items-center gap-1 text-xs text-warning">
              <Star className="h-3 w-3 fill-warning" /> 4.9 reyting
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEditing((value) => !value)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary"
            aria-label="Profilni tahrirlash"
          >
            {editing ? <X className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
          </button>
        </div>

        {editing && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              updateProfile.mutate({
                profileName: form.profileName,
                profilePhotoUrl: form.profilePhotoUrl,
              });
            }}
            className="mt-5 space-y-3 border-t border-border pt-4"
          >
            <input
              value={form.profileName}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  profileName: event.target.value,
                }))
              }
              placeholder="Ism familiya"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <input
              value={form.profilePhotoUrl}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  profilePhotoUrl: event.target.value,
                }))
              }
              placeholder="Rasm URL"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={updateProfile.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-70"
            >
              {updateProfile.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Saqlash
            </button>
          </form>
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">Kirish usullari</h2>
        <div className="mt-3 flex items-center gap-3 rounded-xl bg-secondary px-3 py-2.5">
          <Send className="h-4 w-4 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Telegram</p>
            <p className="truncate text-xs text-muted-foreground">
              {user.telegramId ? `ID ${user.telegramId}` : "Ulanmagan"}
            </p>
          </div>
          <span className="rounded-full bg-success/20 px-2 py-0.5 text-[10px] font-semibold text-success">
            Tasdiqlangan
          </span>
          <Avatar name={user.telegramName || displayName} photoUrl={user.telegramPhotoUrl} size="sm" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Stat icon={Package} label="E'lonlar" value="8" />
        <Stat icon={CheckCircle2} label="Sotilgan" value="23" />
        <Stat icon={Clock} label="Faol" value="2" />
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Coins className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">{points} ball</p>
            <p className="text-xs text-muted-foreground">
              1 ta e&apos;lon joylash uchun 1 ball kerak
            </p>
          </div>
        </div>
        <div className="mt-3 rounded-xl bg-secondary p-3">
          <p className="text-[10px] font-semibold uppercase text-muted-foreground">
            Referral kod
          </p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="truncate text-sm font-bold">{referralCode}</span>
            <button
              type="button"
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
            >
              <Gift className="h-3.5 w-3.5" /> +1 ball
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-4 text-center">
        <h2 className="text-sm font-semibold">Mening e&apos;lonlarim</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Joylagan e&apos;lonlaringiz home sahifasida ko&apos;rinadi.
        </p>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        {[
          { label: "Sozlamalar", icon: Settings },
          { label: "Mening sotuvlarim", icon: Package },
          { label: "Chiqish", icon: LogOut, danger: true },
        ].map((item, index) => (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              if (item.label === "Chiqish") {
                handleLogout();
              }
            }}
            className={`flex w-full items-center gap-3 px-4 py-3.5 text-sm transition-colors hover:bg-secondary ${
              index > 0 ? "border-t border-border" : ""
            } ${item.danger ? "text-destructive" : ""}`}
          >
            <item.icon className="h-4 w-4" />
            <span className="flex-1 text-left font-medium">{item.label}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default ProfilePage;
