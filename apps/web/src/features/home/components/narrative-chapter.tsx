"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@pergon/ui/lib/utils";

import type { NarrativeBeat } from "../lib/narrative-beats";

export type { NarrativeBeat, NarrativeTone } from "../lib/narrative-beats";
export { beatForSectionType } from "../lib/narrative-beats";

/**
 * Presentation-only chapter frame.
 * Does not alter CMS content — frames it as a documentary beat.
 */
export function NarrativeChapter({
  beat,
  children,
  className,
  showQuestion = true,
}: {
  beat: NarrativeBeat;
  children: ReactNode;
  className?: string;
  showQuestion?: boolean;
}) {
  const reduce = useReducedMotion();
  const n = String(beat.index).padStart(2, "0");

  return (
    <div
      data-chapter={beat.index}
      data-tone={beat.tone}
      role="region"
      aria-label={beat.question}
      className={cn(
        "relative scroll-mt-20",
        beat.tone === "void" && "bg-transparent",
        beat.tone === "stage" && "bg-carbon/25",
        beat.tone === "panel" && "bg-panel/40",
        className,
      )}
    >
      {showQuestion ? (
        <motion.div
          className="layout-section pointer-events-none absolute inset-x-0 top-8 z-20 md:top-12"
          initial={reduce ? false : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden
        >
          <div className="flex items-baseline gap-4 md:gap-6">
            <span className="type-label text-signal tabular-nums">{n}</span>
            <p className="type-small text-muted-foreground/90 max-w-xl tracking-wide">
              {beat.question}
            </p>
          </div>
        </motion.div>
      ) : null}
      <div className={cn(showQuestion && "pt-16 md:pt-20")}>{children}</div>
      <div
        className="via-border/50 pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent to-transparent"
        aria-hidden
      />
    </div>
  );
}
