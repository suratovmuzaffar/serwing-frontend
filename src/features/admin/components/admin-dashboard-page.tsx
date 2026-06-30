"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  LayoutDashboard,
  Loader2,
  Package,
  Users,
} from "lucide-react";

import { useAuthMe } from "@/features/auth/hooks/useAuthMe";
import { hasTelegramLoginSignal } from "@/features/auth/services/telegram";
import {
  fetchAdminAnnouncements,
  fetchAdminOverview,
} from "@/features/admin/services/admin-api";
import { subscribeToTokenChanges, tokenStore } from "@/lib/tokenStore";
import { getLocaleFromPath, withLocale } from "@/shared/i18n/path";

const AUTH_WAIT_MS = 10000;

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function AdminDashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);
  const [hasAccessToken, setHasAccessToken] = useState(false);
  const [authTimedOut, setAuthTimedOut] = useState(false);

  useEffect(() => {
    function syncAccessToken() {
      setHasAccessToken(Boolean(tokenStore.getAccessToken()));
    }

    syncAccessToken();
    const unsubscribe = subscribeToTokenChanges(syncAccessToken);
    const timeout = window.setTimeout(() => setAuthTimedOut(true), AUTH_WAIT_MS);

    return () => {
      unsubscribe();
      window.clearTimeout(timeout);
    };
  }, []);

  const meQuery = useAuthMe(hasAccessToken);
  const user = meQuery.data;
  const isAdmin = user?.role === "admin";

  const overviewQuery = useQuery({
    queryKey: ["admin-overview"],
    queryFn: fetchAdminOverview,
    enabled: isAdmin,
  });

  const announcementsQuery = useQuery({
    queryKey: ["admin-announcements"],
    queryFn: fetchAdminAnnouncements,
    enabled: isAdmin,
  });

  useEffect(() => {
    if (!hasAccessToken && authTimedOut && !hasTelegramLoginSignal()) {
      router.replace(withLocale(locale, "/login"));
    }
  }, [authTimedOut, hasAccessToken, locale, router]);

  useEffect(() => {
    if (user && !isAdmin) {
      router.replace(withLocale(locale, "/home"));
    }
  }, [isAdmin, locale, router, user]);

  const stats = useMemo(
    () => [
      {
        label: "Foydalanuvchilar",
        value: overviewQuery.data?.usersCount ?? 0,
        icon: Users,
      },
      {
        label: "E'lonlar",
        value: overviewQuery.data?.announcementsCount ?? 0,
        icon: Package,
      },
      {
        label: "Saqlanganlar",
        value: overviewQuery.data?.wishlistCount ?? 0,
        icon: Heart,
      },
    ],
    [overviewQuery.data]
  );

  const isLoadingAuth =
    !authTimedOut && (!hasAccessToken || meQuery.isLoading || !user);
  const isLoadingAdmin =
    overviewQuery.isLoading || announcementsQuery.isLoading;

  if (isLoadingAuth || (isAdmin && isLoadingAdmin)) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="px-4 pt-6">
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push(withLocale(locale, "/home"))}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card"
          aria-label="Ortga"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold">Admin panel</h1>
          </div>
          <p className="text-xs text-muted-foreground">
            SERWING boshqaruv oynasi
          </p>
        </div>
      </header>

      <div className="mt-6 grid grid-cols-3 gap-2">
        {stats.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-border bg-card p-3"
          >
            <item.icon className="h-4 w-4 text-primary" />
            <p className="mt-3 text-lg font-bold">{item.value}</p>
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
              {item.label}
            </p>
          </div>
        ))}
      </div>

      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Oxirgi e&apos;lonlar</h2>
          <span className="text-xs text-muted-foreground">
            {announcementsQuery.data?.length ?? 0} ta
          </span>
        </div>

        <div className="mt-3 space-y-3">
          {(announcementsQuery.data ?? []).map((announcement) => (
            <div
              key={announcement.id}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-bold">
                    {announcement.title}
                  </h3>
                  <p className="mt-1 text-xs text-primary">
                    {announcement.game}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
                  {announcement.status}
                </span>
              </div>

              <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">
                {announcement.description}
              </p>

              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-sm font-bold">
                  {formatPrice(announcement.price)}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {announcement.seller?.telegramName ||
                    announcement.seller?.telegramUsername ||
                    `User #${announcement.sellerId}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AdminDashboardPage;
