"use client";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-[390px] bg-transparent text-foreground">
      {children}
    </div>
  );
}
