import Image from "next/image";
import React from "react";
import { ShoppingBag } from "lucide-react";
import { useTranslations } from "@/shared/i18n/client";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("auth.loginLayout");

  return (
    <div className="min-h-dvh bg-[#f6f3ef]">
      <div className="mx-auto flex min-h-dvh w-full flex-col bg-white lg:flex-row">
        {/* LEFT (Brand / Image Section) */}
        <div className="relative w-full overflow-hidden bg-[#111111] lg:w-[55%]">
          <div className="relative h-[280px] sm:h-[360px] lg:h-full">
            <Image
              src="/AuthImg.png"
              alt={t("imageAlt")}
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover opacity-70"
              priority
            />

            {/* soft dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/40" />

            <div className="relative flex h-full flex-col justify-end px-6 pb-10 sm:px-10 lg:justify-center lg:px-16">
              <div className="inline-flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
                  <ShoppingBag className="text-white" size={22} />
                </div>

                <h1 className="text-[34px] font-semibold leading-tight text-white sm:text-[42px] lg:text-[48px]">
                  {t("brand")}
                </h1>
              </div>

              <p className="mt-4 max-w-[520px] text-[15px] leading-6 text-white/80 sm:text-[18px] sm:leading-7">
                {t("leftText.line1")}
                <br className="hidden sm:block" />
                {t("leftText.line2")}
              </p>

              <div className="mt-6 hidden w-fit rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur lg:inline-flex">
                {t("leftBadge")}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT (Login Form Section) */}
        <div className="relative flex w-full flex-1 items-center justify-center bg-white">
          <div className="w-full px-6 py-12 sm:px-12 lg:px-16">
            <div className="mx-auto w-full max-w-[460px]">
              {/* Header */}
              <div className="mb-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#111111] text-white shadow-lg">
                  <ShoppingBag size={22} />
                </div>

                <h2 className="mt-6 text-[28px] font-semibold text-[#1f1f1f] sm:text-[32px]">
                  {t("rightTitle")}
                </h2>

                <p className="mt-2 text-[15px] text-black/60">{t("rightSubtitle")}</p>
              </div>

              {/* Form Card */}
              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.06)] sm:p-8">
                {children}
              </div>

              {/* Footer text */}
              <p className="mt-6 text-center text-xs text-black/40">
                {t("copyright").replace("{year}", String(new Date().getFullYear()))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}