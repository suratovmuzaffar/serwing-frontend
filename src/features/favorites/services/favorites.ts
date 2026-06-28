"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { http } from "@/services/http";
import { tokenStore } from "@/lib/tokenStore";
import type { Listing } from "@/lib/data";
import {
  mapBackendListing,
  type BackendListing,
} from "@/features/home/services/listings-api";

type WishlistItem = {
  id: number;
  userId: number;
  listingId: number;
  createdAt: string;
  listing: BackendListing;
};

async function fetchWishlist() {
  const { data } = await http.get<{ items: WishlistItem[] }>("/wishlists");
  return data.items.map((item) => mapBackendListing(item.listing));
}

async function addToWishlist(id: string) {
  await http.post(`/wishlists/${id}`);
}

async function removeFromWishlist(id: string) {
  await http.delete(`/wishlists/${id}`);
}

export function useFavorites() {
  const queryClient = useQueryClient();
  const hasToken = Boolean(tokenStore.getAccessToken());

  const query = useQuery({
    queryKey: ["wishlist"],
    queryFn: fetchWishlist,
    enabled: hasToken,
    staleTime: 30_000,
  });

  const items = query.data ?? [];
  const ids = useMemo(() => items.map((item) => item.id), [items]);
  const idSet = useMemo(() => new Set(ids), [ids]);

  const updateCache = (updater: (current: Listing[]) => Listing[]) => {
    queryClient.setQueryData<Listing[]>(["wishlist"], (current = []) =>
      updater(current)
    );
  };

  const addMutation = useMutation({
    mutationFn: addToWishlist,
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] }),
  });

  const removeMutation = useMutation({
    mutationFn: removeFromWishlist,
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] }),
  });

  return {
    ids,
    items,
    isLoading: query.isLoading,
    has: (id: string) => idSet.has(id),
    toggle: (id: string, item?: Listing) => {
      if (!hasToken) return;

      if (idSet.has(id)) {
        updateCache((current) => current.filter((listing) => listing.id !== id));
        removeMutation.mutate(id);
        return;
      }

      if (item) {
        updateCache((current) =>
          current.some((listing) => listing.id === id)
            ? current
            : [item, ...current]
        );
      }

      addMutation.mutate(id);
    },
  };
}
