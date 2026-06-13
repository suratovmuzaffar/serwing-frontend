// src/config/env.ts

export const ENV = {
  NODE_ENV: process.env.NODE_ENV,
  API_BASE_URL:
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000",
} as const;
