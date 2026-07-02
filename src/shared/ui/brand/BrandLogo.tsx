"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  logoClassName?: string;
  textClassName?: string;
  showText?: boolean;
  suffix?: string;
};

export function BrandLogo({
  className,
  logoClassName,
  textClassName,
  showText = true,
  suffix,
}: BrandLogoProps) {
  return (
    <div className={cn("flex min-w-0 items-center gap-1.5", className)}>
      <span
        className={cn(
          "relative flex h-10 w-[54px] shrink-0 items-center justify-center",
          logoClassName
        )}
      >
        <Image
          src="/assets/serwinglogo.png"
          alt="Serwing"
          width={96}
          height={70}
          priority
          className="h-full w-full object-contain object-center"
        />
      </span>
      {showText && (
        <span className="flex min-w-0 items-center">
          <span
            className={cn(
              "serwing-wordmark block truncate text-[20px] leading-none",
              textClassName
            )}
          >
            SERWING
          </span>
          {suffix && (
            <span
              className="mt-0.5 block truncate text-xs font-semibold text-muted-foreground"
            >
              {suffix}
            </span>
          )}
        </span>
      )}
    </div>
  );
}
