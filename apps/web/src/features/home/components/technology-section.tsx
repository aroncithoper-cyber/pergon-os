"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import type { CmsTechnologySection } from "@pergon/cms";
import { Button } from "@pergon/ui/components/button";
import { Container } from "@pergon/ui/components/container";

import { SectionReveal } from "./section-reveal";
import { TechnologyFlowDiagram } from "./technology-flow-diagram";

const EASE = [0.16, 1, 0.3, 1] as const;

function detectProvider(url: string): "youtube" | "vimeo" | "file" {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host.includes("youtu")) return "youtube";
    if (host.includes("vimeo")) return "vimeo";
  } catch {
    // ignore
  }
  return "file";
}

function youtubeEmbed(url: string, loop: boolean): string | null {
  try {
    const u = new URL(url);
    let id = "";
    if (u.hostname.includes("youtu.be")) id = u.pathname.replace(/^\//, "").split("/")[0] ?? "";
    else if (u.pathname.includes("/embed/"))
      id = u.pathname.split("/embed/")[1]?.split("/")[0] ?? "";
    else id = u.searchParams.get("v") ?? "";
    if (!id) return null;
    const params = new URLSearchParams({
      autoplay: "1",
      mute: "1",
      controls: "0",
      modestbranding: "1",
      playsinline: "1",
      rel: "0",
    });
    if (loop) {
      params.set("loop", "1");
      params.set("playlist", id);
    }
    return `https://www.youtube.com/embed/${id}?${params.toString()}`;
  } catch {
    return null;
  }
}

function vimeoEmbed(url: string, loop: boolean): string | null {
  try {
    const u = new URL(url);
    const id = u.pathname.split("/").filter(Boolean).pop();
    if (!id || !/^\d+$/.test(id)) return null;
    const params = new URLSearchParams({
      autoplay: "1",
      muted: "1",
      background: "1",
      title: "0",
      byline: "0",
      portrait: "0",
    });
    if (loop) params.set("loop", "1");
    return `https://player.vimeo.com/video/${id}?${params.toString()}`;
  } catch {
    return null;
  }
}

function TechnologyMedia({
  content,
  reduce,
}: {
  content: CmsTechnologySection;
  reduce: boolean | null;
}) {
  const { media } = content;
  const videoEnabled = media.enableVideo !== false;
  const imageEnabled = media.enableImage !== false;
  const videoUrl = media.videoUrl?.trim();
  const imageUrl = media.imageUrl?.trim() || media.posterUrl?.trim();
  const label = content.title;

  if (videoEnabled && videoUrl && !reduce) {
    const provider =
      media.mode === "youtube" || media.mode === "vimeo" || media.mode === "file"
        ? media.mode
        : detectProvider(videoUrl);

    if (provider === "youtube") {
      const embed = youtubeEmbed(videoUrl, media.loop);
      if (embed) {
        return (
          <div className="relative aspect-[16/9] w-full overflow-hidden md:aspect-[21/9]">
            {media.posterUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={media.posterUrl}
                alt=""
                aria-hidden
                className="absolute inset-0 size-full object-cover"
              />
            ) : null}
            <iframe
              title={label}
              src={embed}
              className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 border-0"
              allow="autoplay; encrypted-media"
              loading="lazy"
              tabIndex={-1}
            />
          </div>
        );
      }
    }

    if (provider === "vimeo") {
      const embed = vimeoEmbed(videoUrl, media.loop);
      if (embed) {
        return (
          <div className="relative aspect-[16/9] w-full overflow-hidden md:aspect-[21/9]">
            <iframe
              title={label}
              src={embed}
              className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 border-0"
              allow="autoplay; encrypted-media"
              loading="lazy"
              tabIndex={-1}
            />
          </div>
        );
      }
    }

    return (
      <div className="relative aspect-[16/9] w-full overflow-hidden md:aspect-[21/9]">
        <video
          className="absolute inset-0 size-full object-cover"
          src={videoUrl}
          poster={media.posterUrl}
          autoPlay
          muted
          playsInline
          loop={media.loop}
          controls={false}
          aria-label={label}
        />
      </div>
    );
  }

  // Reduced motion or image-only: still
  const still = media.posterUrl?.trim() || imageUrl;
  if (imageEnabled && still) {
    return (
      <div className="relative aspect-[16/9] w-full overflow-hidden md:aspect-[21/9]">
        <Image src={still} alt={label} fill sizes="100vw" className="object-cover" />
      </div>
    );
  }

  return (
    <div
      className="surface-stage relative aspect-[16/9] w-full overflow-hidden md:aspect-[21/9]"
      aria-hidden
    />
  );
}

/**
 * Technology block — demonstrates the verification chain.
 * CMS owns copy/media; flow diagram is presentation-only.
 */
export function TechnologySection({ content }: { content: CmsTechnologySection }) {
  const reduce = useReducedMotion();

  if (!content.enabled) return null;

  const hasSecondary =
    Boolean(content.secondaryCta?.label?.trim()) && Boolean(content.secondaryCta?.href?.trim());

  return (
    <section id={content.id} className="scroll-mt-20">
      <Container size="lg" className="chapter-gap">
        <SectionReveal>
          <div className="max-w-2xl space-y-8 md:space-y-10">
            <p className="type-label text-signal">Arquitectura</p>
            <h2 className="type-display-xl text-foreground">{content.title}</h2>
            <p className="type-h2 text-foreground font-medium">{content.subtitle}</p>
            <p className="type-lead text-muted-foreground max-w-xl">{content.description}</p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button asChild size="lg" variant="signal">
                <Link href={content.primaryCta.href}>{content.primaryCta.label}</Link>
              </Button>
              {hasSecondary ? (
                <Link
                  href={content.secondaryCta!.href}
                  className="type-small text-muted-foreground hover:text-foreground underline-offset-4 transition-colors hover:underline"
                >
                  {content.secondaryCta!.label}
                </Link>
              ) : null}
            </div>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.06}>
          <TechnologyFlowDiagram className="mt-12 md:mt-16" />
        </SectionReveal>
      </Container>

      <SectionReveal delay={0.04}>
        <div className="border-border/60 border-y">
          <TechnologyMedia content={content} reduce={reduce} />
        </div>
      </SectionReveal>

      {/* Pillars — typographic beats, not cards */}
      <Container size="lg" className="chapter-gap">
        <ol className="divide-border mx-auto max-w-3xl divide-y">
          {content.chapters.map((chapter, index) => (
            <motion.li
              key={chapter.id}
              id={chapter.id}
              className="scroll-mt-24 py-10 first:pt-0 last:pb-0 md:py-14"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.4, delay: reduce ? 0 : index * 0.05, ease: EASE }}
            >
              <div className="grid gap-4 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:gap-8 md:gap-10">
                <span className="type-label text-cyan tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="space-y-3 md:space-y-4">
                  <h3 className="type-h2 text-foreground">{chapter.title}</h3>
                  <p className="type-body-xl text-muted-foreground max-w-2xl">{chapter.body}</p>
                </div>
              </div>
            </motion.li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
