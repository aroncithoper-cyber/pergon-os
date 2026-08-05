"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import { Button } from "@pergon/ui/components/button";
import { Container } from "@pergon/ui/components/container";
import { PassportBadge } from "@pergon/ui/components/passport-badge";
import { QrViewer } from "@pergon/ui/components/qr-viewer";

import { heroContent } from "../content";

function QrMark() {
  return (
    <svg viewBox="0 0 120 120" className="text-foreground size-full" aria-hidden="true">
      <rect x="8" y="8" width="28" height="28" fill="currentColor" />
      <rect x="14" y="14" width="16" height="16" fill="hsl(var(--background))" />
      <rect x="18" y="18" width="8" height="8" fill="currentColor" />
      <rect x="84" y="8" width="28" height="28" fill="currentColor" />
      <rect x="90" y="14" width="16" height="16" fill="hsl(var(--background))" />
      <rect x="94" y="18" width="8" height="8" fill="currentColor" />
      <rect x="8" y="84" width="28" height="28" fill="currentColor" />
      <rect x="14" y="90" width="16" height="16" fill="hsl(var(--background))" />
      <rect x="18" y="94" width="8" height="8" fill="currentColor" />
      <rect x="48" y="12" width="8" height="8" fill="currentColor" />
      <rect x="64" y="12" width="8" height="8" fill="currentColor" />
      <rect x="48" y="28" width="8" height="8" fill="currentColor" />
      <rect x="64" y="28" width="8" height="8" fill="currentColor" />
      <rect x="48" y="48" width="24" height="24" fill="currentColor" />
      <rect x="84" y="48" width="8" height="8" fill="currentColor" />
      <rect x="100" y="48" width="8" height="8" fill="currentColor" />
      <rect x="84" y="64" width="8" height="8" fill="currentColor" />
      <rect x="100" y="80" width="8" height="8" fill="currentColor" />
      <rect x="48" y="84" width="8" height="8" fill="currentColor" />
      <rect x="64" y="100" width="8" height="8" fill="currentColor" />
      <rect x="84" y="100" width="8" height="8" fill="currentColor" />
    </svg>
  );
}

export function HomeHero() {
  const reduce = useReducedMotion();

  return (
    <header className="relative isolate min-h-[calc(100dvh-var(--navbar-height))] overflow-hidden">
      <div className="grid min-h-[calc(100dvh-var(--navbar-height))] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <Container
          size="lg"
          className="flex flex-col justify-center py-20 lg:max-w-none lg:px-8 xl:pl-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]"
        >
          <motion.div
            className="max-w-xl space-y-10"
            // Never SSR with opacity:0 — if client JS fails, LCP content must stay visible.
            initial={reduce ? false : { y: 14 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-foreground text-display">{heroContent.brand}</p>
            <div className="space-y-5">
              <h1 className="text-foreground max-w-[18ch] text-2xl font-semibold tracking-tight sm:text-3xl">
                {heroContent.headline}
              </h1>
              <p className="text-muted-foreground text-lede max-w-md">{heroContent.support}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href={heroContent.primaryCta.href}>{heroContent.primaryCta.label}</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={heroContent.secondaryCta.href}>{heroContent.secondaryCta.label}</Link>
              </Button>
            </div>
          </motion.div>
        </Container>

        <motion.aside
          className="surface-stage border-border relative flex min-h-[24rem] items-stretch border-t lg:min-h-full lg:border-l lg:border-t-0"
          aria-label={heroContent.visualAlt}
          initial={reduce ? false : { opacity: 0.92 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: reduce ? 0 : 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative z-10 flex w-full flex-col justify-between gap-12 p-8 sm:p-10 lg:p-14">
            <div className="space-y-4">
              <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
                Artefacto de confianza
              </p>
              <PassportBadge publicId="PERGON-OS-HOME-V1" state="active" size="md" />
            </div>
            <div className="flex flex-wrap items-end justify-between gap-8">
              <div className="max-w-[15rem] space-y-2">
                <p className="text-foreground text-sm font-medium tracking-tight">
                  Pasaporte Digital
                </p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Identidad verificable de cada unidad. El plano visual del sistema — sin datos
                  inventados.
                </p>
              </div>
              <QrViewer alt="Marca estructural del sistema QR PerGon" size="lg" label="QR PerGon">
                <QrMark />
              </QrViewer>
            </div>
          </div>
        </motion.aside>
      </div>
    </header>
  );
}
