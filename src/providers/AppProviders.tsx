"use client";

import React, { useState } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import type { Locale } from "@/shared/i18n/config";
import type { Dictionary } from "@/shared/i18n/types";
import { I18nProvider } from "@/shared/i18n/client";
import { AuthBootstrap } from "@/features/auth/components/AuthBootstrap";

export default function AppProviders({
  children,
  locale,
  dictionary,
}: {
  children: React.ReactNode;
  locale: Locale;
  dictionary: Dictionary;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <I18nProvider locale={locale} dictionary={dictionary}>
          <AuthBootstrap />
          {children}
        </I18nProvider>
      </QueryClientProvider>
    </Provider>
  );
}
