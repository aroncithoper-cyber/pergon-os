import type { PublishedProductExperience } from "@pergon/catalog";

import { Container } from "@pergon/ui/components/container";
import { EmptyState } from "@pergon/ui/components/empty-state";
import { Section } from "@pergon/ui/components/section";

type ProductGalleryProps = {
  items: PublishedProductExperience["gallery"];
};

export function ProductGallery({ items }: ProductGalleryProps) {
  return (
    <Container size="lg" asChild>
      <Section title="Galería" description="Secuencia visual del producto publicada por Admin.">
        {items.length === 0 ? (
          <EmptyState
            title="Galería sin publicar"
            description="Las imágenes de galería aparecerán cuando existan assets kind=gallery."
          />
        ) : (
          <ul className="bg-border grid gap-px sm:grid-cols-2">
            {items.map((item) => (
              <li key={item.id} className="bg-background overflow-hidden">
                {item.publicUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.publicUrl}
                    alt={item.altText ?? item.title ?? "Imagen de producto"}
                    className="aspect-[16/10] w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="text-muted-foreground flex aspect-[16/10] items-center justify-center text-xs">
                    Asset sin URL pública
                  </div>
                )}
                {(item.caption || item.title) && (
                  <p className="type-caption text-muted-foreground px-4 py-3">
                    {item.caption ?? item.title}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Section>
    </Container>
  );
}
