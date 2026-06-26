"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid3x3, Heart, Home, PlusCircle, User } from "lucide-react";

import { cn } from "@/lib/utils";
import { getLocaleFromPath, withLocale } from "@/shared/i18n/path";

const tabs = [
  { path: "/home", icon: Home, label: "Asosiy" },
  { path: "/donations", icon: Grid3x3, label: "Donatlar" },
  { path: "/add", icon: PlusCircle, label: "Sotish" },
  { path: "/favorites", icon: Heart, label: "Saqlangan" },
  { path: "/profile", icon: User, label: "Profil" },
];

export function BottomNav() {
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-full max-w-[390px] -translate-x-1/2 px-4 pb-[env(safe-area-inset-bottom)]">
      <nav className="mx-auto w-max rounded-3xl border border-white/10 bg-background/70 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center gap-1 px-2 py-2">
          {tabs.map(({ path, icon: Icon, label }) => {
            const href = withLocale(locale, path);
            const active =
              path === "/home"
                ? pathname === `/${locale}` || pathname === href
                : pathname.startsWith(href);
            const isAdd = path === "/add";

            return (
              <Link
                key={path}
                href={href}
                className={cn(
                  "relative flex min-w-[62px] flex-col items-center justify-center rounded-2xl px-3 py-2 text-[10px] font-medium transition-all duration-200",
                  active ? "text-blue-500" : "text-muted-foreground hover:text-blue-500"
                )}
              >
                {active && !isAdd && <span className="absolute inset-0 rounded-2xl bg-white/10" />}

                {isAdd ? (
                  <span className="relative -mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 shadow-lg shadow-cyan-500/30">
                    <Icon className="h-6 w-6 text-white" />
                  </span>
                ) : (
                  <Icon className="relative z-10 h-5 w-5" />
                )}

                {!isAdd && <span className="relative z-10 mt-1">{label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
