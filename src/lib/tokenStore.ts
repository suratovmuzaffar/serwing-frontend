// src/services/tokenStore.ts
import { cookie } from "./cookie";

export const AUTH_TOKEN_CHANGE_EVENT = "serwing:auth-token-change";

function emitTokenChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_TOKEN_CHANGE_EVENT));
}

export function subscribeToTokenChanges(listener: () => void) {
  if (typeof window === "undefined") return () => {};

  window.addEventListener(AUTH_TOKEN_CHANGE_EVENT, listener);
  return () => window.removeEventListener(AUTH_TOKEN_CHANGE_EVENT, listener);
}

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
    } catch {
    } finally {
      emitTokenChange();
    }
  },
  clear() {
    try {
      cookie.clear("accessToken");
      cookie.clear("refreshToken");
    } catch {
    } finally {
      emitTokenChange();
    }
  },
};
