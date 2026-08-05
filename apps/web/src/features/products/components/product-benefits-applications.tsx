import type { CatalogApplicationRecord, CatalogBenefitRecord } from "@pergon/catalog";

import { Container } from "@pergon/ui/components/container";
import { EmptyState } from "@pergon/ui/components/empty-state";
import { Section } from "@pergon/ui/components/section";

type ProductBenefitsProps = {
  items: CatalogBenefitRecord[];
};

export function ProductBenefits({ items }: ProductBenefitsProps) {
  return (
    <div className="bg-panel">
      <Container size="lg" asChild>
        <Section
          title="Capacidades"
          description="Argumentos técnicos publicados desde el catálogo."
        >
          {items.length === 0 ? (
            <EmptyState
              title="Sin beneficios publicados"
              description="Se listarán al crearlos en catálogo."
            />
          ) : (
            <ol className="grid gap-10 md:grid-cols-3">
              {items.map((item, index) => (
                <li key={item.id} className="space-y-3">
                  <p className="text-muted-foreground font-mono text-xs tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="text-foreground text-lg font-semibold tracking-tight">
                    {item.title}
                  </h3>
                  {item.body ? (
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.body}</p>
                  ) : null}
                </li>
              ))}
            </ol>
          )}
        </Section>
      </Container>
    </div>
  );
}

type ProductApplicationsProps = {
  items: CatalogApplicationRecord[];
};

export function ProductApplications({ items }: ProductApplicationsProps) {
  return (
    <Container size="lg" asChild>
      <Section title="Contextos de uso" description="Aplicaciones verificables del dominio PerGon.">
        {items.length === 0 ? (
          <EmptyState
            title="Sin aplicaciones publicadas"
            description="Admin puede añadir aplicaciones sin cambiar código."
          />
        ) : (
          <ul className="divide-border border-border divide-y border-y">
            {items.map((item) => (
              <li key={item.id} className="space-y-2 py-6">
                <h3 className="text-foreground text-base font-medium tracking-tight">
                  {item.title}
                </h3>
                {item.body ? (
                  <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">
                    {item.body}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Section>
    </Container>
  );
}
