import { Metadata } from "next";
import { DonationsPage } from "@/features/donations/components/donations-page";

export const metadata: Metadata = {
  title: "Donatlar - Serwing",
  description: "O'yin donatlari, passlar va tezkor takliflar",
};

export default function Page() {
  return <DonationsPage />;
}
