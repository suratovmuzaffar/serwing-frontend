"use client";

import { Button } from "@/shared/ui/Button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/shared/i18n/client";

export default function BackButton() {
  const router = useRouter();
  const t = useTranslations("NotFoundPage");

  return (
    <Button
      onClick={() => router.back()}
      variant="secondary"
      fullWidth={false}
      leftIcon={<ArrowLeft className="h-4 w-4" />}
    >
      {t("goBack")}
    </Button>
  );
}