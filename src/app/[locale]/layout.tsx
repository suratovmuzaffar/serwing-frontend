import { notFound } from "next/navigation";

import AppProviders from "@/providers/AppProviders";
import { locales, type Locale } from "@/shared/i18n/config";
import { getDictionary } from "@/shared/i18n/getDictionary";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

function isLocale(l: string): l is Locale {
  return (locales as readonly string[]).includes(l);
}

type LayoutParams = { locale: string };

export default async function LocaleLayout({
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
    <AppProviders locale={locale} dictionary={dictionary}>
      {children}
    </AppProviders>
  );
}
