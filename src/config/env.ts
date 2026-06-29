// src/config/env.ts

export const ENV = {
  NODE_ENV: process.env.NODE_ENV,
  API_BASE_URL:
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1",
  TELEGRAM_BOT_USERNAME:
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? "serwing_bot",
  TELEGRAM_WEB_APP_SHORT_NAME:
    process.env.NEXT_PUBLIC_TELEGRAM_WEB_APP_SHORT_NAME ?? "",
} as const;
