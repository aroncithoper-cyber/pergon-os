"use client";

import { useEffect } from "react";
import Link from "next/link";

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
    <main
      id="main"
      className="bg-background text-foreground flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center"
    >
      <div className="space-y-3">
        <p className="type-label text-muted-foreground">Error</p>
        <h1 className="type-h2 text-foreground">Algo salió mal</h1>
        <p className="type-body text-muted-foreground max-w-md text-pretty">
          La interfaz encontró un problema inesperado. Puede reintentar o volver al inicio.
        </p>
        {error.digest ? (
          <p className="type-caption text-muted-foreground font-mono">ID · {error.digest}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button type="button" variant="signal" onClick={reset}>
          Reintentar
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Inicio</Link>
        </Button>
      </div>
    </main>
  );
}
