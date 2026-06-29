import { http } from "@/services/http";

export type UploadImageResponse = {
  success: boolean;
  message: string;
  data: {
    filename: string;
    mimeType: string;
    size: number;
    fileUrl: string;
  };
};

export type CreateListingPayload = {
  game: string;
  description: string;
  imageUrl?: string | null;
};

export async function uploadListingImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await http.post<UploadImageResponse>("/uploads/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data.data.fileUrl;
}

export async function createListing(payload: CreateListingPayload) {
  const { data } = await http.post("/announcements", payload);
  return data;
}
