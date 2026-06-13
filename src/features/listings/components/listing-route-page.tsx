import { notFound } from "next/navigation";

import { getListing } from "@/lib/data";
import { ListingDetailPage } from "@/features/listings/components/listing-detail-page";

export function ListingRoutePage({ id }: { id: string }) {
  const item = getListing(id);

  if (!item) {
    notFound();
  }

  return <ListingDetailPage item={item} />;
}

export default ListingRoutePage;
