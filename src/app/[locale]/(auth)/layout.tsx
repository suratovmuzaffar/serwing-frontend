"use client";

import LoginLayout from "@/features/auth/components/layouts/LoginLayout";

export default function Layout({ children }: { children: React.ReactNode }) {

  return <LoginLayout>{children}</LoginLayout>;
}