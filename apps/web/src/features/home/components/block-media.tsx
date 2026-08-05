"use client";

import Image from "next/image";

import type { CmsTechnologyMedia } from "@pergon/cms";
import { cn } from "@pergon/ui/lib/utils";

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

type Aspect = "wide" | "portrait" | "hero";

const aspectClass: Record<Aspect, string> = {
  wide: "aspect-[16/9] md:aspect-[21/9]",
  portrait: "aspect-[4/5] sm:aspect-[3/4]",
  hero: "aspect-[16/9] min-h-[min(70vh,40rem)] md:aspect-auto md:min-h-[min(78vh,44rem)]",
};

/**
 * Editorial block media — image / video / quiet stage.
 * Shared by Featured Products and Expert Home sections.
 */
export function BlockMedia({
  media,
  label,
  reduce,
  aspect = "wide",
  className,
  priority,
}: {
  media: CmsTechnologyMedia;
  label: string;
  reduce: boolean | null;
  aspect?: Aspect;
  className?: string;
  priority?: boolean;
}) {
  const videoEnabled = media.enableVideo !== false;
  const imageEnabled = media.enableImage !== false;
  const videoUrl = media.videoUrl?.trim();
  const imageUrl = media.imageUrl?.trim() || media.posterUrl?.trim();
  const frame = cn("relative w-full overflow-hidden", aspectClass[aspect], className);

  if (videoEnabled && videoUrl && !reduce) {
    const provider =
      media.mode === "youtube" || media.mode === "vimeo" || media.mode === "file"
        ? media.mode
        : detectProvider(videoUrl);

    if (provider === "youtube") {
      const embed = youtubeEmbed(videoUrl, media.loop);
      if (embed) {
        return (
          <div className={frame}>
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
          <div className={frame}>
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
      <div className={frame}>
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

  const still = media.posterUrl?.trim() || imageUrl;
  if (imageEnabled && still) {
    return (
      <div className={frame}>
        <Image
          src={still}
          alt={label}
          fill
          sizes="100vw"
          className="object-cover"
          priority={priority}
        />
      </div>
    );
  }

  return <div className={cn(frame, "surface-stage")} aria-hidden />;
}
