import type { PublishedProductExperience } from "@pergon/catalog";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@pergon/ui/components/button";
import { Container } from "@pergon/ui/components/container";

type ProductHeroProps = {
  product: PublishedProductExperience;
};

/** Tesla-like product launch: name is the hero signal. */
export function ProductHero({ product }: ProductHeroProps) {
  const { hero } = product;

  return (
    <header className="relative isolate min-h-[calc(100dvh-var(--navbar-height))] overflow-hidden">
      <div className="grid min-h-[calc(100dvh-var(--navbar-height))] lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <Container
          size="lg"
          className="flex flex-col justify-center py-16 sm:py-20 lg:max-w-none lg:px-10 xl:pl-[max(2.5rem,calc(100%-40rem+2.5rem))] xl:pr-12"
        >
          <div className="type-voice max-w-xl">
            <div className="space-y-6">
              <p className="type-label text-signal">PerGon</p>
              <h1 className="text-hero-title text-foreground">{product.name}</h1>
              {hero.eyebrow ? (
                <p className="type-caption text-muted-foreground">{hero.eyebrow}</p>
              ) : null}
            </div>
            <div className="space-y-6">
              <p className="type-h2 text-foreground max-w-[26ch] text-pretty font-medium">
                {hero.headline}
              </p>
              {hero.support ? (
                <p className="type-lead text-muted-foreground">{hero.support}</p>
              ) : null}
            </div>
            {(hero.primaryCta || hero.secondaryCta) && (
              <div className="flex flex-wrap items-center gap-5 pt-1">
                {hero.primaryCta ? (
                  <Button asChild size="lg" variant="signal">
                    <Link href={hero.primaryCta.href}>{hero.primaryCta.label}</Link>
                  </Button>
                ) : null}
                {hero.secondaryCta ? (
                  <Link
                    href={hero.secondaryCta.href}
                    className="type-small text-muted-foreground hover:text-foreground underline-offset-[6px] transition-colors hover:underline"
                  >
                    {hero.secondaryCta.label}
                  </Link>
                ) : null}
              </div>
            )}
          </div>
        </Container>

        <aside
          className="border-border relative flex min-h-[22rem] items-end border-t lg:min-h-full lg:border-l lg:border-t-0"
          aria-label="Visual principal del producto"
        >
          {hero.media?.publicUrl ? (
            <Image
              src={hero.media.publicUrl}
              alt={hero.media.altText ?? product.name}
              fill
              priority
              sizes="(max-width:1023px) 100vw, 55vw"
              className="object-cover"
            />
          ) : (
            <div className="surface-stage absolute inset-0" />
          )}
        </aside>
      </div>
    </header>
  );
}
