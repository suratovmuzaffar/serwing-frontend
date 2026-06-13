// src/services/localStore.ts
// Simple localStorage wrapper with JSON handling and safety checks
export const localStore = {
  set(key: string, value: string) {
    try {
      if (typeof window === "undefined") return;
      localStorage.setItem(key, value);
    } catch {}
  },
  get(key: string): string | null {
    try {
      if (typeof window === "undefined") return null;
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  remove(key: string) {
    try {
      if (typeof window === "undefined") return;
      localStorage.removeItem(key);
    } catch {}
  },
  clear() {
    try {
      if (typeof window === "undefined") return;
      localStorage.clear();
    } catch {}
  },
  has(key: string) {
    try {
      if (typeof window === "undefined") return false;
      return localStorage.getItem(key) !== null;
    } catch {
      return false;
    }
  },
  setObj(key: string, value: unknown) {
    try {
      if (typeof window === "undefined") return;
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  },
  getObj<T = unknown>(key: string): T | null {
    try {
      if (typeof window === "undefined") return null;
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

};

export const { set, get, remove, clear, has, setObj, getObj } = localStore;
