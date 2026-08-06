"use client";

import { motion, useReducedMotion } from "framer-motion";

import { Container } from "@pergon/ui/components/container";
import { cn } from "@pergon/ui/lib/utils";

const INDICATORS = [
  "Procesos",
  "Verificación",
  "Ingeniería",
  "Precisión",
  "Trazabilidad",
  "Normativa",
] as const;

/** Trust criteria — typographic strip, no icon sticker chrome. */
export function TrustIndicators({ className }: { className?: string }) {
  const reduce = useReducedMotion();

  return (
    <div className={cn("border-border/40 border-y", className)}>
      <Container size="lg" className="py-12 md:py-14">
        <p className="type-label text-muted-foreground mb-8 text-center">Criterios de confianza</p>
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 md:gap-x-12">
          {INDICATORS.map((label, index) => (
            <motion.li
              key={label}
              className="type-caption text-foreground/80"
              initial={reduce ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.03, duration: 0.3 }}
            >
              {label}
            </motion.li>
          ))}
        </ul>
      </Container>
    </div>
  );
}
