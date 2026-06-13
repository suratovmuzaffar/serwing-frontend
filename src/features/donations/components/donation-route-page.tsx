import { notFound } from "next/navigation";

import { categories } from "@/lib/data";
import { DonationDetailsPage } from "@/features/donations/components/donation-details-page";

export function DonationRoutePage({ id }: { id: string }) {
  const category = categories.find((item) => item.id === id);

  if (!category) {
    notFound();
  }

  return <DonationDetailsPage id={id} category={category} />;
}

export default DonationRoutePage;
