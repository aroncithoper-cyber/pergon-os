"use client";

import { motion, useReducedMotion } from "framer-motion";

import type { PublicVerificationOutcome } from "@pergon/identity";

import { outcomeCopy } from "../lib/presentation";

type VerifyResultHeaderProps = {
  outcome: PublicVerificationOutcome;
  publicId?: string | null;
  state?: string | null;
};

export function VerifyResultHeader({ outcome, publicId, state }: VerifyResultHeaderProps) {
  const reduce = useReducedMotion();
  const copy = outcomeCopy[outcome];

  return (
    <motion.header
      className="space-y-8 md:space-y-10"
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-5">
        <p className="type-label text-signal">Dictamen</p>
        <h1 className="type-display-l text-foreground text-balance">{copy.title}</h1>
        <p className="type-caption text-muted-foreground font-mono">
          {publicId ? `ID · ${publicId}` : "Sin identificador público"}
          {state ? ` · ${state}` : ""}
        </p>
      </div>

      <div className="border-border border-y py-6 md:py-8">
        <p className="type-lead text-foreground max-w-2xl">{copy.description}</p>
      </div>
    </motion.header>
  );
}
