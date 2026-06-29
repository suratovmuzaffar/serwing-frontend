"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit3,
  Loader2,
  PackageOpen,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { categories } from "@/lib/data";
import { getAssetUrl } from "@/lib/assets";
import { tokenStore } from "@/lib/tokenStore";
import { getLocaleFromPath, withLocale } from "@/shared/i18n/path";
import {
  deleteMyAnnouncement,
  fetchMyAnnouncements,
  type MyAnnouncement,
  updateMyAnnouncement,
} from "@/features/my-announcements/services/my-announcements";

type AnnouncementForm = {
  title: string;
  description: string;
  price: string;
  game: string;
  rank: string;
};

function toForm(announcement: MyAnnouncement): AnnouncementForm {
  return {
    title: announcement.title || "",
    description: announcement.description || "",
    price: String(announcement.price || ""),
    game: announcement.game || categories[0]?.name || "",
    rank: announcement.rank || "",
  };
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "mt-1.5 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold outline-none transition-colors placeholder:text-muted-foreground focus:border-primary";

export function MyAnnouncementsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<AnnouncementForm>({
    title: "",
    description: "",
    price: "",
    game: categories[0]?.name || "",
    rank: "",
  });

  useEffect(() => {
    if (!tokenStore.getAccessToken()) {
      router.replace(withLocale(locale, "/login"));
    }
  }, [locale, router]);

  const announcementsQuery = useQuery({
    queryKey: ["my-announcements"],
    queryFn: fetchMyAnnouncements,
    enabled: Boolean(tokenStore.getAccessToken()),
  });

  const updateAnnouncement = useMutation({
    mutationFn: async () => {
      if (!editingId) throw new Error("E'lon tanlanmagan");

      const price = Number(form.price);
      if (!Number.isFinite(price) || price <= 0) {
        throw new Error("Narx noto'g'ri");
      }

      return updateMyAnnouncement(editingId, {
        title: form.title.trim(),
        description: form.description.trim(),
        price,
        game: form.game,
        rank: form.rank.trim() || null,
      });
    },
    onSuccess: () => {
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ["my-announcements"] });
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });

  const removeAnnouncement = useMutation({
    mutationFn: deleteMyAnnouncement,
    onSuccess: () => {
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ["my-announcements"] });
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });

  function startEdit(announcement: MyAnnouncement) {
    setEditingId(announcement.id);
    setForm(toForm(announcement));
  }

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push(withLocale(locale, "/profile"))}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground"
          aria-label="Ortga"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-lg font-bold">E&apos;lonlarim</h1>
          <p className="text-xs text-muted-foreground">E&apos;lonlaringizni boshqaring</p>
        </div>
      </div>

      {announcementsQuery.isLoading ? (
        <div className="flex min-h-[55vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : announcementsQuery.data?.length ? (
        <div className="mt-6 space-y-3 pb-24">
          {announcementsQuery.data.map((announcement) => (
            <div
              key={announcement.id}
              className="overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="flex gap-3 p-3">
                <div className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                  {announcement.imageUrl ? (
                    <img
                      src={getAssetUrl(announcement.imageUrl)}
                      alt={announcement.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                      Rasm yo&apos;q
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="line-clamp-1 text-sm font-bold">{announcement.title}</h2>
                      <p className="mt-1 text-xs font-medium text-primary">{announcement.game}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-secondary px-2 py-1 text-[10px] font-semibold">
                      {announcement.status}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
                    {announcement.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-base font-bold">${announcement.price}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(announcement)}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground"
                        aria-label="Tahrirlash"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(announcement.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-destructive/10 text-destructive"
                        aria-label="O'chirish"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {editingId === announcement.id && (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    updateAnnouncement.mutate();
                  }}
                  className="space-y-3 border-t border-border p-3"
                >
                  <Field label="Sarlavha">
                    <input
                      value={form.title}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, title: event.target.value }))
                      }
                      className={inputClass}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="O'yin">
                      <select
                        value={form.game}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, game: event.target.value }))
                        }
                        className={inputClass}
                      >
                        {categories.map((category) => (
                          <option key={category.id} value={category.name}>
                            {category.emoji} {category.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Narx">
                      <input
                        inputMode="decimal"
                        value={form.price}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, price: event.target.value }))
                        }
                        className={inputClass}
                      />
                    </Field>
                  </div>
                  <Field label="Rank">
                    <input
                      value={form.rank}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, rank: event.target.value }))
                      }
                      placeholder="Masalan: Titan I"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Tavsif">
                    <textarea
                      value={form.description}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                      rows={4}
                      className={`${inputClass} resize-none leading-5`}
                    />
                  </Field>
                  {updateAnnouncement.isError && (
                    <p className="text-xs text-destructive">
                      {updateAnnouncement.error instanceof Error
                        ? updateAnnouncement.error.message
                        : "Saqlashda xatolik"}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-secondary text-sm font-semibold"
                    >
                      <X className="h-4 w-4" />
                      Bekor qilish
                    </button>
                    <button
                      type="submit"
                      disabled={updateAnnouncement.isPending}
                      className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-70"
                    >
                      {updateAnnouncement.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Saqlash
                    </button>
                  </div>
                </form>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <PackageOpen className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-base font-bold">E&apos;lonlar yo&apos;q</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Birinchi e&apos;loningizni joylashtiring.
          </p>
          <button
            type="button"
            onClick={() => router.push(withLocale(locale, "/add"))}
            className="mt-5 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
          >
            E&apos;lon qo&apos;shish
          </button>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/35 px-4 pb-6">
          <div className="w-full max-w-sm rounded-2xl bg-card p-4 shadow-xl">
            <h2 className="text-base font-bold">E&apos;lon o&apos;chirilsinmi?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Bu amalni ortga qaytarib bo&apos;lmaydi.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="h-11 flex-1 rounded-xl bg-secondary text-sm font-semibold"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                disabled={removeAnnouncement.isPending}
                onClick={() => removeAnnouncement.mutate(deleteId)}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-destructive text-sm font-semibold text-destructive-foreground disabled:opacity-70"
              >
                {removeAnnouncement.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                O&apos;chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyAnnouncementsPage;
