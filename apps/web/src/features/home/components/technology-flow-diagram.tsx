"use client";

import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@pergon/ui/lib/utils";

const STEPS = [
  { key: "unit", label: "Unidad", detail: "Identidad única del activo" },
  { key: "qr", label: "QR dinámico", detail: "Puerta de acceso gobernada" },
  { key: "scan", label: "Escaneo", detail: "Evento auditable" },
  { key: "verify", label: "Verificación", detail: "Dictamen server-side" },
] as const;

/** Typographic verification chain — no glass icon grid. */
export function TechnologyFlowDiagram({ className }: { className?: string }) {
  const reduce = useReducedMotion();

  return (
    <div
      className={cn("border-border/50 border-y py-2", className)}
      aria-label="Flujo de verificación PerGon"
    >
      <ol className="divide-border divide-y">
        {STEPS.map((step, index) => (
          <motion.li
            key={step.key}
            className="grid gap-2 py-6 sm:grid-cols-[4.5rem_minmax(0,12rem)_minmax(0,1fr)] sm:items-baseline sm:gap-8 md:py-8"
            initial={reduce ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: index * 0.05, duration: 0.35 }}
          >
            <span className="type-label text-signal tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="type-h3 text-foreground">{step.label}</span>
            <span className="type-body text-muted-foreground">{step.detail}</span>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
