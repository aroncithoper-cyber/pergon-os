"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import type { PublicVerificationResult } from "@pergon/identity";

import { Button } from "@pergon/ui/components/button";
import { Container } from "@pergon/ui/components/container";
import { ErrorState } from "@pergon/ui/components/error-state";
import { Separator } from "@pergon/ui/components/separator";

import { AtmosphereLayer } from "@/components/atmosphere-layer";

import { VerifyActions } from "./verify-actions";
import { VerifyInfoPanel } from "./verify-info-panel";
import { VerifyResultHeader } from "./verify-result-header";
import { VerifyTimeline } from "./verify-timeline";
import { VerifyingScreen } from "./verifying-screen";
import { fetchPublicVerification, type VerifyPhase } from "../lib/presentation";

type VerifyExperienceProps = {
  passportId: string;
};

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
    <div className="surface-atmosphere relative min-h-[calc(100dvh-var(--navbar-height))] overflow-hidden">
      <AtmosphereLayer />
      <Container size="md" className="relative z-10 py-16 sm:py-20">
        <motion.div
          className="glass-passport relative space-y-12 rounded-2xl p-6 sm:p-10"
          initial={reduce ? false : { y: 16, rotateX: 6, opacity: 0.01 }}
          animate={{ y: 0, rotateX: 0, opacity: 1 }}
          whileHover={reduce ? undefined : { rotateY: 1.5, rotateX: -1.5, scale: 1.005 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformStyle: "preserve-3d", perspective: 1200 }}
        >
          <div
            className="glow-cyan bg-cyan/20 pointer-events-none absolute -right-6 -top-6 size-28 rounded-full blur-3xl"
            aria-hidden
          />
          <VerifyResultHeader
            outcome={data.outcome}
            publicId={data.passport?.publicId}
            state={data.passport?.state}
          />

          {showDetail && data.passport ? (
            <>
              <VerifyInfoPanel passport={data.passport} />
              <Separator className="bg-white/10" />
              <VerifyTimeline items={data.passport.timeline} />
              <Separator className="bg-white/10" />
              <VerifyActions />
            </>
          ) : (
            <VerifyActions />
          )}
        </motion.div>
      </Container>
    </div>
  );
}
