"use client";

import Link from "next/link";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useRef, type MouseEvent } from "react";

import type { CmsFeaturedProductItem, CmsFeaturedProductsSection } from "@pergon/cms";
import { Button } from "@pergon/ui/components/button";
import { Container } from "@pergon/ui/components/container";
import { cn } from "@pergon/ui/lib/utils";

import { BlockMedia } from "./block-media";
import { SectionReveal } from "./section-reveal";

const EASE = [0.16, 1, 0.3, 1] as const;

function TiltFrame({
  children,
  reduce,
  className,
}: {
  children: React.ReactNode;
  reduce: boolean | null;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), {
    stiffness: 120,
    damping: 18,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), {
    stiffness: 120,
    damping: 18,
  });

  function onMove(event: MouseEvent<HTMLDivElement>) {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((event.clientX - rect.left) / rect.width - 0.5);
    y.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      className={cn("relative [perspective:1200px]", className)}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={reduce ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
    >
      <div className="shadow-pergon-depth relative overflow-hidden rounded-xl border border-white/10">
        {children}
        <div
          className="from-signal/10 to-cyan/10 pointer-events-none absolute inset-0 bg-gradient-to-tr via-transparent"
          aria-hidden
        />
      </div>
    </motion.div>
  );
}

function FeaturedProduct({
  item,
  index,
  reduce,
}: {
  item: CmsFeaturedProductItem;
  index: number;
  reduce: boolean | null;
}) {
  const reverse = index % 2 === 1;

  return (
    <motion.article
      id={item.id}
      className="chapter-viewport border-border/60 scroll-mt-24 border-t"
      initial={reduce ? false : { opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.55, ease: EASE }}
    >
      <div
        className={cn(
          "grid items-center gap-10 lg:gap-16 xl:gap-24",
          "lg:grid-cols-2",
          reverse && "lg:[&>*:first-child]:order-2",
        )}
      >
        <TiltFrame reduce={reduce} className="px-4 md:px-8 lg:px-10">
          <BlockMedia
            media={item.media}
            label={item.name}
            reduce={reduce}
            aspect="portrait"
            className="lg:aspect-auto lg:min-h-[min(68vh,34rem)]"
          />
        </TiltFrame>

        <Container size="lg" className="py-12 md:py-16 lg:px-10 lg:py-20 xl:px-16">
          <div className="mx-auto max-w-md space-y-8 md:space-y-10 lg:mx-0">
            <p className="text-cyan font-mono text-xs tabular-nums tracking-[0.28em]">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h3
              className={cn(
                "text-foreground font-semibold tracking-tight",
                "text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.05]",
              )}
            >
              {item.name}
            </h3>
            <p className="text-muted-foreground text-base leading-relaxed md:text-lg">
              {item.description}
            </p>
            <p className="text-foreground text-lg font-medium tracking-tight md:text-xl">
              {item.benefit}
            </p>
            <div className="pt-2">
              <Button asChild size="lg" variant="signal">
                <Link href={item.href}>{item.ctaLabel}</Link>
              </Button>
            </div>
          </div>
        </Container>
      </div>
    </motion.article>
  );
}

/**
 * Featured Products — premium editorial blocks with tilt depth.
 */
export function FeaturedProductsSection({ content }: { content: CmsFeaturedProductsSection }) {
  const reduce = useReducedMotion();

  if (!content.enabled) return null;

  const items = [...(content.items ?? [])]
    .filter((item) => item.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (items.length === 0) return null;

  return (
    <section id={content.id} className="scroll-mt-20">
      <Container size="lg" className="chapter-gap">
        <SectionReveal>
          <div className="max-w-xl space-y-8 md:space-y-10">
            <p className="text-signal font-mono text-xs uppercase tracking-[0.28em]">Productos</p>
            <h2
              className={cn(
                "text-foreground font-semibold tracking-tight",
                "text-[clamp(2.4rem,6vw,4.25rem)] leading-[1.02]",
              )}
            >
              {content.title}
            </h2>
            {content.subtitle ? (
              <p className="text-foreground text-xl font-medium tracking-tight md:text-2xl">
                {content.subtitle}
              </p>
            ) : null}
            <p className="text-muted-foreground text-lede max-w-md">{content.description}</p>
          </div>
        </SectionReveal>
      </Container>

      <div className="border-border/60 border-b">
        {items.map((item, index) => (
          <FeaturedProduct key={item.id} item={item} index={index} reduce={reduce} />
        ))}
      </div>
    </section>
  );
}
