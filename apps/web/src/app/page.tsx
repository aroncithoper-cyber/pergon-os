import type { Metadata } from "next";

import { APP_NAME, getAppUrl } from "@pergon/shared";
import { EmptyState } from "@pergon/ui/components/empty-state";

import { HomePage } from "@/features/home/home-page";
import { homeSeoFromPayload, loadPublishedHome } from "@/features/home/lib/load-home";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

export const revalidate = 60;

const appUrl = getAppUrl("http://localhost:3000");

export async function generateMetadata(): Promise<Metadata> {
  const payload = await loadPublishedHome("es");
  const seo = homeSeoFromPayload(payload);
  const ogImage = seo.ogImageUrl ?? DEFAULT_OG_IMAGE;
  return {
    title: { absolute: seo.title },
    description: seo.description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "es_MX",
      url: appUrl,
      siteName: APP_NAME,
      title: seo.title,
      description: seo.description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: seo.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [ogImage],
    },
    robots: { index: true, follow: true },
  };
}

export default async function Page() {
  const payload = await loadPublishedHome("es");
  const seo = homeSeoFromPayload(payload);

  if (!payload) {
    return (
      <main className="flex min-h-dvh items-center justify-center p-8">
        <EmptyState
          title="Home sin publicar"
          description="Publica el Home desde Admin → CMS → Home para activar la experiencia pública."
        />
      </main>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${appUrl}/#website`,
        url: appUrl,
        name: APP_NAME,
        description: seo.description,
        inLanguage: "es-MX",
        publisher: { "@id": `${appUrl}/#organization` },
      },
      {
        "@type": "Organization",
        "@id": `${appUrl}/#organization`,
        name: "PerGon",
        url: appUrl,
        description:
          "Plataforma tecnológica de identidad digital, trazabilidad y verificación de producto.",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomePage payload={payload} />
    </>
  );
}
