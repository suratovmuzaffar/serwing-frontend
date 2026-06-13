"use client";

import { Button } from "@/shared/ui/Button";
import { House } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/shared/i18n/client";

export default function GoHomeButton() {
  const router = useRouter();
  const t = useTranslations("NotFoundPage");

  return (
    <Button
      type="button"
      onClick={() => router.push("/")}
      variant="blue"
      fullWidth={false}
      leftIcon={<House className="h-4 w-4" />}
    >
      {t("goHome")}
    </Button>
  );
}