"use client";

import { motion, useReducedMotion } from "framer-motion";

import { PassportBadge } from "@pergon/ui/components/passport-badge";
import { StatusBadge } from "@pergon/ui/components/status-badge";
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
      className="space-y-8"
      initial={reduce ? false : { y: 10 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="space-y-4">
        <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
          Verificación PerGon
        </p>
        <h1 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
          {copy.title}
        </h1>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          {publicId ? <PassportBadge publicId={publicId} state={state ?? undefined} /> : null}
          <StatusBadge status={copy.status} label={copy.title} />
        </div>
      </div>

      <div className="border-border border-y py-6">
        <p className="text-muted-foreground text-xs uppercase tracking-[0.16em]">Dictamen</p>
        <p className="text-foreground mt-3 max-w-2xl text-base leading-relaxed">
          {copy.description}
        </p>
      </div>
    </motion.header>
  );
}
