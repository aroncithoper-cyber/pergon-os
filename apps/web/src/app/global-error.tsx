"use client";

import { useEffect } from "react";

import { logger } from "@/lib/logger";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/** Emergency root boundary — cannot rely on app chrome or theme tokens. */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    logger.exception("app.global_error_boundary", error, { digest: error.digest });
  }, [error]);

  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.25rem",
          padding: "1.5rem",
          background: "#0B0D12",
          color: "#F4F6F8",
          fontFamily: "system-ui, Segoe UI, sans-serif",
          textAlign: "center",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600, letterSpacing: "-0.02em" }}>
          Algo salió mal
        </h1>
        <p
          style={{ margin: 0, maxWidth: "28rem", color: "rgba(244,246,248,0.72)", lineHeight: 1.5 }}
        >
          Error crítico de la aplicación. Puede reintentar la carga.
        </p>
        {error.digest ? (
          <p
            style={{
              margin: 0,
              fontFamily: "ui-monospace, monospace",
              fontSize: "0.75rem",
              opacity: 0.6,
            }}
          >
            ID · {error.digest}
          </p>
        ) : null}
        <button
          type="button"
          onClick={reset}
          style={{
            cursor: "pointer",
            borderRadius: "0.375rem",
            border: "1px solid rgba(30,107,255,0.55)",
            background: "#1E6BFF",
            color: "#F4F6F8",
            padding: "0.5rem 1rem",
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
        >
          Reintentar
        </button>
      </body>
    </html>
  );
}
