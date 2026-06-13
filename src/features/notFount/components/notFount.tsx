"use client";

import BackButton from "@/features/notFount/components/BackButton";
import GoHomeButton from "@/features/notFount/components/GoHomeButton";
import { useTranslations } from "@/shared/i18n/client";

export default function NotFound() {
  const t = useTranslations("NotFoundPage");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f9fb] px-4">
      <div className="w-full max-w-[480px] text-center">
        {/* 404 */}
        <h1 className="text-[95px] font-bold leading-none tracking-tight text-[#1f1f1f] sm:text-[120px]">
          404
        </h1>

        {/* title */}
        <p className="mt-4 text-[18px] font-semibold text-[#1f1f1f]">
          {t("title")}
        </p>

        {/* description */}
        <p className="mt-2 text-[13px] leading-6 text-[#6b7280]">
          {t("description")}
        </p>

        {/* buttons */}
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <GoHomeButton />
          <BackButton />
        </div>
      </div>
    </div>
  );
}