import { ListingRoutePage } from "@/features/listings/components/listing-route-page";

export const metadata = {
  title: "E'lon tafsilotlari - Serwing",
};

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <ListingRoutePage id={id} />;
}
