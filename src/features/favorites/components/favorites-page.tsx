"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart } from "lucide-react";

import { listings } from "@/lib/data";
import { useFavorites } from "@/features/favorites/services/favorites";

function getLocale(pathname: string) {
  const locale = pathname.split("/").filter(Boolean)[0];
  return locale || "uz";
}

export function FavoritesPage() {
  const pathname = usePathname();
  const locale = getLocale(pathname);
  // ✅ Faqat useFavorites hook ishlatamiz - u getServerSnapshot ni to'g'ri hal qiladi
  const { ids: favoriteIds, toggle } = useFavorites();
  const items = listings.filter((listing) => favoriteIds.includes(listing.id));

  return (
    <div className="px-4 pb-20 pt-6">
      <h1 className="text-2xl font-bold">Saqlanganlar</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Sevimli akkauntlaringiz bu yerda
      </p>

      {items.length === 0 ? (
        <div className="mt-20 flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border bg-card">
            <Heart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-base font-semibold">Bo'sh</h2>
          <p className="mt-1 max-w-[240px] text-sm text-muted-foreground">
            Yoqqan akkauntlarni saqlash uchun yurak tugmasini bosing
          </p>
          <Link
            href={`/${locale}/home`}
            className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Akkauntlarni ko'rish
          </Link>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3">
          {items.map((item, index) => (
            <Link
              key={item.id}
              href={`/${locale}/listing/${item.id}`}
              className="group relative block animate-float-up overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/40"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 390px) 50vw, 180px"
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-card to-transparent" />
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    toggle(item.id);
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
                  <span className="text-base font-bold text-foreground">
                    ${item.price}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Lvl {item.level}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default FavoritesPage;
