"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionStyle } from "framer-motion";

import type { CmsHeroSection } from "@pergon/cms";
import { Button } from "@pergon/ui/components/button";
import { cn } from "@pergon/ui/lib/utils";

type ResolvedMedia =
  | { kind: "youtube" | "vimeo"; embedUrl: string; poster?: string }
  | { kind: "file"; src: string; poster?: string }
  | { kind: "image"; src: string; mobileSrc?: string }
  | { kind: "none" };

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

function youtubeEmbedUrl(url: string, loop: boolean): string | null {
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
      disablekb: "1",
      fs: "0",
      iv_load_policy: "3",
      modestbranding: "1",
      playsinline: "1",
      rel: "0",
      showinfo: "0",
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

function vimeoEmbedUrl(url: string, loop: boolean): string | null {
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
      controls: "0",
    });
    if (loop) params.set("loop", "1");
    return `https://player.vimeo.com/video/${id}?${params.toString()}`;
  } catch {
    return null;
  }
}

function detectProvider(url: string): "youtube" | "vimeo" | "file" {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host.includes("youtu")) return "youtube";
    if (host.includes("vimeo")) return "vimeo";
  } catch {
    // fall through
  }
  return "file";
}

/** Video wins when a usable video URL exists; otherwise image; else quiet stage. */
export function resolveHeroMedia(content: CmsHeroSection, preferLoop: boolean): ResolvedMedia {
  const { media } = content;
  const videoEnabled = media.enableVideo !== false;
  const imageEnabled = media.enableImage !== false;
  const videoUrl = media.videoUrl?.trim();
  const poster = media.posterUrl?.trim() || undefined;

  if (videoEnabled && videoUrl) {
    const provider =
      media.mode === "youtube" || media.mode === "vimeo" || media.mode === "file"
        ? media.mode
        : detectProvider(videoUrl);

    if (provider === "youtube") {
      const embedUrl = youtubeEmbedUrl(videoUrl, preferLoop && media.loop);
      if (embedUrl) return { kind: "youtube", embedUrl, poster };
    }
    if (provider === "vimeo") {
      const embedUrl = vimeoEmbedUrl(videoUrl, preferLoop && media.loop);
      if (embedUrl) return { kind: "vimeo", embedUrl, poster };
    }
    return { kind: "file", src: videoUrl, poster };
  }

  if (imageEnabled) {
    const src = media.imageUrl?.trim() || media.posterUrl?.trim() || media.mobileImageUrl?.trim();
    if (src) {
      return {
        kind: "image",
        src,
        mobileSrc: media.mobileImageUrl?.trim() || undefined,
      };
    }
  }

  return { kind: "none" };
}

function StillFallback({ src, alt, mobileSrc }: { src: string; alt: string; mobileSrc?: string }) {
  if (mobileSrc) {
    return (
      <div className="absolute inset-0">
        <Image
          src={mobileSrc}
          alt={alt}
          fill
          priority
          sizes="100vw"
          className="object-cover md:hidden"
        />
        <Image
          src={src}
          alt={alt}
          fill
          priority
          sizes="100vw"
          className="hidden object-cover md:block"
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      <Image src={src} alt={alt} fill priority sizes="100vw" className="object-cover" />
    </div>
  );
}

function HeroVisual({
  content,
  reduceMotion,
}: {
  content: CmsHeroSection;
  reduceMotion: boolean | null;
}) {
  const resolved = resolveHeroMedia(content, !reduceMotion);
  const label = content.visualAlt ?? content.title;
  const imageFallback =
    content.media.imageUrl?.trim() ||
    content.media.posterUrl?.trim() ||
    content.media.mobileImageUrl?.trim();

  // Reduced motion: prefer still (poster / image) over autoplaying video.
  if (
    reduceMotion &&
    (resolved.kind === "youtube" || resolved.kind === "vimeo" || resolved.kind === "file")
  ) {
    const still = resolved.kind === "file" ? resolved.poster : resolved.poster;
    const src = still || imageFallback;
    if (src) {
      return (
        <StillFallback
          src={src}
          alt={label}
          mobileSrc={content.media.mobileImageUrl?.trim() || undefined}
        />
      );
    }
  }

  if (resolved.kind === "youtube" || resolved.kind === "vimeo") {
    return (
      <div className="absolute inset-0 overflow-hidden">
        {resolved.poster ? (
          // Poster under iframe until stream paints (LCP-friendly hint).
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolved.poster}
            alt=""
            aria-hidden
            className="absolute inset-0 size-full object-cover"
          />
        ) : null}
        <iframe
          title={label}
          src={resolved.embedUrl}
          className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          loading="eager"
          tabIndex={-1}
        />
      </div>
    );
  }

  if (resolved.kind === "file") {
    return (
      <div className="absolute inset-0 overflow-hidden">
        <video
          className="absolute inset-0 size-full object-cover"
          src={resolved.src}
          poster={resolved.poster}
          autoPlay={!reduceMotion}
          muted
          playsInline
          loop={content.media.loop && !reduceMotion}
          controls={false}
          disablePictureInPicture
          aria-label={label}
        />
      </div>
    );
  }

  if (resolved.kind === "image") {
    return <StillFallback src={resolved.src} alt={label} mobileSrc={resolved.mobileSrc} />;
  }

  return (
    <div className="surface-stage absolute inset-0" aria-hidden>
      <div className="from-background via-background/40 absolute inset-0 bg-gradient-to-t to-transparent" />
    </div>
  );
}

