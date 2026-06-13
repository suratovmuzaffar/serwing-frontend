"use client";

import { useSyncExternalStore } from "react";

const FAVORITES_KEY = "gm-favorites";
const EMPTY_FAVORITES: readonly string[] = Object.freeze([]);

let cachedRaw: string | null = null;
let cachedFavorites: readonly string[] = EMPTY_FAVORITES;

function readFavorites(): readonly string[] {
  if (typeof window === "undefined") return EMPTY_FAVORITES;

  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    if (raw === cachedRaw) return cachedFavorites;

    cachedRaw = raw;
    cachedFavorites = raw ? (JSON.parse(raw) as string[]) : EMPTY_FAVORITES;
    return cachedFavorites;
  } catch {
    cachedRaw = null;
    cachedFavorites = EMPTY_FAVORITES;
    return cachedFavorites;
  }
}

function writeFavorites(ids: string[]) {
  const raw = JSON.stringify(ids);
  cachedRaw = raw;
  cachedFavorites = ids;
  window.localStorage.setItem(FAVORITES_KEY, raw);
  window.dispatchEvent(new Event("serwing:favorites"));
}

function getServerSnapshot(): readonly string[] {
  return EMPTY_FAVORITES;
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("serwing:favorites", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("serwing:favorites", callback);
  };
}

export function useFavorites() {
  const ids = useSyncExternalStore<readonly string[]>(
    subscribe,
    readFavorites,
    getServerSnapshot
  );

  return {
    ids,
    has: (id: string) => ids.includes(id),
    toggle: (id: string) => {
      const current = readFavorites();
      const next = current.includes(id)
        ? current.filter((favoriteId) => favoriteId !== id)
        : [...current, id];

      writeFavorites(next);
    },
  };
}
