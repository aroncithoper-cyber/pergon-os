"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionStyle,
} from "framer-motion";
import { ChevronDown } from "lucide-react";

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
      <div className="animate-aurora absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,hsl(var(--signal)/0.25),transparent_55%)]" />
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
      initial={reduce ? false : { opacity: 0, y: 28, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.7, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Hero Viewer — full-viewport cinematic identity stage.
 * Consumes published CMS hero only. No hardcoded copy.
 */
export function HomeHero({ content }: { content: CmsHeroSection }) {
  const reduce = useReducedMotion();
  const stageRef = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 40, damping: 18 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 18 });
  const glare = useMotionTemplate`radial-gradient(520px circle at ${springX}px ${springY}px, hsl(var(--signal) / 0.18), transparent 55%)`;

  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start start", "end start"],
  });
  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1.06, 1.14]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!content.enabled) return null;

  const hasSecondary =
    Boolean(content.secondaryCta?.label?.trim()) && Boolean(content.secondaryCta?.href?.trim());

  const mediaStyle: MotionStyle | undefined = reduce ? undefined : { y: mediaY, scale: mediaScale };

  return (
    <header
      ref={stageRef}
      className="relative isolate min-h-[100dvh] overflow-hidden"
      onMouseMove={(event) => {
        if (reduce) return;
        const rect = event.currentTarget.getBoundingClientRect();
        mouseX.set(event.clientX - rect.left);
        mouseY.set(event.clientY - rect.top);
      }}
    >
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={mediaStyle}
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: EASE_OUT }}
      >
        <div className="absolute inset-0 scale-[1.05]">
          <HeroVisual content={content} reduceMotion={reduce} />
        </div>
      </motion.div>

      {/* Depth overlays */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0",
          "from-background via-background/80 to-background/20 bg-gradient-to-t",
          "md:from-background md:via-background/75 md:bg-gradient-to-r md:to-transparent",
        )}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,hsl(var(--background)/0.55)_100%)]"
        aria-hidden
      />
      {!reduce && mounted ? (
        <motion.div
          className="pointer-events-none absolute inset-0 mix-blend-screen"
          style={{ background: glare }}
          aria-hidden
        />
      ) : null}

      <motion.div
        className="relative z-10 flex min-h-[100dvh] flex-col"
        style={reduce ? undefined : { opacity: copyOpacity }}
      >
        <div
          className={cn(
            "flex flex-1 flex-col",
            "justify-end px-6 pb-24 pt-28",
            "md:justify-center md:px-10 md:pb-28 md:pt-20",
            "lg:max-w-[min(44rem,50%)] lg:px-12 xl:px-16",
            "xl:pl-[max(4rem,calc((100vw-80rem)/2+2rem))]",
          )}
        >
          <div className="flex max-w-2xl flex-col gap-8 md:gap-10 lg:gap-12">
            <Reveal reduce={reduce} delay={0}>
              <p className="text-editorial text-foreground drop-shadow-[0_8px_40px_hsl(var(--background)/0.55)]">
                {content.brand}
              </p>
            </Reveal>

            <div className="space-y-6 md:space-y-7">
              <Reveal reduce={reduce} delay={0.08}>
                <h1
                  className={cn(
                    "text-foreground max-w-[18ch] font-semibold tracking-tight",
                    "text-[clamp(1.85rem,5.2vw,3.4rem)] leading-[1.05]",
                    "md:max-w-[20ch]",
                    "lg:text-[clamp(2.4rem,3vw,3.75rem)]",
                  )}
                >
                  {content.title}
                </h1>
              </Reveal>

              <Reveal reduce={reduce} delay={0.14}>
                <p
                  className={cn(
                    "text-muted-foreground max-w-[36ch] text-base leading-relaxed",
                    "md:max-w-lg md:text-lg",
                    "lg:text-lede lg:max-w-[38ch]",
                  )}
                >
                  {content.subtitle}
                </p>
              </Reveal>
            </div>

            <Reveal reduce={reduce} delay={0.2}>
              <div className="flex flex-wrap items-center gap-3 pt-1 md:gap-4">
                <Button
                  asChild
                  size="lg"
                  variant="signal"
                  className="shadow-pergon-signal min-w-[10rem]"
                >
                  <Link href={content.primaryCta.href}>{content.primaryCta.label}</Link>
                </Button>
                {hasSecondary ? (
                  <Button asChild size="lg" variant="outline" className="min-w-[10rem]">
                    <Link href={content.secondaryCta!.href}>{content.secondaryCta!.label}</Link>
                  </Button>
                ) : null}
              </div>
            </Reveal>
          </div>
        </div>

        {!reduce ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
            <div
              className="text-muted-foreground animate-scroll-cue flex flex-col items-center gap-2 text-[10px] uppercase tracking-[0.28em]"
              aria-hidden
            >
              <span>Scroll</span>
              <ChevronDown className="size-4 opacity-70" />
            </div>
          </div>
        ) : null}
      </motion.div>
    </header>
  );
}
