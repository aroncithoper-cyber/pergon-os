import type { CatalogAssetRecord, CatalogFaqRecord } from "@pergon/catalog";
import Link from "next/link";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@pergon/ui/components/accordion";
import { Button } from "@pergon/ui/components/button";
import { Container } from "@pergon/ui/components/container";
import { EmptyState } from "@pergon/ui/components/empty-state";
import { Section } from "@pergon/ui/components/section";

type ProductPerformanceProps = {
  performance: Record<string, unknown>;
};

export function ProductPerformance({ performance }: ProductPerformanceProps) {
  const entries = Object.entries(performance).filter(
    ([, value]) => typeof value === "string" || typeof value === "number",
  );

  return (
    <div className="bg-panel">
      <Container size="lg" asChild>
        <Section
          title="Rendimiento"
          description="Métricas publicadas en el campo performance del producto."
        >
          {entries.length === 0 ? (
            <EmptyState
              title="Sin datos de rendimiento"
              description="Admin puede cargar claves/valores reales en performance JSON."
            />
          ) : (
            <dl className="divide-border border-border divide-y border-y">
              {entries.map(([key, value]) => (
                <div
                  key={key}
                  className="grid gap-1 py-4 sm:grid-cols-[14rem_1fr] sm:items-baseline sm:gap-6"
                >
                  <dt className="text-muted-foreground text-sm">{key}</dt>
                  <dd className="text-foreground text-sm font-medium tabular-nums">
                    {String(value)}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </Section>
      </Container>
    </div>
  );
}

type ProductDocumentsProps = {
  datasheet: CatalogAssetRecord | null;
  safetySheet: CatalogAssetRecord | null;
  documents: CatalogAssetRecord[];
};

export function ProductDocuments({ datasheet, safetySheet, documents }: ProductDocumentsProps) {
  const unique = new Map<string, CatalogAssetRecord>();
  for (const doc of documents) unique.set(doc.id, doc);
  if (datasheet) unique.set(datasheet.id, datasheet);
  if (safetySheet) unique.set(safetySheet.id, safetySheet);

  const list = [...unique.values()];

  return (
    <Container size="lg" asChild>
      <Section
        title="Documentos"
        description="Ficha técnica, hoja de seguridad y archivos publicados."
      >
        {list.length === 0 ? (
          <EmptyState
            title="Sin documentos"
            description="Assets datasheet / safety_sheet / document aparecerán con enlace real."
          />
        ) : (
          <ul className="divide-border border-border divide-y border-y">
            {list.map((doc) => (
              <li
                key={doc.id}
                className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <p className="text-foreground text-sm font-medium">{doc.title ?? doc.kind}</p>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">
                    {doc.kind}
                  </p>
                </div>
                {doc.publicUrl ? (
                  <Button asChild variant="outline" size="sm">
                    <a href={doc.publicUrl} target="_blank" rel="noreferrer">
                      Descargar
                    </a>
                  </Button>
                ) : (
                  <span className="text-muted-foreground text-xs">URL pendiente</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Section>
    </Container>
  );
}

type ProductVideosProps = {
  videos: CatalogAssetRecord[];
};

export function ProductVideos({ videos }: ProductVideosProps) {
  return (
    <div className="bg-panel">
      <Container size="lg" asChild>
        <Section title="Videos" description="Solo fuentes publicadas.">
          {videos.length === 0 ? (
            <EmptyState title="Sin videos" description="Assets kind=video se incrustan aquí." />
          ) : (
            <ul className="grid gap-6 lg:grid-cols-2">
              {videos.map((video) => (
                <li key={video.id} className="space-y-3">
                  {video.publicUrl ? (
                    <div className="border-border bg-background aspect-video overflow-hidden border">
                      <video
                        controls
                        preload="metadata"
                        className="size-full object-cover"
                        src={video.publicUrl}
                      />
                    </div>
                  ) : (
                    <div className="text-muted-foreground border-border flex aspect-video items-center justify-center border border-dashed text-sm">
                      Video sin URL
                    </div>
                  )}
                  {(video.title || video.caption) && (
                    <p className="text-sm font-medium">{video.title ?? video.caption}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Section>
      </Container>
    </div>
  );
}

type ProductFaqProps = {
  faqs: CatalogFaqRecord[];
};

export function ProductFaq({ faqs }: ProductFaqProps) {
  return (
    <Container size="lg" asChild>
      <Section title="FAQ" description="Preguntas administradas en catalog_faqs.">
        {faqs.length === 0 ? (
          <EmptyState title="Sin preguntas frecuentes" description="Se publican desde Admin." />
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </Section>
    </Container>
  );
}

type ProductCtaProps = {
  cta: Record<string, unknown>;
  productName: string;
  productSlug: string;
};

export function ProductCta({ cta, productName, productSlug }: ProductCtaProps) {
  const title = typeof cta.title === "string" ? cta.title : `Siguiente paso con ${productName}`;
  const body =
    typeof cta.body === "string"
      ? cta.body
      : "CTA configurable desde Admin (cta JSON). Sin promesas inventadas.";
  const primaryLabel = typeof cta.primaryLabel === "string" ? cta.primaryLabel : null;
  const primaryHref = typeof cta.primaryHref === "string" ? cta.primaryHref : null;

  return (
    <div className="bg-panel">
      <Container size="md" asChild>
        <Section>
          <div className="space-y-8 text-center">
            <div className="space-y-4">
              <h2 className="text-foreground text-3xl font-semibold tracking-tight">{title}</h2>
              <p className="text-muted-foreground mx-auto max-w-xl text-base leading-relaxed">
                {body}
              </p>
            </div>
            {primaryLabel && primaryHref ? (
              <Button asChild size="lg">
                <Link href={primaryHref}>{primaryLabel}</Link>
              </Button>
            ) : (
              <Button asChild size="lg" variant="outline">
                <Link href={`/expert?product=${encodeURIComponent(productSlug)}`}>
                  Consultar a PerGon Expert
                </Link>
              </Button>
            )}
          </div>
        </Section>
      </Container>
    </div>
  );
}

type ProductRelatedProps = {
  items: Array<{
    slug: string;
    name: string;
    tagline: string | null;
  }>;
};

export function ProductRelated({ items }: ProductRelatedProps) {
  return (
    <Container size="lg" asChild>
      <Section title="Productos relacionados" description="Relaciones publicadas en catálogo.">
        {items.length === 0 ? (
          <EmptyState
            title="Sin relacionados"
            description="Se listan cuando Admin crea catalog_product_relations hacia productos published."
          />
        ) : (
          <ul className="divide-border border-border divide-y border-y">
            {items.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/productos/${item.slug}`}
                  className="hover:bg-panel/80 flex flex-col gap-1 py-6 transition-colors sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
                >
                  <span className="text-foreground text-base font-medium tracking-tight">
                    {item.name}
                  </span>
                  {item.tagline ? (
                    <span className="text-muted-foreground text-sm">{item.tagline}</span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </Container>
  );
}
