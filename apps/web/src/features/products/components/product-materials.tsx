import type { CatalogMaterialRecord } from "@pergon/catalog";

import { Container } from "@pergon/ui/components/container";
import { EmptyState } from "@pergon/ui/components/empty-state";
import { Section } from "@pergon/ui/components/section";
import { Separator } from "@pergon/ui/components/separator";

type ProductMaterialsProps = {
  compatible: CatalogMaterialRecord[];
  incompatible: CatalogMaterialRecord[];
};

function MaterialList({
  title,
  items,
  emptyTitle,
}: {
  title: string;
  items: CatalogMaterialRecord[];
  emptyTitle: string;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-foreground text-lg font-semibold tracking-tight">{title}</h3>
      {items.length === 0 ? (
        <EmptyState title={emptyTitle} className="items-start px-0 py-6 text-left" />
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="space-y-1">
              <p className="text-foreground text-sm font-medium">{item.name}</p>
              {item.note ? (
                <p className="text-muted-foreground text-xs leading-relaxed">{item.note}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ProductMaterials({ compatible, incompatible }: ProductMaterialsProps) {
  return (
    <div className="bg-panel">
      <Container size="lg" asChild>
        <Section
          title="Materiales"
          description="Compatibilidad real del producto. Lo no listado no se inventa."
        >
          <div className="grid gap-10 md:grid-cols-2">
            <MaterialList
              title="Materiales compatibles"
              items={compatible}
              emptyTitle="Sin materiales compatibles publicados"
            />
            <Separator className="md:hidden" />
            <MaterialList
              title="Materiales no compatibles"
              items={incompatible}
              emptyTitle="Sin materiales incompatibles publicados"
            />
          </div>
        </Section>
      </Container>
    </div>
  );
}
