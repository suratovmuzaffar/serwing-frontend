"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { cookie } from "@/lib/cookie";
import { clearMe } from "../slice";

export function useLogout() {
  const dispatch = useDispatch();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => true, // yoki logoutApi
    onMutate: async () => {
      // ✅ UI darrov yangilansin (1 frame ham eski user ko'rinmasin)
      dispatch(clearMe());

      // ✅ auth cache'ni darrov o'chiramiz
      await qc.cancelQueries({ queryKey: ["auth-me"] });
      qc.removeQueries({ queryKey: ["auth-me"] });
    },
    onSettled: () => {
      // ✅ cookie tozalash
      cookie.clear("accessToken");
      cookie.clear("refreshToken");

      // ✅ yana bir marta (sug'urta)
      dispatch(clearMe());
      qc.removeQueries({ queryKey: ["auth-me"] });
    },
  });
}