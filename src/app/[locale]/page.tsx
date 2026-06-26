import { notFound, redirect } from "next/navigation";
import { locales, type Locale } from "@/shared/i18n/config";

function isLocale(l: string): l is Locale {
  return (locales as readonly string[]).includes(l);
}

type PageParams = { locale: string };

export default async function Page({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const resolvedParams = await params;
  const localeParam = resolvedParams.locale;

  if (!isLocale(localeParam)) {
    notFound();
  }

  redirect(`/${localeParam}/home`);
}
