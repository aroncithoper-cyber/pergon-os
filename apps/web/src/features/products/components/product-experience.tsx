import type { PublishedProductExperience } from "@pergon/catalog";
import Link from "next/link";

import { Button } from "@pergon/ui/components/button";
import { Navbar } from "@pergon/ui/components/navbar";

import { ProductBeforeAfter } from "./product-before-after";
import { ProductApplications, ProductBenefits } from "./product-benefits-applications";
import {
  ProductCta,
  ProductDocuments,
  ProductFaq,
  ProductPerformance,
  ProductRelated,
  ProductVideos,
} from "./product-content-sections";
import { ProductDilutions } from "./product-dilutions";
import { ProductGallery } from "./product-gallery";
import { ProductHero } from "./product-hero";
import { ProductMaterials } from "./product-materials";
import { ProductModelSection } from "./product-model-section";
import { ProductVariantsPresentations } from "./product-variants-presentations";

type ProductExperienceProps = {
  product: PublishedProductExperience;
};

export function ProductExperience({ product }: ProductExperienceProps) {
  return (
    <div className="bg-background text-foreground flex min-h-dvh flex-col">
      <Navbar
        brand={
          <Link
            href="/"
            className="text-foreground focus-visible:ring-ring focus-visible:ring-offset-background rounded-sm text-lg font-semibold tracking-tight transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            PerGon
          </Link>
        }
        nav={
          product.category ? (
            <p className="text-muted-foreground hidden text-sm md:block">{product.category.name}</p>
          ) : null
        }
        actions={
          <Button asChild size="sm" variant="ghost">
            <Link href="/">Inicio</Link>
          </Button>
        }
      />
      <main id="main" className="flex-1">
        <ProductHero product={product} />
        <ProductGallery items={product.gallery} />
        {product.model3d.enabled && product.model3d.asset?.publicUrl ? (
          <ProductModelSection model={product.model3d} productName={product.name} />
        ) : null}
        <ProductBeforeAfter data={product.beforeAfter} />
        <ProductBenefits items={product.benefits} />
        <ProductApplications items={product.applications} />
        <ProductMaterials
          compatible={product.materialsCompatible}
          incompatible={product.materialsIncompatible}
        />
        <ProductDilutions dilutions={product.dilutions} calculator={product.dilutionCalculator} />
        <ProductPerformance performance={product.performance} />
        <ProductVariantsPresentations
          variants={product.variants}
          presentations={product.presentations}
        />
        <ProductDocuments
          datasheet={product.datasheet}
          safetySheet={product.safetySheet}
          documents={product.documents}
        />
        <ProductVideos videos={product.videos} />
        <ProductFaq faqs={product.faqs} />
        <ProductCta cta={product.cta} productName={product.name} productSlug={product.slug} />
        <ProductRelated items={product.related} />
      </main>
    </div>
  );
}
