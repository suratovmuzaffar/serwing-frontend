"use client";

import React from "react";
import RefreshButton from "@/features/error/components/RefreshButton";
import BackButton from "@/features/error/components/BackButton";
import { ENV } from "@/config/env";
import { useTranslations } from "@/shared/i18n/client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("ErrorPage");

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-[520px] text-center">
        <h1 className="text-[34px] font-semibold tracking-tight text-[#1f1f1f] sm:text-[42px]">
          {t("title")}
        </h1>

        <p className="mx-auto mt-3 max-w-[420px] text-[13px] leading-6 text-[#8b8b8b] sm:text-sm">
          {t("description")}
        </p>

        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <RefreshButton reset={reset} />
          <BackButton />
        </div>

        {ENV.NODE_ENV === "development" && (
          <pre className="mt-6 max-h-[180px] overflow-auto rounded-lg bg-black/[0.04] p-4 text-left text-xs text-black/60">
            {error.message}
          </pre>
        )}
      </div>
    </div>
  );
}