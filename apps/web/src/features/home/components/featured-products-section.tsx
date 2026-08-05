"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import type { CmsFeaturedProductItem, CmsFeaturedProductsSection } from "@pergon/cms";
import { Button } from "@pergon/ui/components/button";
import { Container } from "@pergon/ui/components/container";
import { cn } from "@pergon/ui/lib/utils";

import { BlockMedia } from "./block-media";
import { SectionReveal } from "./section-reveal";

const EASE = [0.16, 1, 0.3, 1] as const;

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
      className="border-border scroll-mt-24 border-t"
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      <div
        className={cn(
          "grid items-center gap-10 lg:gap-16 xl:gap-24",
          "lg:grid-cols-2",
          reverse && "lg:[&>*:first-child]:order-2",
        )}
      >
        <div className="border-border lg:border-x">
          <BlockMedia
            media={item.media}
            label={item.name}
            reduce={reduce}
            aspect="portrait"
            className="lg:aspect-auto lg:min-h-[min(70vh,36rem)]"
          />
        </div>

        <Container size="lg" className="py-12 md:py-16 lg:px-10 lg:py-20 xl:px-16">
          <div className="mx-auto max-w-md space-y-8 md:space-y-10 lg:mx-0">
            <p className="text-muted-foreground font-mono text-xs tabular-nums tracking-[0.2em]">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h3
              className={cn(
                "text-foreground font-semibold tracking-tight",
                "text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.08]",
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
              <Button asChild size="lg">
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
 * Featured Products — editorial Home presentation.
 * One product at a time. No catalog grid, no SaaS cards.
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
            <p className="text-muted-foreground font-mono text-xs uppercase tracking-[0.2em]">
              Productos
            </p>
            <h2
              className={cn(
                "text-foreground font-semibold tracking-tight",
                "text-[clamp(2rem,5vw,3.5rem)] leading-[1.05]",
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

      <div className="border-border border-b">
        {items.map((item, index) => (
          <FeaturedProduct key={item.id} item={item} index={index} reduce={reduce} />
        ))}
      </div>
    </section>
  );
}
