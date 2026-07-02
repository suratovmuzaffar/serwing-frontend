// src/features/auth/api.ts

import { http } from "@/services/http";
import type {
  AuthResponse,
  AuthUser,
  LoginPayload,
  MeResponse,
} from "@/features/auth/types";



export async function loginApi(payload: LoginPayload) {
  const { data } = await http.post("/auth/login", payload);
  return data;
}

export async function telegramLoginApi(initData: string): Promise<AuthResponse> {
  const { data } = await http.post<AuthResponse>("/auth/telegram", { initData });
  return data;
}

export async function telegramLinkLoginApi(token: string): Promise<AuthResponse> {
  const { data } = await http.post<AuthResponse>("/auth/telegram/link", { token });
  return data;
}

export async function fetchMe(): Promise<AuthUser> {
  const { data } = await http.get<MeResponse>("/users/me");
  return "user" in data ? data.user : data;
}

export async function updateMeApi(payload: {
  profileFirstName?: string;
  profileLastName?: string;
  profileName?: string;
  profilePhotoUrl?: string;
  profileBio?: string;
  language?: string;
}): Promise<AuthUser> {
  const { data } = await http.patch<MeResponse>("/users/me", payload);
  return "user" in data ? data.user : data;
}

type UploadImageResponse = {
  data: {
    fileUrl: string;
  };
};

export async function uploadProfileImageApi(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await http.post<UploadImageResponse>("/uploads/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data.data.fileUrl;
}

export async function logoutApi(): Promise<AuthUser> {
  const { data } = await http.get<MeResponse>("/users/me");
  return "user" in data ? data.user : data;
}
