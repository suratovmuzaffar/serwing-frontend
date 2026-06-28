"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Check, ImagePlus, Loader2, Upload, X } from "lucide-react";

import { categories } from "@/lib/data";
import { tokenStore } from "@/lib/tokenStore";
import { getLocaleFromPath, withLocale } from "@/shared/i18n/path";
import {
  createListing,
  uploadListingImage,
} from "@/features/add/services/add-listing";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

export function AddPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "coc");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === categoryId) ?? categories[0],
    [categoryId]
  );

  const imagePreview = useMemo(() => {
    if (!imageFile) return "";
    return URL.createObjectURL(imageFile);
  }, [imageFile]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  if (done) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/20 text-success">
          <Check className="h-10 w-10" />
        </div>
        <h1 className="mt-5 text-xl font-bold">E&apos;lon yuborildi!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          E&apos;loningiz yaratildi. Tekshiruvdan keyin ro&apos;yxatda
          ko&apos;rinadi.
        </p>
        <button
          type="button"
          onClick={() => {
            setDescription("");
            setImageFile(null);
            setDone(false);
          }}
          className="mt-6 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          Yangi e&apos;lon
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6">
      <h1 className="text-2xl font-bold">Yangi e&apos;lon</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Kategoriya, rasm va tavsifni kiriting
      </p>

      <form
        onSubmit={async (event) => {
          event.preventDefault();
          setError("");

          if (!tokenStore.getAccessToken()) {
            router.replace(withLocale(locale, "/login"));
            return;
          }

          if (!selectedCategory) {
            setError("Kategoriya tanlang");
            return;
          }

          if (!imageFile) {
            setError("Rasm yuklang");
            return;
          }

          if (!description.trim()) {
            setError("Tavsif yozing");
            return;
          }

          try {
            setIsSubmitting(true);
            const imageUrl = await uploadListingImage(imageFile);

            await createListing({
              game: selectedCategory.name,
              description: description.trim(),
              imageUrl,
            });

            setDone(true);
          } catch (err) {
            setError(
              err instanceof Error
                ? err.message
                : "E'lon joylashda xatolik yuz berdi"
            );
          } finally {
            setIsSubmitting(false);
          }
        }}
        className="mt-6 space-y-4 pb-8"
      >
        <div>
          {imagePreview ? (
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-card">
              <img
                src={imagePreview}
                alt="Tanlangan rasm"
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => setImageFile(null)}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow"
                aria-label="Rasmni olib tashlash"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-card transition-colors hover:border-primary">
              <ImagePlus className="h-7 w-7 text-muted-foreground" />
              <span className="text-sm font-medium">Rasm yuklash</span>
              <span className="text-xs text-muted-foreground">
                PNG, JPG - max 10MB
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setImageFile(file);
                }}
              />
            </label>
          )}
        </div>

        <Field label="O'yin kategoriyasi">
          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.emoji} {category.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Tavsif">
          <textarea
            required
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={500}
            rows={6}
            placeholder="Akkaunt haqida batafsil ma'lumot..."
            className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
          />
        </Field>

        {error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary py-4 text-sm font-bold text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-70"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          E&apos;lonni joylashtirish
        </button>

        <Link
          href={withLocale(locale, "/home")}
          className="block text-center text-xs text-muted-foreground"
        >
          Bosh sahifaga qaytish
        </Link>
      </form>
    </div>
  );
}

export default AddPage;
