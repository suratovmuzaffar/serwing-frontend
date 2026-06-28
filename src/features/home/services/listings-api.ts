import { http } from "@/services/http";
import { ENV } from "@/config/env";
import { categories, type Listing } from "@/lib/data";

export type BackendListing = {
  id: number;
  title: string;
  description: string;
  price: number;
  game: string;
  imageUrl?: string | null;
  rank?: string | null;
  seller?: {
    telegramUsername?: string | null;
    telegramName?: string | null;
    email?: string | null;
  };
};

function getAssetUrl(path?: string | null) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;

  try {
    const apiUrl = new URL(ENV.API_BASE_URL);
    return `${apiUrl.origin}${path.startsWith("/") ? path : `/${path}`}`;
  } catch {
    return path;
  }
}

function getCategoryByGame(game: string) {
  const normalized = game.trim().toLowerCase();

  return categories.find(
    (category) =>
      category.id.toLowerCase() === normalized ||
      category.name.toLowerCase() === normalized
  );
}

export function mapBackendListing(item: BackendListing): Listing {
  const category = getCategoryByGame(item.game);
  const sellerName =
    item.seller?.telegramName ||
    item.seller?.telegramUsername ||
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
      username: item.seller?.telegramUsername || "",
      rating: 5,
    },
  };
}

export async function fetchListings() {
  const { data } = await http.get<{ listings: BackendListing[] }>("/listings");
  return data.listings.map(mapBackendListing);
}
