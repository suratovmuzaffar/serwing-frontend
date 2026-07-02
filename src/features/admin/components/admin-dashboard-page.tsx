"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  FolderKanban,
  Heart,
  LayoutDashboard,
  Loader2,
  Menu,
  Package,
  Tags,
  Users,
  X,
} from "lucide-react";

import { useAuthMe } from "@/features/auth/hooks/useAuthMe";
import { hasTelegramLoginSignal } from "@/features/auth/services/telegram";
import {
  fetchAdminAnnouncements,
  fetchAdminOverview,
  fetchAdminUsers,
} from "@/features/admin/services/admin-api";
import { categories } from "@/lib/data";
import { subscribeToTokenChanges, tokenStore } from "@/lib/tokenStore";
import { cn } from "@/lib/utils";
import { getLocaleFromPath, withLocale } from "@/shared/i18n/path";
import { BrandLogo } from "@/shared/ui/brand/BrandLogo";

const AUTH_WAIT_MS = 10000;

type AdminSection = "overview" | "users" | "announcements" | "categories";

const navItems: Array<{
  id: AdminSection;
  label: string;
  description: string;
  icon: typeof LayoutDashboard;
}> = [
  {
    id: "overview",
    label: "Dashboard",
    description: "Umumiy holat",
    icon: LayoutDashboard,
  },
  {
    id: "users",
    label: "Users",
    description: "Foydalanuvchilar",
    icon: Users,
  },
  {
    id: "announcements",
    label: "E'lonlar",
    description: "Listing nazorati",
    icon: Package,
  },
  {
    id: "categories",
    label: "Categories",
    description: "O'yin bo'limlari",
    icon: Tags,
  },
];

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value?: string) {
  if (!value) return "";

  return new Intl.DateTimeFormat("uz-UZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function AdminDashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);
  const [hasAccessToken, setHasAccessToken] = useState(false);
  const [authTimedOut, setAuthTimedOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");

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

  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchAdminUsers,
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
        label: "Users",
        value: overviewQuery.data?.usersCount ?? 0,
        icon: Users,
      },
      {
        label: "E'lonlar",
        value: overviewQuery.data?.announcementsCount ?? 0,
        icon: Package,
      },
      {
        label: "Saqlangan",
        value: overviewQuery.data?.wishlistCount ?? 0,
        icon: Heart,
      },
    ],
    [overviewQuery.data]
  );

  const activeNav = navItems.find((item) => item.id === activeSection) ?? navItems[0];
  const isLoadingAuth =
    !authTimedOut && (!hasAccessToken || meQuery.isLoading || !user);
  const isLoadingAdmin =
    overviewQuery.isLoading || announcementsQuery.isLoading || usersQuery.isLoading;

  if (isLoadingAuth || (isAdmin && isLoadingAdmin)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 active:scale-[0.98]"
              aria-label={menuOpen ? "Admin menuni yopish" : "Admin menuni ochish"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <div className="min-w-0">
              <BrandLogo
                logoClassName="h-9 w-11"
                textClassName="text-[19px]"
                suffix="Admin"
              />
              <p className="truncate text-xs text-slate-500">
                {activeNav.label} - {activeNav.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700"
              aria-label="Admin bildirishnomalar"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
            </button>
            <button
              type="button"
              onClick={() => router.push(withLocale(locale, "/home"))}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 active:scale-[0.98]"
              aria-label="Saytga qaytish"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          className={cn(
            "overflow-hidden border-t border-slate-100 bg-white transition-[max-height,opacity] duration-200",
            menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <nav className="mx-auto grid w-full max-w-6xl gap-2 px-4 py-3 sm:grid-cols-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveSection(item.id);
                  setMenuOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors active:scale-[0.99]",
                  activeSection === item.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">
                    {item.label}
                  </span>
                  <span className="block truncate text-xs text-slate-500">
                    {item.description}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-5">
        {activeSection === "overview" && (
          <section>
            <div className="grid gap-3 sm:grid-cols-3">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >
                  <item.icon className="h-5 w-5 text-primary" />
                  <p className="mt-4 text-2xl font-bold">{item.value}</p>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-primary" />
                <h2 className="text-sm font-bold">Tezkor ko&apos;rinish</h2>
              </div>
              <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setActiveSection("users")}
                  className="rounded-xl bg-slate-50 px-3 py-3 text-left font-semibold text-slate-700"
                >
                  Users boshqaruvi
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection("announcements")}
                  className="rounded-xl bg-slate-50 px-3 py-3 text-left font-semibold text-slate-700"
                >
                  E&apos;lonlar nazorati
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection("categories")}
                  className="rounded-xl bg-slate-50 px-3 py-3 text-left font-semibold text-slate-700"
                >
                  Categories ro&apos;yxati
                </button>
              </div>
            </div>
          </section>
        )}

        {activeSection === "users" && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold">Users</h2>
              <span className="text-xs text-slate-500">
                {usersQuery.data?.length ?? 0} ta
              </span>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              {(usersQuery.data ?? []).map((adminUser, index) => (
                <div
                  key={adminUser.id}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3",
                    index > 0 && "border-t border-slate-100"
                  )}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700">
                    {(adminUser.profileName || adminUser.telegramName || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {adminUser.profileName ||
                        adminUser.telegramName ||
                        `User #${adminUser.id}`}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      TG: {adminUser.telegramId || "ulanmagan"} · {formatDate(adminUser.createdAt)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2 py-1 text-[11px] font-bold",
                      adminUser.role === "admin"
                        ? "bg-primary/10 text-primary"
                        : "bg-slate-100 text-slate-600"
                    )}
                  >
                    {adminUser.role}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeSection === "announcements" && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold">E&apos;lonlar</h2>
              <span className="text-xs text-slate-500">
                {announcementsQuery.data?.length ?? 0} ta
              </span>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              {(announcementsQuery.data ?? []).map((announcement) => (
                <div
                  key={announcement.id}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold">
                        {announcement.title}
                      </h3>
                      <p className="mt-1 text-xs font-medium text-primary">
                        {announcement.game}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
                      {announcement.status}
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">
                    {announcement.description}
                  </p>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-base font-bold">
                      {formatPrice(announcement.price)}
                    </span>
                    <span className="truncate text-xs text-slate-500">
                      {announcement.seller?.telegramName ||
                        announcement.seller?.telegramUsername ||
                        `User #${announcement.sellerId}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeSection === "categories" && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold">Categories</h2>
              <span className="text-xs text-slate-500">
                {categories.length} ta
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-700">
                      {category.emoji}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold">
                        {category.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        ID: {category.id} · {category.count} ta
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default AdminDashboardPage;
