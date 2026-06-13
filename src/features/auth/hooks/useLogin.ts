import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import { loginApi } from "@/features/auth/api";
import { cookie } from "@/lib/cookie";

export type LoginPayload = {
  username: string;
  password: string;
};

export type LoginResponse = {
  access?: string;
  refresh?: string;
};

export type ApiErrorBody = {
  detail?: string;
  message?: string;
};

export function useLogin() {
  return useMutation<LoginResponse, AxiosError<ApiErrorBody>, LoginPayload>({
    mutationFn: loginApi,
    onSuccess: (data) => {
      const access = data?.access;
      const refresh = data?.refresh;

      if (access) cookie.set("accessToken", access, { maxAge: 60 * 30 }); // 30 min kun
      if (refresh) cookie.set("refreshToken", refresh, { maxAge: 60 * 60 * 24 * 30 }); // 30 kun
    },
  });
}