function Reveal({
  children,
  reduce,
  delay = 0,
  className,
}: {
  children: ReactNode;
  reduce: boolean | null;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Hero Viewer — full-viewport identity stage.
 * Consumes published CMS hero only. No hardcoded copy.
 */
export function HomeHero({ content }: { content: CmsHeroSection }) {
  const reduce = useReducedMotion();
  const stageRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start start", "end start"],
  });
  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", "6%"]);

  if (!content.enabled) return null;

  const hasSecondary =
    Boolean(content.secondaryCta?.label?.trim()) && Boolean(content.secondaryCta?.href?.trim());

  const mediaStyle: MotionStyle | undefined = reduce ? undefined : { y: mediaY };

  return (
    <header
      ref={stageRef}
      className="relative isolate min-h-[calc(100dvh-var(--navbar-height))] overflow-hidden"
    >
      {/* Dominant visual plane — edge to edge */}
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={mediaStyle}
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, ease: EASE_OUT }}
      >
        <div className="absolute inset-0 scale-[1.04]">
          <HeroVisual content={content} reduceMotion={reduce} />
        </div>
      </motion.div>

      {/* Contrast veils — readable type without cards */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0",
          // Mobile: bottom-weighted veil (copy lives low)
          "from-background via-background/75 to-background/10 bg-gradient-to-t",
          // Tablet+: left-weighted editorial veil
          "md:from-background md:via-background/80 md:bg-gradient-to-r md:to-transparent",
          "lg:via-background/70",
        )}
        aria-hidden
      />
      <div
        className="from-background/40 pointer-events-none absolute inset-0 hidden bg-gradient-to-t via-transparent to-transparent md:block"
        aria-hidden
      />

      {/* Copy compositions — own layout per breakpoint */}
      <div className="relative z-10 flex min-h-[calc(100dvh-var(--navbar-height))] flex-col">
        <div
          className={cn(
            "flex flex-1 flex-col",
            // Mobile: anchor to bottom — full-bleed media above
            "justify-end px-6 pb-14 pt-24",
            // Tablet: mid-left editorial column
            "md:justify-center md:px-10 md:pb-20 md:pt-16",
            // Desktop: generous left stage, huge air
            "lg:max-w-[min(40rem,46%)] lg:px-12 xl:px-16",
            "xl:pl-[max(4rem,calc((100vw-80rem)/2+2rem))]",
          )}
        >
          <div className="flex max-w-xl flex-col gap-8 md:gap-10 lg:gap-12">
            <Reveal reduce={reduce} delay={0}>
              <p
                className={cn(
                  "text-foreground text-brand font-semibold tracking-tight",
                  "text-[clamp(2.5rem,10vw,3.75rem)] leading-[0.95]",
                  "md:text-[clamp(3.25rem,7vw,4.75rem)]",
                  "lg:text-[clamp(4rem,5.5vw,5.5rem)]",
                )}
              >
                {content.brand}
              </p>
            </Reveal>

            <div className="space-y-5 md:space-y-6">
              <Reveal reduce={reduce} delay={0.06}>
                <h1
                  className={cn(
                    "text-foreground max-w-[16ch] font-semibold tracking-tight",
                    "text-[clamp(1.625rem,5.5vw,2.25rem)] leading-[1.12]",
                    "md:max-w-[18ch] md:text-[clamp(2rem,3.8vw,2.75rem)]",
                    "lg:max-w-[14ch] lg:text-[clamp(2.25rem,2.8vw,3.25rem)]",
                  )}
                >
                  {content.title}
                </h1>
              </Reveal>

              <Reveal reduce={reduce} delay={0.1}>
                <p
                  className={cn(
                    "text-muted-foreground max-w-[34ch] text-base leading-relaxed",
                    "md:max-w-md md:text-lg md:leading-relaxed",
                    "lg:text-lede lg:max-w-[36ch]",
                  )}
                >
                  {content.subtitle}
                </p>
              </Reveal>
            </div>

            <Reveal reduce={reduce} delay={0.14}>
              <div className="flex flex-wrap items-center gap-3 pt-1 md:gap-4">
                <Button asChild size="lg" className="min-w-[9.5rem]">
                  <Link href={content.primaryCta.href}>{content.primaryCta.label}</Link>
                </Button>
                {hasSecondary ? (
                  <Button asChild size="lg" variant="outline" className="min-w-[9.5rem]">
                    <Link href={content.secondaryCta!.href}>{content.secondaryCta!.label}</Link>
                  </Button>
                ) : null}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </header>
  );
}
