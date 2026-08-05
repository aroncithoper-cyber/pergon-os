import type { PublishedProductExperience } from "@pergon/catalog";
import Link from "next/link";

import { Button } from "@pergon/ui/components/button";
import { Container } from "@pergon/ui/components/container";

type ProductHeroProps = {
  product: PublishedProductExperience;
};

export function ProductHero({ product }: ProductHeroProps) {
  const { hero } = product;

  return (
    <header className="relative isolate min-h-[calc(100dvh-var(--navbar-height))] overflow-hidden">
      <div className="grid min-h-[calc(100dvh-var(--navbar-height))] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <Container
          size="lg"
          className="flex flex-col justify-center py-20 lg:max-w-none lg:px-8 xl:pl-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]"
        >
          <div className="max-w-xl space-y-10">
            <div className="space-y-4">
              <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
                PerGon · Producto
              </p>
              <p className="text-foreground text-display max-w-[12ch]">{product.name}</p>
              {hero.eyebrow ? (
                <p className="text-muted-foreground text-xs uppercase tracking-[0.16em]">
                  {hero.eyebrow}
                </p>
              ) : null}
            </div>
            <div className="space-y-5">
              <h1 className="text-foreground max-w-[22ch] text-2xl font-semibold tracking-tight sm:text-3xl">
                {hero.headline}
              </h1>
              {hero.support ? (
                <p className="text-muted-foreground text-lede max-w-md">{hero.support}</p>
              ) : null}
            </div>
            {(hero.primaryCta || hero.secondaryCta) && (
              <div className="flex flex-wrap items-center gap-3">
                {hero.primaryCta ? (
                  <Button asChild size="lg">
                    <Link href={hero.primaryCta.href}>{hero.primaryCta.label}</Link>
                  </Button>
                ) : null}
                {hero.secondaryCta ? (
                  <Button asChild size="lg" variant="outline">
                    <Link href={hero.secondaryCta.href}>{hero.secondaryCta.label}</Link>
                  </Button>
                ) : null}
              </div>
            )}
          </div>
        </Container>

        <aside
          className="border-border relative flex min-h-[24rem] items-end border-t lg:min-h-full lg:border-l lg:border-t-0"
          aria-label="Visual principal del producto"
        >
          {hero.media?.publicUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={hero.media.publicUrl}
              alt={hero.media.altText ?? product.name}
              className="absolute inset-0 size-full object-cover"
              fetchPriority="high"
            />
          ) : (
            <div className="surface-stage absolute inset-0" />
          )}
          {!hero.media?.publicUrl ? (
            <div className="relative z-10 flex w-full flex-col justify-end gap-3 p-8 sm:p-10 lg:p-14">
              <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
                Plano visual
              </p>
              <p className="text-foreground max-w-sm text-sm leading-relaxed">
                Imagen o escena full-bleed publicada desde Admin. Tecnología visible, no vitrina
                genérica.
              </p>
            </div>
          ) : null}
        </aside>
      </div>
    </header>
  );
}
