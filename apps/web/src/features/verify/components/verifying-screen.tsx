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
      className="bg-background flex min-h-[70dvh] flex-col items-center justify-center px-6 py-24 text-center"
      aria-busy="true"
      aria-live="polite"
    >
      <motion.div
        className="border-border bg-panel/30 flex max-w-md flex-col items-center gap-8 rounded-lg border p-8 md:p-10"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <LoadingSpinner className="text-signal size-5" aria-label="Verificando" />

        <div className="space-y-4">
          <p className="type-label text-signal">Verificación</p>
          <p className="type-h2 text-foreground">Consultando autenticidad</p>
          <p className="type-body text-muted-foreground">
            Validando el Pasaporte Digital y registrando el escaneo.
          </p>
          <p className="type-caption text-muted-foreground font-mono tracking-wide">{passportId}</p>
        </div>
      </motion.div>
    </section>
  );
}
