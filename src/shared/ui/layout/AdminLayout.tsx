"use client";

import React, { ReactNode, useMemo, useState } from "react";
import { Filter, Plus, RefreshCw, X } from "lucide-react";
import { useTranslations } from "@/shared/i18n/client";

type AdminPageLayoutProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  badge?: ReactNode;

  onCreate?: () => void;
  onRefresh?: () => void;

  filterContent?: ReactNode;

  children: ReactNode;

  compact?: boolean;
  withCard?: boolean;
};

const PRIMARY = "#003c84";

export function AdminPageLayout({
  title,
  description,
  icon,
  badge,
  onCreate,
  onRefresh,
  filterContent,
  children,
  compact = true,
  withCard = true,
}: AdminPageLayoutProps) {
  const t = useTranslations("AdminPageLayout");

  const [filterOpen, setFilterOpen] = useState(false);

  const hasTopActions = Boolean(filterContent || onRefresh || onCreate);

  const headerPadding = compact ? "px-4 py-3" : "px-6 py-5";
  const contentPadding = compact ? "px-4 py-4" : "px-6 py-6";
  const cardPadding = compact ? "p-3" : "p-6";

  const filterPanelClass = useMemo(() => {
    return [
      "mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm",
      "transition-all duration-200 ease-out",
      filterOpen
        ? "max-h-[520px] opacity-100 translate-y-0"
        : "max-h-0 opacity-0 -translate-y-1",
    ].join(" ");
  }, [filterOpen]);

  return (
    <div className="min-h-screen w-full bg-slate-50">
      {/* HEADER */}
      <div className="sticky top-0 z-20 w-full border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className={headerPadding}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            {/* Left */}
            <div className="min-w-0">
              <div className="flex items-start gap-2">
                {icon ? (
                  <div
                    className="mt-[2px] flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
                    style={{ backgroundColor: PRIMARY }}
                  >
                    {icon}
                  </div>
                ) : null}

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="truncate text-[18px] font-semibold tracking-tight text-slate-900">
                      {title}
                    </h1>

                    {badge ? (
                      <span
                        className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                        style={{ backgroundColor: `${PRIMARY}14`, color: PRIMARY }}
                      >
                        {badge}
                      </span>
                    ) : null}
                  </div>

                  {description ? (
                    <p className="mt-0.5 line-clamp-2 text-[13px] text-slate-600 sm:line-clamp-1">
                      {description}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Right */}
            {hasTopActions ? (
              <div className="flex flex-wrap items-center justify-end gap-2 sm:justify-start">
                {filterContent ? (
                  <button
                    type="button"
                    onClick={() => setFilterOpen((p) => !p)}
                    className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 active:scale-[0.98]"
                    aria-expanded={filterOpen}
                    aria-controls="admin-filter-panel"
                  >
                    <Filter size={15} />
                    <span className="hidden sm:inline">{t("filter")}</span>
                    <span className="sm:hidden">{t("filter")}</span>
                  </button>
                ) : null}

                {onRefresh ? (
                  <button
                    type="button"
                    onClick={onRefresh}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:scale-[0.98]"
                    aria-label={t("refresh")}
                    title={t("refresh")}
                  >
                    <RefreshCw size={15} />
                  </button>
                ) : null}

                {onCreate ? (
                  <button
                    type="button"
                    onClick={onCreate}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-xl px-3 text-white shadow-sm active:scale-[0.98]"
                    style={{ backgroundColor: PRIMARY }}
                    aria-label={t("create")}
                    title={t("create")}
                  >
                    <Plus size={18} />
                    <span className="text-[13px] font-semibold">{t("new")}</span>
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* Filter Panel */}
          {filterContent ? (
            <div id="admin-filter-panel" className={filterPanelClass}>
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div className="text-[13px] font-semibold text-slate-800">
                  {t("filters")}
                </div>

                <button
                  type="button"
                  onClick={() => setFilterOpen(false)}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 active:scale-[0.98]"
                >
                  <X size={14} />
                  {t("close")}
                </button>
              </div>

              <div className="p-4">{filterContent}</div>
            </div>
          ) : null}
        </div>
      </div>

      {/* CONTENT */}
      <div className={contentPadding}>
        {withCard ? (
          <div className="w-full rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
            <div className={cardPadding}>{children}</div>
          </div>
        ) : (
          <div className="w-full">{children}</div>
        )}
      </div>
    </div>
  );
}