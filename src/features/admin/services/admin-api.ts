import { http } from "@/services/http";

export type AdminOverview = {
  usersCount: number;
  announcementsCount: number;
  wishlistCount: number;
};

export type AdminAnnouncement = {
  id: number;
  title: string;
  description: string;
  price: number;
  game: string;
  status: string;
  sellerId: number;
  createdAt: string;
  seller?: {
    id: number;
    email: string | null;
    telegramUsername: string | null;
    telegramName: string | null;
    role: string;
  };
};

export async function fetchAdminOverview() {
  const { data } = await http.get<{ stats: AdminOverview }>("/admin/overview");
  return data.stats;
}

export async function fetchAdminAnnouncements() {
  const { data } = await http.get<{ announcements: AdminAnnouncement[] }>(
    "/admin/announcements",
    { params: { limit: 20 } }
  );
  return data.announcements;
}
