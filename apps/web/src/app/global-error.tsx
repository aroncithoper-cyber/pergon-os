"use client";

import { useEffect } from "react";

import { logger } from "@/lib/logger";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    logger.exception("app.global_error_boundary", error, { digest: error.digest });
  }, [error]);

  return (
    <html lang="es">
      <body className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-white px-6 text-neutral-950">
        <h1 className="text-lg font-medium tracking-tight">Something went wrong</h1>
        <button
          type="button"
          onClick={reset}
          className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
