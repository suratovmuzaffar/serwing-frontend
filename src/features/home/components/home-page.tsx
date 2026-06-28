"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Bell, Search, TrendingUp } from "lucide-react";

import { CardSkeleton } from "@/features/home/components/card-skeleton";
import { ListingCard } from "@/features/home/components/listing-card";
import { ListingFilter } from "@/features/home/components/listing-filter";
import {
  sortListings,
  type ListingFilter as ListingFilterValue,
} from "@/features/home/services/listing-filters";
import { fetchListings } from "@/features/home/services/listings-api";
import { categories, listings } from "@/lib/data";
import type { Listing } from "@/lib/data";
import { cn } from "@/lib/utils";

export function HomePage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ListingFilterValue>("top");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [remoteListings, setRemoteListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadListings() {
      try {
        const items = await fetchListings();
        if (!cancelled) setRemoteListings(items);
      } catch {
        if (!cancelled) setRemoteListings([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadListings();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const allListings = [...remoteListings, ...listings];
    const normalizedQuery = query.trim().toLowerCase();
    const byCategory =
      selectedCategory === "all"
        ? allListings
        : allListings.filter((listing) => listing.gameId === selectedCategory);
    const matched = normalizedQuery
      ? byCategory.filter((listing) =>
          (listing.title + listing.game).toLowerCase().includes(normalizedQuery)
        )
      : byCategory;

    return sortListings(matched, filter);
  }, [query, filter, selectedCategory, remoteListings]);

  const selectedCategoryName =
    selectedCategory === "all"
      ? "Barcha o'yinlar"
      : categories.find((category) => category.id === selectedCategory)?.name;

  const resultTitle = query.trim()
    ? "Qidiruv natijalari"
    : selectedCategory !== "all"
      ? `${selectedCategoryName} e'lonlari`
      : filter === "top"
        ? "Tavsiya etilganlar"
        : "Filtrlangan akkauntlar";

  const selectedFilterLabel =
    filter === "top"
      ? "Top akkauntlar"
      : filter === "cheap"
        ? "Eng arzonlari"
        : filter === "expensive"
          ? "Eng qimmatlari"
          : filter === "level-high"
            ? "Leveli yuqorilar"
            : "Leveli pastlar";

  return (
    <div className="px-4 pt-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Serwing</h1>
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card"
          aria-label="Bildirishnomalar"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
        </button>
      </header>

      <div className="relative mt-5">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Akkaunt qidirish..."
          className="w-full rounded-2xl border border-border bg-card py-3.5 pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
        />
      </div>

      <div className="relative mt-5 overflow-hidden rounded-2xl border border-primary/15 bg-gradient-primary p-5">
        <div className="relative">
          <div className="flex items-center gap-1.5 text-xs font-medium text-primary-foreground/90">
            <TrendingUp className="h-3.5 w-3.5" /> Bu hafta TOP
          </div>
          <h2 className="mt-2 text-lg font-bold text-primary-foreground">
            Clash of Clans akkauntlari
          </h2>
          <p className="mt-1 text-xs text-primary-foreground/80">
            TH13 dan TH16 gacha - eng yaxshi narxlarda
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Kategoriyalar</h2>
        <button
          type="button"
          onClick={() => setSelectedCategory("all")}
          className="text-xs text-primary"
        >
          Barchasi
        </button>
      </div>
      <div className="scrollbar-hide -mx-4 mt-3 flex gap-3 overflow-x-auto px-4 pb-1">
        <button
          type="button"
          onClick={() => setSelectedCategory("all")}
          aria-label="Barcha kategoriyalar"
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-full border bg-card text-lg transition-colors",
            selectedCategory === "all"
              ? "border-primary bg-primary/10"
              : "border-border"
          )}
        >
          ALL
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setSelectedCategory(category.id)}
            aria-label={category.name}
            className={cn(
              "flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-card transition-colors hover:border-primary",
              selectedCategory === category.id
                ? "border-primary bg-primary/10"
                : "border-border"
            )}
          >
            {category.image ? (
              <Image
                src={category.image}
                alt=""
                width={56}
                height={56}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-lg">{category.emoji}</span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">Filtr</h2>
          <p className="text-xs text-muted-foreground">
            {selectedCategoryName} - {selectedFilterLabel}
          </p>
        </div>
        <span className="text-xs text-muted-foreground">
          {filtered.length} ta
        </span>
      </div>
      <div className="mt-3">
        <ListingFilter value={filter} onChange={setFilter} />
      </div>

      <h2 className="mt-6 text-sm font-semibold">{resultTitle}</h2>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <CardSkeleton key={index} />
            ))
          : filtered.map((item, index) => (
              <ListingCard key={item.id} item={item} index={index} />
            ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-12 text-center text-sm text-muted-foreground">
          Hech narsa topilmadi
        </div>
      )}
    </div>
  );
}

export default HomePage;
