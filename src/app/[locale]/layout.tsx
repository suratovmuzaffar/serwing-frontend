import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "@/styles/global.css";
import AppProviders from "@/providers/AppProviders";
import { locales, type Locale } from "@/shared/i18n/config";
import { getDictionary } from "@/shared/i18n/getDictionary";

// ✅ (SEO) asosiy domain (https bo‘lishi kerak)
const SITE_URL = "https://sefirmarket.uz";

// ✅ (SEO) OG rasm: public ichida bo‘lsin: /public/og.jpg (1200x630 tavsiya)
const OG_IMAGE = "/og.jpg";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#003c84",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  // ✅ Title (template)
  title: {
    default: "Sefir Market – Onlayn Parfyume Do‘koni",
    template: "%s | Sefir Market",
  },

  // ✅ Description (SEO uchun eng muhimlardan)
  description:
    "Sefir Market — original atir va parfyumelar onlayn do‘koni. Brendlar: Creed, Dior, Chanel va boshqalar. Tez yetkazib berish.",

  // ✅ Keywords (Lighthouse SEO’da ko‘p ta’sir qilmaydi, lekin zarar qilmaydi)
  keywords: [
    "parfyum",
    "atir",
    "parfum",
    "original parfyum",
    "Creed",
    "Dior",
    "Chanel",
    "O‘zbekiston",
    "Toshkent",
    "Sefir Market",
  ],

  // ✅ Canonical + language alternates
  alternates: {
    canonical: "/",
    languages: {
      uz: "/uz",
      ru: "/ru",
    },
  },

  // ✅ Robots
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

  // ✅ OpenGraph (Telegram/FB/LinkedIn preview)
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Sefir Market",
    title: "Sefir Market – Onlayn Parfyume Do‘koni",
    description:
      "Original atir va parfyumelar onlayn do‘koni. Brendlar: Creed, Dior, Chanel va boshqalar.",
    locale: "uz_UZ",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Sefir Market",
      },
    ],
  },

  // ✅ Twitter (X) preview
  twitter: {
    card: "summary_large_image",
    title: "Sefir Market – Onlayn Parfyume Do‘koni",
    description:
      "Original atir va parfyumelar onlayn do‘koni. Brendlar: Creed, Dior, Chanel va boshqalar.",
    images: [OG_IMAGE],
  },

  // ✅ Extra SEO
  applicationName: "Sefir Market",
  creator: "Sefir Market",
  publisher: "Sefir Market",
  category: "ecommerce",
};

// i18n SSG params
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

function isLocale(l: string): l is Locale {
  return (locales as readonly string[]).includes(l);
}

type LayoutParams = { locale: string };

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<LayoutParams>;
}) {
  const resolvedParams = await params;
  const localeParam = resolvedParams.locale;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam;
  const dictionary = await getDictionary(locale);

  return (
    <html lang={locale}>
      <body>
        <AppProviders locale={locale} dictionary={dictionary}>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
