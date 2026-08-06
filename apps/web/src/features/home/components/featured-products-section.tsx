"use client";

import Link from "next/link";
import { useReducedMotion } from "framer-motion";

import type { CmsFeaturedProductItem, CmsFeaturedProductsSection } from "@pergon/cms";
import { Button } from "@pergon/ui/components/button";
import { Container } from "@pergon/ui/components/container";
import { cn } from "@pergon/ui/lib/utils";

import { BlockMedia } from "./block-media";
import { SectionReveal } from "./section-reveal";

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
    <article id={item.id} className="chapter-viewport border-border/30 scroll-mt-24 border-t">
      <div
        className={cn(
          "grid items-center gap-12 lg:gap-20 xl:gap-28",
          "lg:grid-cols-2",
          reverse && "lg:[&>*:first-child]:order-2",
        )}
      >
        <div className="relative overflow-hidden">
          <BlockMedia
            media={item.media}
            label={item.name}
            reduce={reduce}
            aspect="portrait"
            className="lg:aspect-auto lg:min-h-[min(72vh,36rem)]"
          />
        </div>

        <Container size="lg" className="py-14 md:py-20 lg:px-10 lg:py-24 xl:px-12">
          <div className="type-voice mx-auto max-w-xl space-y-8 md:space-y-10 lg:mx-0 lg:max-w-lg">
            <p className="type-label text-muted-foreground tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h3 className="type-display-l text-foreground">{item.name}</h3>
            <p className="type-body-xl text-muted-foreground">{item.description}</p>
            <p className="type-h3 text-foreground font-medium tracking-tight">{item.benefit}</p>
            <div className="pt-2">
              <Button asChild size="lg" variant="signal">
                <Link href={item.href}>{item.ctaLabel}</Link>
              </Button>
            </div>
          </div>
        </Container>
      </div>
    </article>
  );
}

/** Featured Products — Tesla-like editorial nodes, no card chrome. */
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
          <div className="type-voice max-w-3xl space-y-8 md:space-y-10">
            <p className="type-label text-signal">Ecosistema</p>
            <h2 className="type-display-xl text-foreground">{content.title}</h2>
            {content.subtitle ? (
              <p className="type-h2 text-foreground font-medium">{content.subtitle}</p>
            ) : null}
            <p className="type-lead text-muted-foreground max-w-2xl">{content.description}</p>
          </div>
        </SectionReveal>
      </Container>

      <div className="border-border/30 border-b">
        {items.map((item, index) => (
          <FeaturedProduct key={item.id} item={item} index={index} reduce={reduce} />
        ))}
      </div>
    </section>
  );
}
