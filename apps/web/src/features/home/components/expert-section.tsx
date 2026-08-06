"use client";

import Link from "next/link";
import { useReducedMotion } from "framer-motion";

import type { CmsExpertSection } from "@pergon/cms";
import { Button } from "@pergon/ui/components/button";
import { Container } from "@pergon/ui/components/container";

import { BlockMedia } from "./block-media";
import { SectionReveal } from "./section-reveal";

/** PerGon Expert — editorial Home block (no chat, no sticker chrome). */
export function ExpertSection({ content }: { content: CmsExpertSection }) {
  const reduce = useReducedMotion();

  if (!content.enabled) return null;

  const description = content.description?.trim() || content.body?.trim() || "";
  const hasSecondary =
    Boolean(content.secondaryCta?.label?.trim()) && Boolean(content.secondaryCta?.href?.trim());

  return (
    <section id={content.id} className="scroll-mt-20">
      <Container size="lg" className="chapter-gap">
        <SectionReveal>
          <div className="grid gap-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-20">
            <div className="type-voice max-w-2xl">
              <p className="type-label text-signal">PerGon Expert</p>
              <h2 className="type-display-xl text-foreground text-balance">{content.title}</h2>
              {content.subtitle ? (
                <p className="type-h2 text-foreground font-medium">{content.subtitle}</p>
              ) : null}
              {description ? (
                <p className="type-lead text-muted-foreground">{description}</p>
              ) : null}
              <div className="flex flex-wrap items-center gap-5 pt-1">
                <Button asChild size="lg" variant="signal">
                  <Link href={content.primaryCta.href}>{content.primaryCta.label}</Link>
                </Button>
                {hasSecondary ? (
                  <Link
                    href={content.secondaryCta!.href}
                    className="type-small text-muted-foreground hover:text-foreground underline-offset-[6px] transition-colors hover:underline"
                  >
                    {content.secondaryCta!.label}
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="border-border overflow-hidden border">
              <BlockMedia
                media={content.media}
                label={content.title}
                reduce={reduce}
                aspect="wide"
              />
            </div>
          </div>
        </SectionReveal>
      </Container>
    </section>
  );
}
