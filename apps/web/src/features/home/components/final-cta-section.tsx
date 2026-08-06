"use client";

import Link from "next/link";

import type { CmsCtaSection, CmsFinalCtaSection, CmsTechnologyMedia } from "@pergon/cms";
import { Button } from "@pergon/ui/components/button";
import { Container } from "@pergon/ui/components/container";
import { useReducedMotion } from "framer-motion";

import { BlockMedia } from "./block-media";
import { SectionReveal } from "./section-reveal";

type CtaContent = CmsCtaSection | CmsFinalCtaSection;

const emptyMedia: CmsTechnologyMedia = {
  mode: "none",
  loop: false,
  enableVideo: false,
  enableImage: false,
};

/** Final CTA — editorial close, one primary action. */
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
    <section id={content.id} className="border-border/40 scroll-mt-20 border-t">
      <Container size="lg" className="chapter-gap">
        <SectionReveal>
          <div className="type-voice max-w-3xl">
            <h2 className="type-display-xl text-foreground text-balance">{content.title}</h2>
            <p className="type-lead text-muted-foreground">{content.body}</p>
            <div className="flex flex-wrap items-center gap-5 md:gap-7">
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
        </SectionReveal>
      </Container>

      {hasMedia ? (
        <SectionReveal delay={0.04}>
          <div className="border-border/40 border-y">
            <BlockMedia media={media} label={content.title} reduce={reduce} aspect="hero" />
          </div>
        </SectionReveal>
      ) : null}
    </section>
  );
}
