"use client";

import {
  listingFilterOptions,
  type ListingFilter as ListingFilterValue,
} from "@/features/home/services/listing-filters";
import { cn } from "@/lib/utils";

export function ListingFilter({
  value,
  onChange,
}: {
  value: ListingFilterValue;
  onChange: (value: ListingFilterValue) => void;
}) {
  return (
    <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      {listingFilterOptions.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-colors",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary hover:bg-accent hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
