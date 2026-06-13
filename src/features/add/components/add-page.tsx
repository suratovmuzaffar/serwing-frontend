"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, Coins, Upload } from "lucide-react";

import { categories } from "@/lib/data";

const LISTING_POINT_COST = 1;

function getLocale(pathname: string) {
  const locale = pathname.split("/").filter(Boolean)[0];
  return locale || "uz";
}

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
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [game, setGame] = useState(categories[0]?.id ?? "coc");
  const [points, setPoints] = useState(5);

  if (done) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/20 text-success">
          <Check className="h-10 w-10" />
        </div>
        <h1 className="mt-5 text-xl font-bold">E&apos;lon yuborildi!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {LISTING_POINT_COST} ball yechildi. Admin moderatsiyasidan
          o&apos;tgach, e&apos;loningiz ko&apos;rinadi.
        </p>
        <button
          type="button"
          onClick={() => setDone(false)}
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
        Akkauntingiz haqida ma&apos;lumotlarni to&apos;ldiring
      </p>

      <div className="mt-5 rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Coins className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">
              E&apos;lon narxi: {LISTING_POINT_COST} ball
            </p>
            <p className="text-xs text-muted-foreground">
              Sizda {points} ball bor. Ballni profil orqali referral bilan
              to&apos;plash mumkin.
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setError("");

          if (points < LISTING_POINT_COST) {
            setError(
              "E'lon joylash uchun ball yetarli emas. Profil bo'limida referral orqali ball to'plang."
            );
            return;
          }

          setPoints((current) => current - LISTING_POINT_COST);
          setDone(true);
        }}
        className="mt-6 space-y-4 pb-8"
      >
        <label className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-card transition-colors hover:border-primary">
          <Upload className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm font-medium">Rasm yuklash</span>
          <span className="text-xs text-muted-foreground">
            PNG, JPG - max 5MB
          </span>
          <input type="file" accept="image/*" className="hidden" />
        </label>

        <Field label="O'yin kategoriyasi">
          <select
            value={game}
            onChange={(event) => setGame(event.target.value)}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.emoji} {category.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Sarlavha">
          <input
            required
            maxLength={80}
            placeholder="TH14 Max | 6500 kuboklar"
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
          />
        </Field>

        <Field label="Tavsif">
          <textarea
            required
            maxLength={500}
            rows={4}
            placeholder="Akkaunt haqida batafsil ma'lumot..."
            className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Narx ($)">
            <input
              required
              type="number"
              min={1}
              placeholder="250"
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
            />
          </Field>
          <Field label="Level">
            <input
              required
              type="number"
              min={1}
              placeholder="220"
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
            />
          </Field>
        </div>

        <Field label="Rank">
          <input
            placeholder="Titan I"
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
          />
        </Field>

        {error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          className="mt-2 w-full rounded-xl bg-gradient-primary py-4 text-sm font-bold text-primary-foreground transition-transform active:scale-[0.98]"
        >
          E&apos;lonni joylashtirish
        </button>

        <Link
          href={`/${locale}/home`}
          className="block text-center text-xs text-muted-foreground"
        >
          Bosh sahifaga qaytish
        </Link>
      </form>
    </div>
  );
}

export default AddPage;
