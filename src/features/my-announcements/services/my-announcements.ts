import { http } from "@/services/http";

export type MyAnnouncement = {
  id: number;
  title: string;
  description: string;
  price: number;
  game: string;
  imageUrl?: string | null;
  platform?: string | null;
  region?: string | null;
  rank?: string | null;
  status: string;
  createdAt?: string;
};

export type AnnouncementUpdatePayload = {
  title?: string;
  description?: string;
  price?: number;
  game?: string;
  imageUrl?: string | null;
  platform?: string | null;
  region?: string | null;
  rank?: string | null;
};

export async function fetchMyAnnouncements() {
  const { data } = await http.get<{ announcements: MyAnnouncement[] }>("/announcements/me");
  return data.announcements;
}

export async function updateMyAnnouncement(id: number, payload: AnnouncementUpdatePayload) {
  const { data } = await http.put<{ announcement: MyAnnouncement }>(
    `/announcements/${id}`,
    payload
  );
  return data.announcement;
}

export async function deleteMyAnnouncement(id: number) {
  await http.delete(`/announcements/${id}`);
}
