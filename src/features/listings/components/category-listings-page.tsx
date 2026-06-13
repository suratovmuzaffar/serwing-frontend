"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { ChevronLeft, SlidersHorizontal } from "lucide-react";

import { ListingCard } from "@/features/listings/components/listing-card";
import { ListingFilter } from "@/features/listings/components/listing-filter";
import {
  sortListings,
  type ListingFilter as ListingFilterValue,
} from "@/features/home/services/listing-filters";
import { getByCategory, type Category } from "@/lib/data";

function getLocale(pathname: string) {
  const locale = pathname.split("/").filter(Boolean)[0];
  return locale || "uz";
}

export function CategoryListingsPage({
  id,
  category,
}: {
  id: string;
  category: Category;
}) {
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const [filter, setFilter] = useState<ListingFilterValue>("top");
  const items = useMemo(
    () => sortListings(getByCategory(id), filter),
    [id, filter]
  );

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
      <div className="flex items-center justify-between">
        <Link
          href={`/${locale}/donations`}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card"
          aria-label="Ortga"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-primary bg-primary text-primary-foreground"
          aria-label="Filtr"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4">
        <div className="text-3xl">{category.emoji}</div>
        <h1 className="mt-2 text-2xl font-bold">{category.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{items.length} ta e'lon</p>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">Filtr</h2>
          <p className="text-xs text-muted-foreground">{selectedFilterLabel}</p>
        </div>
      </div>
      <div className="mt-3">
        <ListingFilter value={filter} onChange={setFilter} />
      </div>

      {items.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">Hozircha e'lonlar yo'q</p>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3">
          {items.map((item, index) => (
            <ListingCard key={item.id} item={item} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoryListingsPage;
