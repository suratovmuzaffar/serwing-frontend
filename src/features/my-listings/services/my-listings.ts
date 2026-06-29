import { http } from "@/services/http";

export type MyListing = {
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

export type ListingUpdatePayload = {
  title?: string;
  description?: string;
  price?: number;
  game?: string;
  imageUrl?: string | null;
  platform?: string | null;
  region?: string | null;
  rank?: string | null;
};

export async function fetchMyListings() {
  const { data } = await http.get<{ listings: MyListing[] }>("/listings/me");
  return data.listings;
}

export async function updateMyListing(id: number, payload: ListingUpdatePayload) {
  const { data } = await http.put<{ listing: MyListing }>(`/listings/${id}`, payload);
  return data.listing;
}

export async function deleteMyListing(id: number) {
  await http.delete(`/listings/${id}`);
}
