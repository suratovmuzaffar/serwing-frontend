"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function usePageParam(totalPages: number, paramName = "page") {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pageFromUrl = React.useMemo(() => {
    const raw = searchParams.get(paramName);
    const n = raw ? Number(raw) : 1;
    return Number.isFinite(n) ? n : 1;
  }, [searchParams, paramName]);

  const safeTotal = Math.max(1, totalPages || 1);
  const page = clamp(pageFromUrl, 1, safeTotal);

  const setPage = React.useCallback(
    (next: number) => {
      const nextPage = clamp(next, 1, safeTotal);
      const sp = new URLSearchParams(searchParams.toString());

      if (nextPage === 1) sp.delete(paramName);
      else sp.set(paramName, String(nextPage));

      const qs = sp.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams, safeTotal, paramName]
  );

  return { page, setPage };
}