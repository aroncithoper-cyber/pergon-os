"use client";

import { Suspense, type ReactNode } from "react";

export type ProductModelSlotProps = {
  modelUrl?: string | null;
  alt?: string;
  className?: string;
  fallback?: ReactNode;
};

/**
 * Prepared 3D slot for catalog PDPs.
 * Loads a real R3F scene only when a model URL is published via Admin/catalog assets.
 */
export function ProductModelSlot({
  modelUrl,
  alt = "Modelo 3D del producto",
  className,
  fallback,
}: ProductModelSlotProps) {
  if (!modelUrl) {
    return (
      <div
        className={className}
        style={{
          minHeight: "20rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px dashed hsl(var(--border))",
          background: "hsl(var(--panel))",
        }}
        role="img"
        aria-label={alt}
      >
        {fallback ?? (
          <div style={{ textAlign: "center", padding: "2rem", maxWidth: "28rem" }}>
            <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Render 3D preparado</p>
            <p style={{ fontSize: "0.875rem", color: "hsl(var(--muted-foreground))" }}>
              El modelo se mostrará cuando Admin publique un asset model_3d para este producto.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        position: "relative",
        minHeight: "20rem",
        overflow: "hidden",
        border: "1px solid hsl(var(--border))",
        background: "hsl(var(--panel))",
      }}
      role="img"
      aria-label={alt}
    >
      <Suspense
        fallback={
          <div
            style={{
              minHeight: "20rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.875rem",
              color: "hsl(var(--muted-foreground))",
            }}
          >
            Cargando modelo 3D…
          </div>
        }
      >
        <div
          style={{
            minHeight: "20rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
            textAlign: "center",
            fontSize: "0.875rem",
            color: "hsl(var(--muted-foreground))",
          }}
        >
          Modelo listo para carga: {modelUrl}
        </div>
      </Suspense>
    </div>
  );
}
