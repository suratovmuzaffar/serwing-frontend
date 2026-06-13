"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  BadgeCheck,
  ChevronLeft,
  Heart,
  MessageCircle,
  Share2,
  Shield,
  Star,
} from "lucide-react";

import type { Listing } from "@/lib/data";
import { useFavorites } from "@/features/favorites/services/favorites";
import { cn } from "@/lib/utils";

function getLocale(pathname: string) {
  const locale = pathname.split("/").filter(Boolean)[0];
  return locale || "uz";
}

export function ListingDetailPage({ item }: { item: Listing }) {
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const { ids, toggle } = useFavorites();
  const fav = ids.includes(item.id);

  return (
    <div className="pb-32">
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="(max-width: 390px) 100vw, 390px"
          className="h-full w-full object-cover"
          priority
        />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <Link
            href={`/${locale}/home`}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/90 text-foreground"
            aria-label="Ortga"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => toggle(item.id)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/90 text-foreground"
              aria-label="Saqlash"
            >
              <Heart
                className={cn(
                  "h-5 w-5",
                  fav ? "fill-primary text-primary" : "text-foreground"
                )}
              />
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/90 text-foreground"
              aria-label="Ulashish"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>
        {item.premium && (
          <div className="absolute bottom-4 left-4 flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
            <BadgeCheck className="h-3.5 w-3.5" /> PREMIUM
          </div>
        )}
      </div>

      <div className="relative -mt-6 px-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            {item.game}
          </p>
          <h1 className="mt-2 text-xl font-bold">{item.title}</h1>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold">${item.price}</span>
            <div className="flex items-center gap-1 text-xs text-success">
              <Shield className="h-3.5 w-3.5" /> Xavfsiz to'lov
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: "Level", value: item.level },
            { label: "Rank", value: item.rank },
            { label: "Skins", value: item.skins.length },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card p-3 text-center"
            >
              <p className="text-[10px] uppercase text-muted-foreground">{stat.label}</p>
              <p className="mt-1 truncate text-sm font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        <section className="mt-5">
          <h2 className="text-sm font-semibold">Tavsif</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {item.description}
          </p>
        </section>

        {item.skins.length > 0 && (
          <section className="mt-5">
            <h2 className="text-sm font-semibold">Skinlar</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {item.skins.map((skin) => (
                <span
                  key={skin}
                  className="rounded-full bg-secondary px-3 py-1 text-xs"
                >
                  {skin}
                </span>
              ))}
            </div>
          </section>
        )}

        <section className="mt-5">
          <h2 className="text-sm font-semibold">Bog'langan akkauntlar</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {item.linked.map((linkedAccount) => (
              <span
                key={linkedAccount}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs"
              >
                {linkedAccount}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-5 flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary font-bold text-primary-foreground">
            {item.seller.name[0]}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">{item.seller.name}</p>
            <p className="text-xs text-muted-foreground">@{item.seller.username}</p>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-xs">
            <Star className="h-3 w-3 fill-warning text-warning" />
            {item.seller.rating}
          </div>
        </section>
      </div>

      <div className="fixed bottom-18 left-1/2 z-40 mx-auto w-full max-w-md -translate-x-1/2 border-t border-border bg-card/95 p-3 backdrop-blur-xl">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/10 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
        >
          <MessageCircle className="h-4 w-4" /> Yozish
        </button>
      </div>
    </div>
  );
}

export default ListingDetailPage;
