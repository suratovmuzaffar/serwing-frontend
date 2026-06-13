import { DonationRoutePage } from "@/features/donations/components/donation-route-page";

export const metadata = {
  title: "Donat tafsilotlari - Serwing",
};

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <DonationRoutePage id={id} />;
}
