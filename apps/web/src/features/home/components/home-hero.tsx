"use client";

import Image from "next/image";
import Link from "next/link";
import { type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { QrCode, ShieldCheck } from "lucide-react";

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
    if (provider === "file") {
      return { kind: "file", src: videoUrl, poster };
    }
  }

  if (imageEnabled) {
    const src = media.imageUrl?.trim() || media.posterUrl?.trim();
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

function MediaFill({
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

  if (
    reduceMotion &&
    (resolved.kind === "youtube" || resolved.kind === "vimeo" || resolved.kind === "file")
  ) {
    const still = resolved.poster || imageFallback;
    if (still) {
      return (
        <Image
          src={still}
          alt={label}
          fill
          sizes="(max-width:1024px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      );
    }
  }

  if (resolved.kind === "youtube" || resolved.kind === "vimeo") {
    return (
      <>
        {resolved.poster ? (
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
      </>
    );
  }

  if (resolved.kind === "file") {
    return (
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
    );
  }

  if (resolved.kind === "image") {
    return (
      <>
        {resolved.mobileSrc ? (
          <Image
            src={resolved.mobileSrc}
            alt={label}
            fill
            priority
            sizes="100vw"
            className="object-cover md:hidden"
          />
        ) : null}
        <Image
          src={resolved.src}
          alt={label}
          fill
          priority
          sizes="(max-width:1024px) 100vw, 50vw"
          className={cn("object-cover", resolved.mobileSrc && "hidden md:block")}
        />
      </>
    );
  }

  return <div className="surface-stage absolute inset-0" aria-hidden />;
}

function Reveal({
  children,
  reduce,
  className,
}: {
  children: ReactNode;
  reduce: boolean | null;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Hero as product launch cover — quiet, brand-first, opaque artifact.
 */
export function HomeHero({ content }: { content: CmsHeroSection }) {
  const reduce = useReducedMotion();

  if (!content.enabled) return null;

  const hasSecondary =
    Boolean(content.secondaryCta?.label?.trim()) && Boolean(content.secondaryCta?.href?.trim());

  return (
    <header className="relative isolate min-h-[100dvh] overflow-x-clip pt-[var(--navbar-height)]">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="sig-universe absolute inset-0" />
        <div className="surface-stage absolute inset-0 opacity-[0.18]" />
      </div>

      <div className="layout-hero relative z-10 py-16 md:py-20 lg:py-8 xl:py-0">
        <Reveal reduce={reduce}>
          <div className="type-voice flex flex-col justify-center gap-8 md:gap-10 lg:max-w-[var(--hero-narrative-max)] lg:pr-6 xl:pr-8">
            <div className="flex flex-wrap items-center gap-3 md:gap-4">
              <p className="type-label text-signal">{content.brand}</p>
            </div>

            <h1 className="text-hero-title text-foreground">{content.title}</h1>

            <p className="type-lead text-muted-foreground max-w-xl md:max-w-2xl">
              {content.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1 md:gap-6">
              <Button asChild size="lg" variant="signal" className="min-w-[10rem]">
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
        </Reveal>

        <Reveal
          reduce={reduce}
          className="relative mx-auto w-full max-w-lg sm:max-w-xl lg:mx-0 lg:max-w-none"
        >
          <div className="sig-panel-raised relative overflow-hidden">
            <div className="relative aspect-[4/5] w-full sm:aspect-[5/6] lg:aspect-auto lg:min-h-[26rem] xl:min-h-[30rem]">
              <MediaFill content={content} reduceMotion={reduce} />
              <div
                className="from-background/90 pointer-events-none absolute inset-0 bg-gradient-to-t via-transparent to-transparent"
                aria-hidden
              />
            </div>

            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 md:p-6">
              <div className="space-y-1.5">
                <p className="type-label text-muted-foreground">Pasaporte Digital</p>
                <p className="type-small text-foreground/90 flex items-center gap-2">
                  <ShieldCheck className="text-signal size-3.5" aria-hidden />
                  Verificación server-side
                </p>
              </div>
              <div
                className="sig-icon flex size-11 items-center justify-center md:size-12"
                aria-hidden
              >
                <QrCode className="size-5 md:size-6" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </header>
  );
}
