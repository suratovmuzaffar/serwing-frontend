import { Metadata } from "next";
import HomePage from "@/features/home/components/home-page";

export const metadata: Metadata = {
  title: "Serwing - Digital products and online services",
  description: "Your all-in-one platform for digital products and online services.",
};

export default function Home() {
  return <HomePage />;
}
