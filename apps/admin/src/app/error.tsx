"use client";

import { useEffect } from "react";

import { useI18n } from "@/i18n";
import { logger } from "@/lib/logger";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  const { t } = useI18n();

  useEffect(() => {
    logger.exception("app.error_boundary", error, { digest: error.digest });
  }, [error]);

  return (
    <main className="bg-background text-foreground flex min-h-dvh flex-col items-center justify-center gap-4 px-6">
      <h1 className="text-lg font-medium tracking-tight">{t("errors.boundaryTitle")}</h1>
      <button
        type="button"
        onClick={reset}
        className="border-border bg-background hover:bg-accent rounded-md border px-3 py-2 text-sm"
      >
        {t("errors.boundaryRetry")}
      </button>
    </main>
  );
}
