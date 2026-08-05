"use client";

import Link from "next/link";
import { useReducedMotion } from "framer-motion";

import type { CmsExpertSection } from "@pergon/cms";
import { Button } from "@pergon/ui/components/button";
import { Container } from "@pergon/ui/components/container";
import { cn } from "@pergon/ui/lib/utils";

import { BlockMedia } from "./block-media";
import { SectionReveal } from "./section-reveal";

/**
 * PerGon Expert — editorial Home block (no chat, no conversation UI).
 * Same visual language as Hero / Technology: air, hierarchy, dominant media.
 */
export function ExpertSection({ content }: { content: CmsExpertSection }) {
  const reduce = useReducedMotion();

  if (!content.enabled) return null;

  const description = content.description?.trim() || content.body?.trim() || "";
  const hasSecondary =
    Boolean(content.secondaryCta?.label?.trim()) && Boolean(content.secondaryCta?.href?.trim());

  return (
    <section id={content.id} className="border-border scroll-mt-20 border-t">
      <Container size="lg" className="chapter-gap">
        <SectionReveal>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-20 xl:gap-28">
            <div className="max-w-xl space-y-8 md:space-y-10">
              <p className="text-muted-foreground font-mono text-xs uppercase tracking-[0.2em]">
                PerGon Expert
              </p>
              <h2
                className={cn(
                  "text-foreground font-semibold tracking-tight",
                  "text-[clamp(2rem,5vw,3.5rem)] leading-[1.05]",
                )}
              >
                {content.title}
              </h2>
              {content.subtitle ? (
                <p className="text-foreground text-xl font-medium tracking-tight md:text-2xl">
                  {content.subtitle}
                </p>
              ) : null}
              {description ? (
                <p className="text-muted-foreground text-lede max-w-md">{description}</p>
              ) : null}
              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild size="lg">
                  <Link href={content.primaryCta.href}>{content.primaryCta.label}</Link>
                </Button>
                {hasSecondary ? (
                  <Button asChild size="lg" variant="outline">
                    <Link href={content.secondaryCta!.href}>{content.secondaryCta!.label}</Link>
                  </Button>
                ) : null}
              </div>
            </div>
            <div className="hidden lg:block" aria-hidden />
          </div>
        </SectionReveal>
      </Container>

      <SectionReveal delay={0.04}>
        <div className="border-border border-y">
          <BlockMedia media={content.media} label={content.title} reduce={reduce} aspect="hero" />
        </div>
      </SectionReveal>
    </section>
  );
}
