"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import type { CmsTechnologySection } from "@pergon/cms";
import { Button } from "@pergon/ui/components/button";
import { Container } from "@pergon/ui/components/container";
import { cn } from "@pergon/ui/lib/utils";

import { SectionReveal } from "./section-reveal";

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
 * Technology block — editorial Home section after Hero.
 * Consumes CMS technology payload only. No SaaS cards or dashboards.
 */
export function TechnologySection({ content }: { content: CmsTechnologySection }) {
  const reduce = useReducedMotion();

  if (!content.enabled) return null;

  const hasSecondary =
    Boolean(content.secondaryCta?.label?.trim()) && Boolean(content.secondaryCta?.href?.trim());

  return (
    <section id={content.id} className="border-border scroll-mt-20 border-t">
      {/* Intro — editorial hierarchy, generous air */}
      <Container size="lg" className="chapter-gap">
        <SectionReveal>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-20 xl:gap-28">
            <div className="max-w-xl space-y-8 md:space-y-10">
              <p className="text-muted-foreground font-mono text-xs uppercase tracking-[0.2em]">
                Tecnología
              </p>
              <h2
                className={cn(
                  "text-foreground font-semibold tracking-tight",
                  "text-[clamp(2rem,5vw,3.5rem)] leading-[1.05]",
                )}
              >
                {content.title}
              </h2>
              <p className="text-foreground text-xl font-medium tracking-tight md:text-2xl">
                {content.subtitle}
              </p>
              <p className="text-muted-foreground text-lede max-w-md">{content.description}</p>
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

      {/* Dominant media plane — same visual language as Hero */}
      <SectionReveal delay={0.04}>
        <div className="border-border border-y">
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
              <div className="grid gap-4 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:gap-8">
                <span className="text-muted-foreground font-mono text-xs tabular-nums tracking-wider">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="space-y-3 md:space-y-4">
                  <h3 className="text-foreground text-2xl font-semibold tracking-tight md:text-3xl">
                    {chapter.title}
                  </h3>
                  <p className="text-muted-foreground max-w-xl text-base leading-relaxed md:text-lg">
                    {chapter.body}
                  </p>
                </div>
              </div>
            </motion.li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
