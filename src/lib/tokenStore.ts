// src/services/tokenStore.ts
import {cookie } from "./cookie";

export const tokenStore = {
  getAccessToken(): string | null {
    try {
      return cookie.get("accessToken");
    } catch {
      return null;
    }
  },
  getRefreshToken(): string | null {
    try {
      return cookie.get("refreshToken");
    } catch {
      return null;
    }
  },
  setTokens(accessToken: string, refreshToken?: string) {
    try {
      cookie.set("accessToken", accessToken);
      if (refreshToken) cookie.set("refreshToken", refreshToken);
    } catch {}
  },
  clear() {
    try {
      cookie.clear("accessToken");
      cookie.clear("refreshToken");
    } catch {}
  },
};
