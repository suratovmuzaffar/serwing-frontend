import { http } from "@/services/http";
import { getAssetUrl } from "@/lib/assets";
import { categories, type Listing } from "@/lib/data";

export type BackendAnnouncement = {
  id: number;
  title: string;
  description: string;
  price: number;
  game: string;
  imageUrl?: string | null;
  rank?: string | null;
  seller?: {
    profileFirstName?: string | null;
    profileLastName?: string | null;
    profileName?: string | null;
    email?: string | null;
  };
};

function getCategoryByGame(game: string) {
  const normalized = game.trim().toLowerCase();

  return categories.find(
    (category) =>
      category.id.toLowerCase() === normalized ||
      category.name.toLowerCase() === normalized
  );
}

export function mapBackendAnnouncement(item: BackendAnnouncement): Listing {
  const category = getCategoryByGame(item.game);
  const sellerFullName = [
    item.seller?.profileFirstName,
    item.seller?.profileLastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
  const sellerName =
    sellerFullName ||
    item.seller?.profileName ||
    item.seller?.email ||
    "Foydalanuvchi";

  return {
    id: String(item.id),
    title: item.title,
    game: category?.name ?? item.game,
    gameId: category?.id ?? "other",
    price: item.price,
    image: getAssetUrl(item.imageUrl),
    level: 1,
    rank: item.rank || "",
    description: item.description,
    skins: [],
    linked: ["Telegram"],
    seller: {
      name: sellerName,
      username: "",
      rating: 5,
    },
  };
}

export async function fetchAnnouncements() {
  const { data } = await http.get<{ announcements: BackendAnnouncement[] }>(
    "/announcements"
  );
  return data.announcements.map(mapBackendAnnouncement);
}
