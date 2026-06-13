"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppDispatch } from "@/store/hooks";
import { setMe, clearMe } from "@/features/auth/slice";
import { fetchMe } from "@/features/auth/api";

export function useAuthMe(enabled: boolean = true) {
  const dispatch = useAppDispatch();

  const query = useQuery({
    queryKey: ["auth-me"],
    queryFn: fetchMe,
    enabled,
    staleTime: 30_000,
  });

  // ✅ success bo‘lsa slice’ga yozamiz
  useEffect(() => {
    if (query.data) dispatch(setMe(query.data));
  }, [query.data, dispatch]);

  // ✅ error bo‘lsa slice’ni tozalaymiz
  useEffect(() => {
    if (query.isError) dispatch(clearMe());
  }, [query.isError, dispatch]);

  return query; // { data, isLoading, isError, ... }
}
