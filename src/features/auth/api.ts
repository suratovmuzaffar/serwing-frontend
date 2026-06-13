// src/features/auth/api.ts

import { http } from "@/services/http";
import { AdminMe, LoginPayload, MeResponse } from "@/features/auth/types";



export async function loginApi(payload: LoginPayload) {
  const { data } = await http.post("/admin/auth/login/", payload);
  return data;
}


export async function fetchMe(): Promise<AdminMe> {
  const { data } = await http.get<MeResponse>("/admin/auth/me/");
  return "admin" in data ? data.admin : data;
}
export async function logoutApi(): Promise<AdminMe> {
  const { data } = await http.get<MeResponse>("/admin/auth/me/");
  return "admin" in data ? data.admin : data;
}