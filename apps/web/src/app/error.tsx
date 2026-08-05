"use client";

import { useEffect } from "react";

import { Button } from "@pergon/ui/components/button";

import { logger } from "@/lib/logger";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    logger.exception("app.error_boundary", error, { digest: error.digest });
  }, [error]);

  return (
    <main className="bg-background text-foreground flex min-h-dvh flex-col items-center justify-center gap-4 px-6">
      <h1 className="text-lg font-medium tracking-tight">Algo salió mal</h1>
      <Button type="button" variant="outline" onClick={reset}>
        Reintentar
      </Button>
    </main>
  );
}
