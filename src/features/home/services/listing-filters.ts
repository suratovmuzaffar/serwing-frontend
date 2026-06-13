import type { Listing } from "@/lib/data";

export type ListingFilter = "top" | "cheap" | "expensive" | "level-high" | "level-low";

export const listingFilterOptions: { value: ListingFilter; label: string }[] = [
  { value: "top", label: "Top" },
  { value: "cheap", label: "Arzon" },
  { value: "expensive", label: "Qimmat" },
  { value: "level-high", label: "Level yuqori" },
  { value: "level-low", label: "Level past" },
];

const topScore = (listing: Listing) =>
  (listing.premium ? 1000 : 0) + listing.seller.rating * 100 + listing.level;

export function sortListings(items: Listing[], filter: ListingFilter) {
  return [...items].sort((a, b) => {
    switch (filter) {
      case "cheap":
        return a.price - b.price;
      case "expensive":
        return b.price - a.price;
      case "level-high":
        return b.level - a.level;
      case "level-low":
        return a.level - b.level;
      case "top":
      default:
        return topScore(b) - topScore(a);
    }
  });
}
