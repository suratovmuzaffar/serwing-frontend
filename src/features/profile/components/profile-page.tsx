"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Loader2,
  LogOut,
  Save,
  Settings,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateMeApi } from "@/features/auth/api";
import { useAuthMe } from "@/features/auth/hooks/useAuthMe";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { setMe } from "@/features/auth/slice";
import { getTelegramInitData } from "@/features/auth/services/telegram";
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
  const fullName = [user.profileFirstName, user.profileLastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || user.profileName || "Anonim foydalanuvchi";
}

function getDisplayPhoto(user: AuthUser) {
  return user.profilePhotoUrl || null;
}

function splitProfileName(profileName?: string | null) {
  const parts = String(profileName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length <= 1) {
    return { firstName: parts[0] || "", lastName: "" };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

export function ProfilePage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const logout = useLogout();
  const [hasToken, setHasToken] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    profileFirstName: "",
    profileLastName: "",
    profilePhotoUrl: "",
    profileBio: "",
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasLoginSignal =
      Boolean(new URLSearchParams(window.location.search).get("tgLoginToken")) ||
      Boolean(getTelegramInitData());

    function syncToken() {
      const existingToken = tokenStore.getAccessToken();

      if (existingToken) {
        setHasToken(true);
        setAuthChecked(true);
        return true;
      }

      return false;
    }

    if (syncToken()) return;

    if (!hasLoginSignal) {
      setAuthChecked(true);
      router.replace(withLocale(locale, "/login"));
      return;
    }

    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      if (syncToken()) {
        window.clearInterval(interval);
        return;
      }

      if (Date.now() - startedAt > 5000) {
        window.clearInterval(interval);
        setAuthChecked(true);
        router.replace(withLocale(locale, "/login"));
      }
    }, 150);

    return () => window.clearInterval(interval);
  }, [locale, router]);

  const meQuery = useAuthMe(hasToken);
  const user = meQuery.data;

  useEffect(() => {
    if (meQuery.isError && authChecked) {
      tokenStore.clear();
      router.replace(withLocale(locale, "/login"));
    }
  }, [authChecked, locale, meQuery.isError, router]);

  useEffect(() => {
    if (!user) return;
    const splitName = splitProfileName(user.profileName);

    setForm({
      profileFirstName: user.profileFirstName ?? splitName.firstName,
      profileLastName: user.profileLastName ?? splitName.lastName,
      profilePhotoUrl: user.profilePhotoUrl || "",
      profileBio: user.profileBio || "",
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
  const displayBio = user?.profileBio || "SERWING foydalanuvchisi";

  function handleLogout() {
    logout.mutate(undefined, {
      onSettled: () => router.replace(withLocale(locale, "/login")),
    });
  }

  if (!authChecked || (hasToken && meQuery.isLoading)) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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

  return (
    <div className="px-4 pt-6">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-4">
          <Avatar name={displayName} photoUrl={displayPhoto} />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold">{displayName}</h1>
            <p className="line-clamp-1 text-sm text-muted-foreground">{displayBio}</p>
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
              const profileName = [
                form.profileFirstName,
                form.profileLastName,
              ]
                .filter(Boolean)
                .join(" ")
                .trim();

              updateProfile.mutate({
                profileFirstName: form.profileFirstName,
                profileLastName: form.profileLastName,
                profileName,
                profilePhotoUrl: form.profilePhotoUrl,
                profileBio: form.profileBio,
              });
            }}
            className="mt-5 space-y-3 border-t border-border pt-4"
          >
            <input
              value={form.profileFirstName}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  profileFirstName: event.target.value,
                }))
              }
              placeholder="Ism"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <input
              value={form.profileLastName}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  profileLastName: event.target.value,
                }))
              }
              placeholder="Familiya"
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
            <textarea
              value={form.profileBio}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  profileBio: event.target.value,
                }))
              }
              maxLength={240}
              rows={3}
              placeholder="Bio"
              className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
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

      <button
        type="button"
        onClick={handleLogout}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold text-destructive"
      >
        <LogOut className="h-4 w-4" />
        Chiqish
      </button>
    </div>
  );
}

export default ProfilePage;
