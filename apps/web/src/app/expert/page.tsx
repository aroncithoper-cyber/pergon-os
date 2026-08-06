import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { APP_NAME, getAppUrl } from "@pergon/shared";
import { Button } from "@pergon/ui/components/button";
import { LoadingBlock } from "@pergon/ui/components/loading";
import { Navbar } from "@pergon/ui/components/navbar";

import { ExpertPanelLazy } from "@/features/expert/components/expert-panel-lazy";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

const appUrl = getAppUrl("http://localhost:3000");
const expertUrl = `${appUrl}/expert`;
const expertDescription =
  "Ingeniero técnico digital PerGon: productos, diluciones, fichas, seguridad, Pasaporte Digital y QR. No inventa fuera de la base de conocimiento.";

export const metadata: Metadata = {
  title: "PerGon Expert",
  description: expertDescription,
  alternates: { canonical: "/expert" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: APP_NAME,
    url: expertUrl,
    title: "PerGon Expert",
    description:
      "Orientación técnica de dominio PerGon con base de conocimiento administrable y proveedores de IA intercambiables.",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "PerGon Expert",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PerGon Expert",
    description: expertDescription,
    images: [DEFAULT_OG_IMAGE],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PerGon Expert",
  applicationCategory: "BusinessApplication",
  description:
    "Ingeniero técnico digital especializado en el dominio PerGon OS (productos, QR, pasaporte, documentación).",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "MXN",
  },
};

export default function ExpertPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
          actions={
            <Button asChild size="sm" variant="ghost">
              <Link href="/">Inicio</Link>
            </Button>
          }
        />
        <main id="main" className="flex-1">
          <Suspense
            fallback={<LoadingBlock label="Cargando PerGon Expert…" className="min-h-[40vh]" />}
          >
            <ExpertPanelLazy />
          </Suspense>
        </main>
      </div>
    </>
  );
}
