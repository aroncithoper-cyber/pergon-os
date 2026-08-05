import type { PublishedProductExperience } from "@pergon/catalog";

import { Container } from "@pergon/ui/components/container";
import { EmptyState } from "@pergon/ui/components/empty-state";
import { Section } from "@pergon/ui/components/section";

type ProductBeforeAfterProps = {
  data: PublishedProductExperience["beforeAfter"];
};

export function ProductBeforeAfter({ data }: ProductBeforeAfterProps) {
  const hasMedia = Boolean(data.before?.publicUrl || data.after?.publicUrl);

  return (
    <Container size="lg" asChild>
      <Section
        title="Antes y después"
        description="Evidencia visual publicada — sin recreaciones ficticias."
      >
        {!hasMedia ? (
          <EmptyState
            title="Comparativa sin publicar"
            description="Assets kind=before / kind=after se mostrarán aquí."
          />
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <figure className="border-border overflow-hidden border">
                {data.before?.publicUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={data.before.publicUrl}
                    alt={data.before.altText ?? "Antes"}
                    className="aspect-[4/3] w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="text-muted-foreground flex aspect-[4/3] items-center justify-center text-sm">
                    Antes — sin asset
                  </div>
                )}
                <figcaption className="text-muted-foreground px-3 py-2 text-xs">Antes</figcaption>
              </figure>
              <figure className="border-border overflow-hidden border">
                {data.after?.publicUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={data.after.publicUrl}
                    alt={data.after.altText ?? "Después"}
                    className="aspect-[4/3] w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="text-muted-foreground flex aspect-[4/3] items-center justify-center text-sm">
                    Después — sin asset
                  </div>
                )}
                <figcaption className="text-muted-foreground px-3 py-2 text-xs">Después</figcaption>
              </figure>
            </div>
            {data.caption ? <p className="text-muted-foreground text-sm">{data.caption}</p> : null}
          </div>
        )}
      </Section>
    </Container>
  );
}
