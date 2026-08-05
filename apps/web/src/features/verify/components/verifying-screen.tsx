"use client";

import { motion, useReducedMotion } from "framer-motion";

import { LoadingSpinner } from "@pergon/ui/components/loading";

type VerifyingScreenProps = {
  passportId: string;
};

export function VerifyingScreen({ passportId }: VerifyingScreenProps) {
  const reduce = useReducedMotion();

  return (
    <section
      className="surface-solemn flex min-h-[70dvh] flex-col items-center justify-center px-6 py-24 text-center"
      aria-busy="true"
      aria-live="polite"
    >
      <motion.div
        className="flex max-w-md flex-col items-center gap-10"
        initial={reduce ? false : { y: 10 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="border-border flex size-16 items-center justify-center rounded-full border">
          <LoadingSpinner className="text-foreground size-6" aria-label="Verificando" />
        </div>

        <div className="space-y-4">
          <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
            Verificación institucional
          </p>
          <p className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
            Consultando autenticidad
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Validando el Pasaporte Digital y registrando el escaneo en PerGon OS.
          </p>
          <p className="text-muted-foreground font-mono text-xs tracking-wide">{passportId}</p>
        </div>
      </motion.div>
    </section>
  );
}
