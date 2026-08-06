"use client";

import { cn } from "@pergon/ui/lib/utils";

/** Living stage backdrop — signal/cyan light + noise. Purely visual. */
export function AtmosphereLayer({ className }: { className?: string }) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden
    >
      <div className="animate-aurora absolute -left-1/4 -top-1/4 size-[70%] rounded-full bg-[radial-gradient(circle,hsl(var(--signal)/0.22),transparent_65%)] blur-3xl" />
      <div className="animate-aurora absolute -bottom-1/4 -right-1/4 size-[65%] rounded-full bg-[radial-gradient(circle,hsl(var(--cyan)/0.16),transparent_60%)] blur-3xl [animation-delay:2s]" />
      <div className="from-background to-background absolute inset-0 bg-gradient-to-b via-transparent" />
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "180px 180px",
        }}
      />
    </div>
  );
}
