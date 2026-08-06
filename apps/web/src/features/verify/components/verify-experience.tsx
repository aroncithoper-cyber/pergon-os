"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import type { PublicVerificationResult } from "@pergon/identity";

import { Button } from "@pergon/ui/components/button";
import { Container } from "@pergon/ui/components/container";
import { ErrorState } from "@pergon/ui/components/error-state";
import { Separator } from "@pergon/ui/components/separator";

import { VerifyActions } from "./verify-actions";
import { VerifyInfoPanel } from "./verify-info-panel";
import { VerifyResultHeader } from "./verify-result-header";
import { VerifyTimeline } from "./verify-timeline";
import { VerifyingScreen } from "./verifying-screen";
import { fetchPublicVerification, type VerifyPhase } from "../lib/presentation";

type VerifyExperienceProps = {
  passportId: string;
};

/** Stripe Identity–like institutional verification document. */
export function VerifyExperience({ passportId }: VerifyExperienceProps) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<VerifyPhase>("verifying");
  const [data, setData] = useState<PublicVerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const result = await fetchPublicVerification(passportId);
        if (cancelled) return;
        setData(result);
        setPhase("result");
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Error de verificación");
        setPhase("error");
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [passportId]);

  if (phase === "verifying") {
    return <VerifyingScreen passportId={passportId} />;
  }

  if (phase === "error") {
    return (
      <Container size="sm" className="py-24">
        <ErrorState
          title="Verificación interrumpida"
          description={error}
          action={
            <Button asChild variant="outline">
              <Link href={`/verify/${encodeURIComponent(passportId)}`}>Reintentar</Link>
            </Button>
          }
        />
      </Container>
    );
  }

  if (!data) {
    return <VerifyingScreen passportId={passportId} />;
  }

  const showDetail = data.passport !== null;

  return (
    <div className="bg-background relative min-h-[calc(100dvh-var(--navbar-height))]">
      <Container size="md" className="relative z-10 py-16 sm:py-20">
        <motion.article
          className="border-border bg-panel/30 overflow-hidden rounded-lg border"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          aria-label="Dictamen de verificación"
        >
          <div className="border-border flex items-center justify-between gap-4 border-b px-6 py-4 sm:px-10">
            <div>
              <p className="type-label text-signal">Documento de verificación</p>
              <p className="type-caption text-muted-foreground mt-1">
                PerGon OS · lectura pública mínima
              </p>
            </div>
            <p className="type-caption text-muted-foreground hidden font-mono sm:block">VERIFY</p>
          </div>

          <div className="space-y-12 p-6 sm:p-10">
            <VerifyResultHeader
              outcome={data.outcome}
              publicId={data.passport?.publicId}
              state={data.passport?.state}
            />

            {showDetail && data.passport ? (
              <>
                <VerifyInfoPanel passport={data.passport} />
                <Separator />
                <VerifyTimeline items={data.passport.timeline} />
                <Separator />
                <VerifyActions />
              </>
            ) : (
              <VerifyActions />
            )}
          </div>

          <div className="border-border bg-background/60 border-t px-6 py-3 sm:px-10">
            <p className="type-caption text-muted-foreground">
              La autenticidad depende de la respuesta del servidor. No confíe en capturas offline.
            </p>
          </div>
        </motion.article>
      </Container>
    </div>
  );
}
