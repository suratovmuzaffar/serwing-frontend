"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { donations, type Category } from "@/lib/data";
import { getLocaleFromPath, withLocale } from "@/shared/i18n/path";

export function DonationDetailsPage({
  id,
  category,
}: {
  id: string;
  category: Category;
}) {
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);
  const items = donations.filter((donation) => donation.gameId === id);

  return (
    <div className="px-4 pt-6">
      <Link
        href={withLocale(locale, "/donations")}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card"
        aria-label="Ortga"
      >
        <ChevronLeft className="h-5 w-5" />
      </Link>

      <div className="mt-5">
        <div className="text-3xl">{category.emoji}</div>
        <h1 className="mt-2 text-2xl font-bold">{category.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Yangilik, donat va elit passlar
        </p>
      </div>

      <div className="mt-6 space-y-2 pb-20">
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">
                    {item.tag}
                  </span>
                  <h2 className="mt-3 text-sm font-bold">{item.title}</h2>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-base font-bold">${item.price}</p>
                  <button
                    type="button"
                    className="mt-2 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                  >
                    Olish
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card p-5 text-center">
            <p className="text-sm font-semibold">Tez orada</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Bu o&apos;yin uchun donat va yangiliklar qo&apos;shiladi.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DonationDetailsPage;
