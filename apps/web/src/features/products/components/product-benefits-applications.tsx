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
            <ol className="divide-border mx-auto max-w-3xl divide-y">
              {items.map((item, index) => (
                <li
                  key={item.id}
                  className="grid gap-3 py-8 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:gap-8"
                >
                  <p className="type-label text-muted-foreground tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <div className="space-y-3">
                    <h3 className="type-h3 text-foreground">{item.title}</h3>
                    {item.body ? (
                      <p className="type-body text-muted-foreground max-w-2xl">{item.body}</p>
                    ) : null}
                  </div>
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
