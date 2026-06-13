"use client";

import React from "react";
import { useTranslations } from "@/shared/i18n/client";

type ButtonVariant = "primary" | "secondary" | "ghost" | "blue";
type ButtonSize = "sm" | "md" | "lg";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;

  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;

  spinLeftIcon?: boolean;
  spinRightIcon?: boolean;
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-10 px-5 text-sm",
  lg: "h-11 px-6 text-[15px]",
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[#111111] text-white " +
    "shadow-[0_10px_26px_rgba(0,0,0,0.14)] " +
    "hover:bg-[#1a1a1a] active:bg-[#0d0d0d]",

  secondary:
    "bg-white text-[#111111] border border-black/10 " +
    "shadow-[0_8px_20px_rgba(0,0,0,0.06)] " +
    "hover:bg-black/[0.02] active:bg-black/[0.04]",

  ghost:
    "bg-transparent text-[#111111] border border-transparent " +
    "hover:bg-black/[0.04] active:bg-black/[0.06]",

  blue:
    "bg-[#003C84] text-white shadow-sm " +
    "hover:bg-[#0a4fc2] active:scale-[0.98]",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = true,
  loading = false,

  leftIcon,
  rightIcon,
  spinLeftIcon = false,
  spinRightIcon = false,

  className = "",
  disabled,
  children,
  ...props
}: Props) {
  const t = useTranslations("Common");
  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      type={props.type ?? "button"}
      disabled={isDisabled}
      className={[
        "inline-flex flex-row items-center justify-center gap-2",
        "whitespace-nowrap",
        "select-none rounded-lg font-medium transition",
        "active:scale-[0.99]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        fullWidth ? "w-full" : "w-auto",
        sizeClasses[size],
        variantClasses[variant],
        isDisabled ? "cursor-not-allowed opacity-60 shadow-none" : "",
        className,
      ].join(" ")}
    >
      {leftIcon ? (
        <span
          className={[
            "inline-flex shrink-0",
            spinLeftIcon ? "animate-spin" : "",
          ].join(" ")}
        >
          {leftIcon}
        </span>
      ) : null}

      <span className="leading-none">
        {loading ? t("loading") : children}
      </span>

      {rightIcon ? (
        <span
          className={[
            "inline-flex shrink-0",
            spinRightIcon ? "animate-spin" : "",
          ].join(" ")}
        >
          {rightIcon}
        </span>
      ) : null}
    </button>
  );
}