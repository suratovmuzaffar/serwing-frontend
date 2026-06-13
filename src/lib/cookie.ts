// src/services/cookie.ts
type CookieOptions = {
  maxAge?: number; // seconds
  expires?: Date;
  path?: string;
  sameSite?: "Lax" | "Strict" | "None";
  secure?: boolean;
};

export const cookie = {
  set(name: string, value: string, opts: CookieOptions = {}) {
    if (typeof document === "undefined") return;

    const parts: string[] = [];
    parts.push(`${name}=${encodeURIComponent(value)}`);

    // defaults
    parts.push(`path=${opts.path ?? "/"}`);

    if (typeof opts.maxAge === "number") parts.push(`max-age=${opts.maxAge}`);
    if (opts.expires instanceof Date) parts.push(`expires=${opts.expires.toUTCString()}`);

    // SameSite (default Lax)
    parts.push(`samesite=${opts.sameSite ?? "Lax"}`);

    // Secure (faqat https bo‘lsa)
    if (opts.secure) parts.push("secure");

    document.cookie = parts.join("; ");
  },

  get(name: string): string | null {
    if (typeof document === "undefined") return null;

    const cookies = document.cookie.split("; ");
    for (const c of cookies) {
      const [key, ...rest] = c.split("=");
      if (key === name) return decodeURIComponent(rest.join("=") ?? "");
    }
    return null;
  },

  clear(name: string, path: string = "/") {
    if (typeof document === "undefined") return;
    document.cookie = `${name}=; path=${path}; max-age=0; samesite=Lax`;
  },
};