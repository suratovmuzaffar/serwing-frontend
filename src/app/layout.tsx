import type { Metadata, Viewport } from "next";
import Script from "next/script";

import "@/styles/global.css";

const SITE_URL = "https://sefirmarket.uz";
const OG_IMAGE = "/og.jpg";
const SITE_DESCRIPTION =
  "Your all-in-one platform for digital products and online services.";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#003c84",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Serwing - Digital products and online services",
    template: "%s | Serwing",
  },
  description: SITE_DESCRIPTION,
  icons: {
    icon: [
      {
        url: "/assets/serwinglogo.png",
        type: "image/png",
      },
    ],
    shortcut: "/assets/serwinglogo.png",
    apple: "/assets/serwinglogo.png",
  },
  alternates: {
    canonical: "/",
    languages: {
      en: "/en",
      uz: "/uz",
      ru: "/ru",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Serwing",
    title: "Serwing - Digital products and online services",
    description: SITE_DESCRIPTION,
    locale: "en_US",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Serwing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Serwing - Digital products and online services",
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  applicationName: "Serwing",
  creator: "Serwing",
  publisher: "Serwing",
  category: "marketplace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  );
}
