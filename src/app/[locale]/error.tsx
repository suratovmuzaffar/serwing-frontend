"use client";

import { useEffect, useMemo, useState } from "react";

type ClientDiagnostics = {
  href: string;
  userAgent: string;
  platform: string;
  telegramWebApp: boolean;
};

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [diagnostics] = useState<ClientDiagnostics | null>(() => {
    if (typeof window === "undefined") return null;

    return {
      href: window.location.href,
      userAgent: window.navigator.userAgent,
      platform: window.navigator.platform,
      telegramWebApp: Boolean(window.Telegram?.WebApp),
    };
  });

  useEffect(() => {
    console.error(error);
  }, [error]);

  const errorDetails = useMemo(
    () =>
      [
        `name: ${error.name || "Error"}`,
        `message: ${error.message || "No error message"}`,
        error.digest ? `digest: ${error.digest}` : null,
        diagnostics?.href ? `url: ${diagnostics.href}` : null,
        diagnostics?.platform ? `platform: ${diagnostics.platform}` : null,
        diagnostics ? `telegramWebApp: ${diagnostics.telegramWebApp}` : null,
        diagnostics?.userAgent ? `userAgent: ${diagnostics.userAgent}` : null,
        error.stack ? `stack:\n${error.stack}` : null,
      ]
        .filter(Boolean)
        .join("\n\n"),
    [diagnostics, error]
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-foreground">Xatolik yuz berdi</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Sahifa yuklanishida muammo bo&apos;ldi. Iltimos, qayta urinib ko&apos;ring.
        </p>

        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Qayta urinish
          </button>
          <button
            type="button"
            onClick={() => (window.location.href = "/uz/home")}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Bosh sahifa
          </button>
        </div>

        <div className="mt-6 rounded-xl border border-border bg-card p-3 text-left">
          <p className="text-xs font-semibold text-foreground">Xato tafsiloti</p>
          <pre className="mt-2 max-h-[320px] whitespace-pre-wrap break-words overflow-auto rounded-lg bg-black/[0.04] p-3 text-[11px] leading-5 text-foreground/80">
            {errorDetails}
          </pre>
        </div>
      </div>
    </div>
  );
}
