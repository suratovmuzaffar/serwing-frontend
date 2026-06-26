"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { categories, donations } from "@/lib/data";
import { getLocaleFromPath, withLocale } from "@/shared/i18n/path";

export function DonationsPage() {
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);

  return (
    <div className="px-4 pt-6">
      <h1 className="text-2xl font-bold">Donatlar</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        O&apos;yin donatlari, passlar va tezkor takliflar
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {categories.map((category, index) => {
          const donationCount = donations.filter(
            (donation) => donation.gameId === category.id
          ).length;
          return (
            <Link
              key={category.id}
              href={withLocale(locale, `/donations/${category.id}`)}
              className="group relative min-h-32 animate-float-up overflow-hidden rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/50"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {category.image && (
                <Image
                  src={category.image}
                  alt=""
                  fill
                  sizes="(max-width: 390px) 50vw, 180px"
                  className="absolute inset-0 opacity-10 transition-opacity group-hover:opacity-20 object-cover"
                />
              )}
              <div className="relative">
                <div className="text-3xl">{category.emoji}</div>
                <h3 className="mt-3 text-sm font-bold">{category.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {donationCount || 1} taklif
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default DonationsPage;
