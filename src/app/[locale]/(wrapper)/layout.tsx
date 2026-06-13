import { BottomNav } from "@/shared/ui/layout/BottomNav";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto min-h-screen max-w-[390px] bg-background pb-28 text-foreground">
      <main>{children}</main>
      <BottomNav />
    </div>
  );
}
