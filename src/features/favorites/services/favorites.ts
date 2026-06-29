"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { http } from "@/services/http";
import { tokenStore } from "@/lib/tokenStore";
import type { Listing } from "@/lib/data";
import {
  mapBackendAnnouncement,
  type BackendAnnouncement,
} from "@/features/home/services/announcements-api";

type WishlistItem = {
  id: number;
  userId: number;
  listingId: number;
  createdAt: string;
  listing: BackendAnnouncement;
};

type WishlistResponse = {
  items: WishlistItem[];
};

type WishlistAddResponse = {
  item: WishlistItem;
  created: boolean;
};

function subscribeToToken(callback: () => void) {
  const interval = window.setInterval(callback, 500);
  return () => window.clearInterval(interval);
}

function getTokenSnapshot() {
  return tokenStore.getAccessToken() ?? "";
}

function getServerTokenSnapshot() {
  return "";
}

export function useAccessTokenSnapshot() {
  return useSyncExternalStore(
    subscribeToToken,
    getTokenSnapshot,
    getServerTokenSnapshot
  );
}

async function fetchWishlist() {
  const { data } = await http.get<WishlistResponse>("/wishlists");
  return data.items.map((item) => mapBackendAnnouncement(item.listing));
}

async function addToWishlist(id: string) {
  const { data } = await http.post<WishlistAddResponse>(`/wishlists/${id}`);
  return mapBackendAnnouncement(data.item.listing);
}

async function removeFromWishlist(id: string) {
  await http.delete(`/wishlists/${id}`);
}

function withoutListing(current: Listing[], id: string) {
  return current.filter((listing) => listing.id !== id);
}

function withListing(current: Listing[], item: Listing) {
  return current.some((listing) => listing.id === item.id)
    ? current
    : [item, ...current];
}

export function useFavorites() {
  const queryClient = useQueryClient();
  const accessToken = useAccessTokenSnapshot();
  const isAuthenticated = Boolean(accessToken);

  const query = useQuery({
    queryKey: ["wishlist"],
    queryFn: fetchWishlist,
    enabled: isAuthenticated,
    staleTime: 30_000,
  });

  const items = query.data ?? [];
  const ids = useMemo(() => items.map((item) => item.id), [items]);
  const idSet = useMemo(() => new Set(ids), [ids]);

  const addMutation = useMutation({
    mutationFn: ({ id }: { id: string; item: Listing }) => addToWishlist(id),
    onMutate: async ({ item }) => {
      await queryClient.cancelQueries({ queryKey: ["wishlist"] });
      const previous = queryClient.getQueryData<Listing[]>(["wishlist"]) ?? [];
      queryClient.setQueryData<Listing[]>(["wishlist"], withListing(previous, item));
      return { previous };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(["wishlist"], context?.previous ?? []);
    },
    onSuccess: (serverItem) => {
      queryClient.setQueryData<Listing[]>(["wishlist"], (current = []) =>
        withListing(withoutListing(current, serverItem.id), serverItem)
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] }),
  });

  const removeMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => removeFromWishlist(id),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ["wishlist"] });
      const previous = queryClient.getQueryData<Listing[]>(["wishlist"]) ?? [];
      queryClient.setQueryData<Listing[]>(["wishlist"], withoutListing(previous, id));
      return { previous };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(["wishlist"], context?.previous ?? []);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] }),
  });

  return {
    ids,
    items,
    isAuthenticated,
    isLoading: query.isLoading,
    isPending: addMutation.isPending || removeMutation.isPending,
    has: (id: string) => idSet.has(id),
    add: (item: Listing) => {
      if (!isAuthenticated) return false;
      addMutation.mutate({ id: item.id, item });
      return true;
    },
    remove: (id: string) => {
      if (!isAuthenticated) return false;
      removeMutation.mutate({ id });
      return true;
    },
    toggle: (id: string, item?: Listing) => {
      if (!isAuthenticated) return false;

      if (idSet.has(id)) {
        removeMutation.mutate({ id });
        return true;
      }

      if (!item) return false;

      addMutation.mutate({ id, item });
      return true;
    },
  };
}
