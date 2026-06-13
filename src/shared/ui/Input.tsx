"use client";

import React, { useState } from "react";

import { cn } from "@/lib/utils";

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> & {
  label?: string;
  initialValue?: string;
  setValue?: (value: string) => void;
  error?: string;
  leftIcon?: React.ReactNode;
  rightSlot?: React.ReactNode;
  inputClassName?: string;
};

export function Input({
  label,
  initialValue = "",
  setValue,
  error,
  leftIcon,
  rightSlot,
  inputClassName,
  className,
  id,
  ...props
}: InputProps) {
  const [internalValue, setInternalValue] = useState(initialValue);
  const inputId = id ?? props.name ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      ) : null}
      <div
        className={cn(
          "flex min-h-11 items-center gap-2 rounded-xl border border-transparent px-3 transition-colors focus-within:border-primary",
          inputClassName ?? "bg-card"
        )}
      >
        {leftIcon ? <span className="shrink-0 text-gray-500">{leftIcon}</span> : null}
        <input
          {...props}
          id={inputId}
          value={internalValue}
          onChange={(event) => {
            setInternalValue(event.target.value);
            setValue?.(event.target.value);
          }}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
        />
        {rightSlot}
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
