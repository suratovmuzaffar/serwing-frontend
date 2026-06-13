import { Metadata } from "next";
import HomePage from "@/features/home/components/home-page";

export const metadata: Metadata = {
  title: "Serwing - Akkauntlar bozori",
  description: "Eng yaxshi narxlarda o'yin akkauntlarini sotib oling",
};

export default function Home() {
  return <HomePage />;
}
