"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BadgeCheck, Heart } from "lucide-react";

import { useFavorites } from "@/features/favorites/services/favorites";
import type { Listing } from "@/lib/data";
import { cn } from "@/lib/utils";
import { getLocaleFromPath, withLocale } from "@/shared/i18n/path";

export function ListingCard({ item, index = 0 }: { item: Listing; index?: number }) {
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);
  const { has, toggle } = useFavorites();
  const fav = has(item.id);

  return (
    <Link
      href={withLocale(locale, `/donations/${item.id}`)}
      className="group relative block animate-float-up overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/40"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-3 text-center text-xs text-muted-foreground">
            Rasm yo&apos;q
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-card to-transparent" />
        {item.premium && (
          <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-primary/90 px-2 py-0.5 text-[10px] font-bold text-primary-foreground backdrop-blur-sm">
            <BadgeCheck className="h-3 w-3" /> PREMIUM
          </div>
        )}
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            toggle(item.id);
          }}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/90 text-foreground transition-colors hover:bg-white"
          aria-label="Saqlash"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-all",
              fav ? "scale-110 fill-primary text-primary" : "text-foreground"
            )}
          />
        </button>
      </div>
      <div className="p-3 pt-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-primary/80">
          {item.game}
        </p>
        <h3 className="mt-1 line-clamp-1 text-sm font-semibold text-foreground">
          {item.title}
        </h3>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-base font-bold text-foreground">${item.price}</span>
          <span className="text-[10px] text-muted-foreground">Lvl {item.level}</span>
        </div>
      </div>
    </Link>
  );
}
