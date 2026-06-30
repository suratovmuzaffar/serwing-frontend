"use client";

import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Camera, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  updateMeApi,
  uploadProfileImageApi,
} from "@/features/auth/api";
import { useAuthMe } from "@/features/auth/hooks/useAuthMe";
import { hasTelegramLoginSignal } from "@/features/auth/services/telegram";
import { setMe } from "@/features/auth/slice";
import type { AuthUser } from "@/features/auth/types";
import { getAssetUrl } from "@/lib/assets";
import { tokenStore } from "@/lib/tokenStore";
import { useAppDispatch } from "@/store/hooks";
import { getLocaleFromPath, withLocale } from "@/shared/i18n/path";

function Avatar({ name, photoUrl }: { name: string; photoUrl?: string | null }) {
  const initial = (name || "U").charAt(0).toUpperCase();

  if (photoUrl) {
    return (
      <div
        className="h-24 w-24 shrink-0 rounded-full bg-cover bg-center"
        style={{ backgroundImage: `url("${getAssetUrl(photoUrl)}")` }}
        aria-label={name}
      />
    );
  }

  return (
    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-4xl font-bold text-primary-foreground">
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

function ProfileField({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
}) {
  const fieldClass =
    "mt-1.5 w-full rounded-2xl border border-border bg-card px-4 py-3 text-left text-sm font-semibold outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:bg-white";

  return (
    <label className="block">
      <span className="px-1 text-xs font-semibold text-muted-foreground">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          maxLength={240}
          rows={3}
          placeholder={placeholder}
          className={`${fieldClass} min-h-28 resize-none leading-5`}
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={fieldClass}
        />
      )}
    </label>
  );
}

export function ProfileSettingsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const [imageUploadError, setImageUploadError] = useState("");
  const [form, setForm] = useState({
    profileFirstName: "",
    profileLastName: "",
    profilePhotoUrl: "",
    profileBio: "",
  });

  const meQuery = useAuthMe(Boolean(tokenStore.getAccessToken()));
  const user = meQuery.data;

  useEffect(() => {
    if (meQuery.isError) {
      tokenStore.clear();
      router.replace(withLocale(locale, hasTelegramLoginSignal() ? "/home" : "/login"));
    }
  }, [locale, meQuery.isError, router]);

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
      router.replace(withLocale(locale, "/profile"));
    },
  });

  const uploadProfileImage = useMutation({
    mutationFn: async (file: File) => {
      return uploadProfileImageApi(file);
    },
    onMutate: () => setImageUploadError(""),
    onSuccess: (fileUrl) => {
      setForm((current) => ({
        ...current,
        profilePhotoUrl: fileUrl,
      }));
    },
    onError: () => {
      setImageUploadError("Rasm yuklanmadi. Qayta urinib ko'ring.");
    },
  });

  function handleProfileImageChange(file?: File) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageUploadError("Faqat rasm faylini tanlang.");
      return;
    }

    uploadProfileImage.mutate(file);
  }

  if (meQuery.isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const displayName = getDisplayName(user);
  const profilePhoto = form.profilePhotoUrl || user.profilePhotoUrl;

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push(withLocale(locale, "/profile"))}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground"
          aria-label="Ortga"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold">Profil sozlamalari</h1>
      </div>

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
        className="mx-auto mt-8 max-w-sm space-y-4"
      >
        <label
          className="mx-auto flex w-max cursor-pointer flex-col items-center gap-2"
          aria-label="Profil rasmini almashtirish"
        >
          <span className="relative block">
            <Avatar name={displayName} photoUrl={profilePhoto} />
            <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-sm">
              {uploadProfileImage.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </span>
          </span>
          {imageUploadError && (
            <span className="text-xs text-destructive">{imageUploadError}</span>
          )}
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

        <div className="grid grid-cols-2 gap-3">
          <ProfileField
            label="Ism"
            value={form.profileFirstName}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                profileFirstName: value,
              }))
            }
            placeholder="Ism"
          />
          <ProfileField
            label="Familiya"
            value={form.profileLastName}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                profileLastName: value,
              }))
            }
            placeholder="Familiya"
          />
        </div>
        <ProfileField
          label="Bio"
          value={form.profileBio}
          onChange={(value) =>
            setForm((current) => ({
              ...current,
              profileBio: value,
            }))
          }
          placeholder="Bio"
          multiline
        />
        <button
          type="submit"
          disabled={updateProfile.isPending || uploadProfileImage.isPending}
          className="mx-auto flex h-12 min-w-40 items-center justify-center gap-2 rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-70"
        >
          {updateProfile.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Saqlash
        </button>
      </form>
    </div>
  );
}

export default ProfileSettingsPage;
