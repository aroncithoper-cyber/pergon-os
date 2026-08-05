"use client";

import dynamic from "next/dynamic";
import type { PublishedProductExperience } from "@pergon/catalog";

import { Container } from "@pergon/ui/components/container";
import { LoadingBlock } from "@pergon/ui/components/loading";
import { Section } from "@pergon/ui/components/section";

const ProductModelSlot = dynamic(
  () => import("@pergon/three").then((mod) => mod.ProductModelSlot),
  {
    ssr: false,
    loading: () => <LoadingBlock label="Preparando vista 3D…" className="min-h-[20rem]" />,
  },
);

type ProductModelSectionProps = {
  model: PublishedProductExperience["model3d"];
  productName: string;
};

export function ProductModelSection({ model, productName }: ProductModelSectionProps) {
  const url = model.asset?.publicUrl ?? null;

  return (
    <div className="bg-panel">
      <Container size="lg" asChild>
        <Section
          title="Render 3D"
          description="Presencia del producto en espacio. Solo se carga cuando hay modelo publicado."
        >
          <ProductModelSlot
            modelUrl={model.enabled ? url : null}
            alt={`Modelo 3D de ${productName}`}
          />
        </Section>
      </Container>
    </div>
  );
}
