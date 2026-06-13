"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-foreground">Xatolik yuz berdi</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Sahifa yuklanishida muammo bo'ldi. Iltimos, qayta urinib ko'ring.
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

        {process.env.NODE_ENV === "development" && (
          <pre className="mt-6 max-h-[180px] overflow-auto rounded-lg bg-black/[0.04] p-4 text-left text-xs text-black/60">
            {error.message}
          </pre>
        )}
      </div>
    </div>
  );
}
