"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heart } from "lucide-react";

import { hasTelegramLoginSignal } from "@/features/auth/services/telegram";
import { useFavorites } from "@/features/favorites/services/favorites";
import type { Listing } from "@/lib/data";
import { getLocaleFromPath, withLocale } from "@/shared/i18n/path";

function FavoriteCard({
  item,
  index,
  onToggle,
}: {
  item: Listing;
  index: number;
  onToggle: (item: Listing) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = getLocaleFromPath(pathname);
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <Link
      href={withLocale(locale, `/donations/${item.id}`)}
      className="group relative block animate-float-up overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/40"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        {item.image && !imageFailed ? (
          <img
            src={item.image}
            alt={item.title}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-3 text-center text-xs text-muted-foreground">
            Rasm yo&apos;q
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-card to-transparent" />
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onToggle(item);
          }}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/90 text-foreground transition-colors hover:bg-white"
          aria-label="Saqlash"
        >
          <Heart className="h-4 w-4 scale-110 fill-primary text-primary" />
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

export function FavoritesPage() {
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);
  const router = useRouter();
  const { isAuthenticated, isLoading, items, toggle } = useFavorites();

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border bg-card">
          <Heart className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="mt-4 text-xl font-bold">Saqlanganlar</h1>
        <p className="mt-2 max-w-[260px] text-sm text-muted-foreground">
          Saqlangan e&apos;lonlarni ko&apos;rish uchun Telegram orqali kiring.
        </p>
        <button
          type="button"
          onClick={() =>
            router.push(
              withLocale(locale, hasTelegramLoginSignal() ? "/profile" : "/login")
            )
          }
          className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Kirish
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 pb-20 pt-6">
      <h1 className="text-2xl font-bold">Saqlanganlar</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Sevimli akkauntlaringiz bu yerda
      </p>

      {isLoading ? (
        <div className="mt-20 text-center text-sm text-muted-foreground">
          Yuklanmoqda...
        </div>
      ) : items.length === 0 ? (
        <div className="mt-20 flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border bg-card">
            <Heart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-base font-semibold">Bo&apos;sh</h2>
          <p className="mt-1 max-w-[240px] text-sm text-muted-foreground">
            Yoqqan akkauntlarni saqlash uchun yurak tugmasini bosing
          </p>
          <Link
            href={withLocale(locale, "/home")}
            className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Akkauntlarni ko&apos;rish
          </Link>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3">
          {items.map((item, index) => (
            <FavoriteCard
              key={item.id}
              item={item}
              index={index}
              onToggle={(listing) => toggle(listing.id, listing)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default FavoritesPage;
