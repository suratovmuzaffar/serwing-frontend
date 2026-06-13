"use client";

import React from "react";
import { Button } from "@/shared/ui/Button";
import { RefreshCcw } from "lucide-react";
import { useTranslations } from "@/shared/i18n/client";

export default function RefreshButton({ reset }: { reset: () => void }) {
  const t = useTranslations("ErrorPage");

  const [spinning, setSpinning] = React.useState(false);
  const tRef = React.useRef<number | null>(null);

  const handleReset = () => {
    setSpinning(true);
    reset();

    if (tRef.current) window.clearTimeout(tRef.current);
    tRef.current = window.setTimeout(() => setSpinning(false), 1200);
  };

  React.useEffect(() => {
    return () => {
      if (tRef.current) window.clearTimeout(tRef.current);
    };
  }, []);

  return (
    <Button
      type="button"
      variant="primary"
      size="lg"
      fullWidth={false}
      onClick={handleReset}
      leftIcon={
        <RefreshCcw
          className={["h-5 w-5", spinning ? "animate-spin" : ""].join(" ")}
        />
      }
      className="min-w-[200px] rounded-md"
    >
      {t("retry")}
    </Button>
  );
}