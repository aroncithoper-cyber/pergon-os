import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAppUrl } from "@pergon/shared";

import { getCatalogServices } from "@/lib/catalog";
import { ProductExperience } from "@/features/products/components/product-experience";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 120;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCatalogServices().getPublishedProductBySlug({ slug });
  const appUrl = getAppUrl("http://localhost:3000");

  if (!product) {
    return {
      title: "Producto no encontrado",
      robots: { index: false, follow: true },
    };
  }

  const canonical = `${appUrl}/productos/${product.slug}`;

  return {
    title: product.seo.title,
    description: product.seo.description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      title: product.seo.title,
      description: product.seo.description,
      url: canonical,
      images: product.seo.ogImageUrl ? [{ url: product.seo.ogImageUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.seo.title,
      description: product.seo.description,
      images: product.seo.ogImageUrl ? [product.seo.ogImageUrl] : undefined,
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getCatalogServices().getPublishedProductBySlug({ slug });

  if (!product) {
    notFound();
  }

  const appUrl = getAppUrl("http://localhost:3000");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.seo.description,
    sku: product.variants.find((v) => v.isDefault)?.sku ?? product.variants[0]?.sku,
    category: product.category?.name,
    image: product.seo.ogImageUrl ? [product.seo.ogImageUrl] : undefined,
    brand: {
      "@type": "Brand",
      name: "PerGon",
    },
    url: `${appUrl}/productos/${product.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductExperience product={product} />
    </>
  );
}
