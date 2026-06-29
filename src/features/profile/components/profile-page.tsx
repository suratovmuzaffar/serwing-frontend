"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Camera,
  ChevronRight,
  Loader2,
  LogOut,
  Package,
  Save,
  Send,
  Settings,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateMeApi, uploadProfileImageApi } from "@/features/auth/api";
import { useAuthMe } from "@/features/auth/hooks/useAuthMe";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { setMe } from "@/features/auth/slice";
import {
  getTelegramInitData,
  getTelegramInitUserId,
} from "@/features/auth/services/telegram";
import type { AuthUser } from "@/features/auth/types";
import { getAssetUrl } from "@/lib/assets";
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
  const [telegramInitId, setTelegramInitId] = useState(() =>
    typeof window === "undefined" ? "" : getTelegramInitUserId()
  );
  const [form, setForm] = useState({
    profileFirstName: "",
    profileLastName: "",
    profilePhotoUrl: "",
    profileBio: "",
  });
  const [imageUploadError, setImageUploadError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const telegramInitIdTimeout = window.setTimeout(() => {
      setTelegramInitId(getTelegramInitUserId());
    }, 0);

    const hasLoginSignal =
      Boolean(new URLSearchParams(window.location.search).get("tgLoginToken")) ||
      Boolean(getTelegramInitData());

    if (!hasLoginSignal) {
      const redirectTimeout = window.setTimeout(() => {
        tokenStore.clear();
        setAuthChecked(true);
        router.replace(withLocale(locale, "/login"));
      }, 0);

      return () => {
        window.clearTimeout(telegramInitIdTimeout);
        window.clearTimeout(redirectTimeout);
      };
    }

    function syncToken() {
      const existingToken = tokenStore.getAccessToken();

      if (existingToken) {
        setHasToken(true);
        setAuthChecked(true);
        return true;
      }

      return false;
    }

    if (syncToken()) {
      return () => window.clearTimeout(telegramInitIdTimeout);
    }

    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      if (syncToken()) {
        window.clearInterval(interval);
        window.clearTimeout(telegramInitIdTimeout);
        return;
      }

      if (Date.now() - startedAt > 5000) {
        window.clearInterval(interval);
        window.clearTimeout(telegramInitIdTimeout);
        setAuthChecked(true);
        router.replace(withLocale(locale, "/login"));
      }
    }, 150);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(telegramInitIdTimeout);
    };
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
    const timeout = window.setTimeout(() => {
      setForm({
        profileFirstName: user.profileFirstName ?? splitName.firstName,
        profileLastName: user.profileLastName ?? splitName.lastName,
        profilePhotoUrl: user.profilePhotoUrl || "",
        profileBio: user.profileBio || "",
      });
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [user]);

  const updateProfile = useMutation({
    mutationFn: updateMeApi,
    onSuccess: (updatedUser) => {
      dispatch(setMe(updatedUser));
      queryClient.setQueryData(["auth-me"], updatedUser);
      setEditing(false);
    },
  });

  const uploadProfileImage = useMutation({
    mutationFn: async (file: File) => {
      const fileUrl = await uploadProfileImageApi(file);
      const updatedUser = await updateMeApi({ profilePhotoUrl: fileUrl });

      return { fileUrl, updatedUser };
    },
    onMutate: () => setImageUploadError(""),
    onSuccess: ({ fileUrl, updatedUser }) => {
      setForm((current) => ({
        ...current,
        profilePhotoUrl: fileUrl,
      }));
      dispatch(setMe(updatedUser));
      queryClient.setQueryData(["auth-me"], updatedUser);
    },
    onError: () => {
      setImageUploadError("Rasm yuklanmadi. Qayta urinib ko'ring.");
    },
  });

  const displayName = useMemo(
    () => (user ? getDisplayName(user) : "Anonim foydalanuvchi"),
    [user]
  );
  const displayPhoto = user ? getDisplayPhoto(user) : null;
  const profilePhoto = form.profilePhotoUrl || displayPhoto;
  const displayBio = user?.profileBio || "";

  function handleLogout() {
    logout.mutate(undefined, {
      onSettled: () => router.replace(withLocale(locale, "/login")),
    });
  }

  function handleProfileImageChange(file?: File) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageUploadError("Faqat rasm faylini tanlang.");
      return;
    }

    uploadProfileImage.mutate(file);
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

  if (telegramInitId && user.telegramId !== telegramInitId) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-4">
          {editing ? (
            <label
              className="group relative block cursor-pointer"
              aria-label="Profil rasmini almashtirish"
            >
              <Avatar name={displayName} photoUrl={profilePhoto} />
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-white transition-colors group-hover:bg-black/35">
                {uploadProfileImage.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin opacity-100" />
                ) : (
                  <Camera className="h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100" />
                )}
              </span>
              <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-sm">
                {uploadProfileImage.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Camera className="h-3.5 w-3.5" />
                )}
              </span>
              <input
                type="file"
                accept="image/*"
                disabled={uploadProfileImage.isPending}
                onChange={(event) => {
                  handleProfileImageChange(event.target.files?.[0]);
                  event.target.value = "";
                }}
                className="sr-only"
              />
            </label>
          ) : (
            <Avatar name={displayName} photoUrl={displayPhoto} />
          )}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold">{displayName}</h1>
            {displayBio && (
              <p className="line-clamp-1 text-sm text-muted-foreground">
                {displayBio}
              </p>
            )}
            {editing && (
              <p className="mt-1 text-xs text-muted-foreground">
                Avatarni almashtirish uchun rasmga bosing
              </p>
            )}
            {editing && imageUploadError && (
              <p className="mt-1 text-xs text-destructive">{imageUploadError}</p>
            )}
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
              if (uploadProfileImage.isPending) return;

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
            className="mt-5 space-y-4 border-t border-border pt-4"
          >
            <div className="space-y-3">
              <input
                value={form.profileFirstName}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    profileFirstName: event.target.value,
                  }))
                }
                placeholder="Ism"
                className="w-full border-0 border-b border-border bg-transparent px-0 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
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
                className="w-full border-0 border-b border-border bg-transparent px-0 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
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
                className="w-full resize-none border-0 border-b border-border bg-transparent px-0 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              />
            </div>
            <button
              type="submit"
              disabled={updateProfile.isPending || uploadProfileImage.isPending}
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
