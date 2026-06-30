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

export type AdminUser = {
  id: number;
  email: string | null;
  emailVerified: boolean;
  profileFirstName: string | null;
  profileLastName: string | null;
  profileName: string | null;
  profilePhotoUrl: string | null;
  profileBio: string | null;
  telegramId: string | null;
  telegramName: string | null;
  telegramVerified: boolean;
  phone: string | null;
  phoneVerified: boolean;
  role: string;
  status: string;
  createdAt: string;
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

export async function fetchAdminUsers() {
  const { data } = await http.get<{ users: AdminUser[] }>("/users");
  return data.users;
}
