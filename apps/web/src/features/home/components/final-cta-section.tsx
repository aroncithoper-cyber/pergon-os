"use client";

import Link from "next/link";
import { useReducedMotion } from "framer-motion";

import type { CmsCtaSection, CmsFinalCtaSection, CmsTechnologyMedia } from "@pergon/cms";
import { Button } from "@pergon/ui/components/button";
import { Container } from "@pergon/ui/components/container";
import { cn } from "@pergon/ui/lib/utils";

import { BlockMedia } from "./block-media";
import { SectionReveal } from "./section-reveal";

type CtaContent = CmsCtaSection | CmsFinalCtaSection;

const emptyMedia: CmsTechnologyMedia = {
  mode: "none",
  loop: false,
  enableVideo: false,
  enableImage: false,
};

/**
 * Final CTA — narrative close of the Home.
 * Not a banner or card: typography + air + optional elegant media.
 */
export function FinalCtaSection({ content }: { content: CtaContent }) {
  const reduce = useReducedMotion();

  if (!content.enabled) return null;

  const media = content.media ?? emptyMedia;
  const hasSecondary =
    Boolean(content.secondaryCta?.label?.trim()) && Boolean(content.secondaryCta?.href?.trim());
  const hasMedia =
    (media.enableVideo && Boolean(media.videoUrl?.trim())) ||
    (media.enableImage && Boolean(media.imageUrl?.trim() || media.posterUrl?.trim()));

  return (
    <section id={content.id} className="border-border scroll-mt-20 border-t">
      <Container size="lg" className="chapter-gap">
        <SectionReveal>
          <div className="mx-auto max-w-3xl space-y-10 text-center md:space-y-14">
            <h2
              className={cn(
                "text-foreground font-semibold tracking-tight",
                "text-[clamp(2.25rem,6vw,4rem)] leading-[1.05]",
              )}
            >
              {content.title}
            </h2>
            <p className="text-muted-foreground text-lede mx-auto max-w-xl">{content.body}</p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
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
        </SectionReveal>
      </Container>

      {hasMedia ? (
        <SectionReveal delay={0.05}>
          <div className="border-border border-y">
            <BlockMedia media={media} label={content.title} reduce={reduce} aspect="hero" />
          </div>
        </SectionReveal>
      ) : null}
    </section>
  );
}
