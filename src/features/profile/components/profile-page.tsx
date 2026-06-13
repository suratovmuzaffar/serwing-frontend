"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  Coins,
  Gift,
  LogOut,
  Mail,
  Package,
  Phone,
  Settings,
  Star,
  Send,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

import { listings } from "@/lib/data";

interface User {
  name: string;
  email: string;
  telegramUsername?: string;
  rating: number;
}

function getLocale(pathname: string) {
  const locale = pathname.split("/").filter(Boolean)[0];
  return locale || "uz";
}

function AccountMethodComponent({
  icon: Icon,
  label,
  value,
  verified,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  verified: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-secondary px-3 py-2.5">
      <Icon className="h-4 w-4 text-primary" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{label}</p>
        <p className="truncate text-xs text-muted-foreground">{value}</p>
      </div>
      <span
        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
          verified
            ? "bg-success/20 text-success"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {verified ? "Tasdiqlangan" : "Kutilmoqda"}
      </span>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 text-center">
      <Icon className="mx-auto h-4 w-4 text-primary" />
      <p className="mt-1 text-lg font-bold">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

export function ProfilePage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const [user] = useState<User>({
    name: "Ahmed",
    email: "ahmed@example.com",
    telegramUsername: "ahmed_coc",
    rating: 4.9,
  });
  const [points] = useState(5);
  const [referralCode] = useState("AHMED123");

  const myListings = listings.slice(0, 2);
  const displayName = user.name || "Foydalanuvchi";
  const initial = displayName.charAt(0).toUpperCase();

  function handleLogout() {
    router.push(`/${locale}/home`);
  }

  return (
    <div className="px-4 pt-6">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary text-2xl font-bold text-primary-foreground">
            {initial}
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold">{displayName}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-1 flex items-center gap-1 text-xs text-warning">
              <Star className="h-3 w-3 fill-warning" /> {user.rating} reyting
            </div>
          </div>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary"
            aria-label="Sozlamalar"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">Kirish usullari</h2>
        <div className="mt-3 space-y-2">
          <AccountMethodComponent
            icon={Send}
            label="Telegram"
            value={
              user.telegramUsername ? `@${user.telegramUsername}` : "Ulanmagan"
            }
            verified={!!user.telegramUsername}
          />
          <AccountMethodComponent
            icon={Mail}
            label="Email"
            value={user.email}
            verified
          />
          <AccountMethodComponent
            icon={Phone}
            label="Telefon"
            value="Keyinroq ulanadi"
            verified={false}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Stat icon={Package} label="E'lonlar" value="8" />
        <Stat icon={CheckCircle2} label="Sotilgan" value="23" />
        <Stat icon={Clock} label="Faol" value="2" />
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Coins className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">{points} ball</p>
            <p className="text-xs text-muted-foreground">
              1 ta e'lon joylash uchun 1 ball kerak
            </p>
          </div>
        </div>
        <div className="mt-3 rounded-xl bg-secondary p-3">
          <p className="text-[10px] font-semibold uppercase text-muted-foreground">
            Referral kod
          </p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="truncate text-sm font-bold">{referralCode}</span>
            <button
              type="button"
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
            >
              <Gift className="h-3.5 w-3.5" /> +1 ball
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Mening e'lonlarim</h2>
        <button type="button" className="text-xs text-primary">
          Barchasi
        </button>
      </div>
      <div className="mt-3 space-y-2">
        {myListings.map((listing) => (
          <Link
            key={listing.id}
            href={`/${locale}/listing/${listing.id}`}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-primary/40"
          >
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
              <Image
                src={listing.image}
                alt={listing.title}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{listing.title}</p>
              <p className="text-xs text-muted-foreground">{listing.game}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold">${listing.price}</p>
              <span className="rounded-full bg-success/20 px-2 py-0.5 text-[10px] text-success">
                Faol
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        {[
          { label: "Sozlamalar", icon: Settings },
          { label: "Mening sotuvlarim", icon: Package },
          { label: "Chiqish", icon: LogOut, danger: true },
        ].map((item, index) => (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              if (item.label === "Chiqish") {
                handleLogout();
              }
            }}
            className={`flex w-full items-center gap-3 px-4 py-3.5 text-sm transition-colors hover:bg-secondary ${
              index > 0 ? "border-t border-border" : ""
            } ${item.danger ? "text-destructive" : ""}`}
          >
            <item.icon className="h-4 w-4" />
            <span className="flex-1 text-left font-medium">{item.label}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default ProfilePage;
