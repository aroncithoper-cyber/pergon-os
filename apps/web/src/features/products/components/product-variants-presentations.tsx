import type { CatalogPresentationRecord, CatalogVariantRecord } from "@pergon/catalog";

import { Container } from "@pergon/ui/components/container";
import { EmptyState } from "@pergon/ui/components/empty-state";
import { Section } from "@pergon/ui/components/section";

type ProductVariantsPresentationsProps = {
  variants: CatalogVariantRecord[];
  presentations: CatalogPresentationRecord[];
};

export function ProductVariantsPresentations({
  variants,
  presentations,
}: ProductVariantsPresentationsProps) {
  return (
    <Container size="lg" asChild>
      <Section
        title="Variantes y presentaciones"
        description="Arquitectura de oferta editable sin desplegar código."
      >
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-foreground text-lg font-semibold tracking-tight">Variantes</h3>
            {variants.length === 0 ? (
              <EmptyState
                title="Sin variantes publicadas"
                className="items-start px-0 py-6 text-left"
              />
            ) : (
              <ul className="divide-border border-border divide-y border-y">
                {variants.map((variant) => (
                  <li key={variant.id} className="space-y-1 py-4">
                    <p className="text-foreground text-sm font-medium">{variant.name}</p>
                    {variant.sku ? (
                      <p className="text-muted-foreground font-mono text-xs">{variant.sku}</p>
                    ) : null}
                    {variant.summary ? (
                      <p className="text-muted-foreground text-sm">{variant.summary}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="space-y-4">
            <h3 className="text-foreground text-lg font-semibold tracking-tight">Presentaciones</h3>
            {presentations.length === 0 ? (
              <EmptyState
                title="Sin presentaciones publicadas"
                className="items-start px-0 py-6 text-left"
              />
            ) : (
              <ul className="divide-border border-border divide-y border-y">
                {presentations.map((item) => (
                  <li key={item.id} className="space-y-1 py-4">
                    <p className="text-foreground text-sm font-medium">{item.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {[item.volumeLabel, item.netContent, item.sku].filter(Boolean).join(" · ")}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Section>
    </Container>
  );
}
