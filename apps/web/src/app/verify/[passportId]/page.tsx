import Link from "next/link";
import type { Metadata } from "next";

import { Button } from "@pergon/ui/components/button";
import { Navbar } from "@pergon/ui/components/navbar";

import { VerifyExperience } from "@/features/verify/components/verify-experience";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

type PageProps = {
  params: Promise<{ passportId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { passportId } = await params;
  const id = passportId.toUpperCase();
  const description =
    "Verifique la autenticidad de un producto PerGon mediante su Pasaporte Digital y sistema QR.";

  return {
    title: "Verificación de autenticidad",
    description,
    alternates: {
      canonical: `/verify/${encodeURIComponent(id)}`,
    },
    robots: {
      index: false,
      follow: true,
      nocache: true,
    },
    openGraph: {
      title: "Verificación de autenticidad · PerGon",
      description:
        "Consulta solemne del Pasaporte Digital. La autenticidad se confirma siempre en servidor.",
      type: "website",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: "PerGon OS" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Verificación de autenticidad · PerGon",
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function VerifyPassportPage({ params }: PageProps) {
  const { passportId } = await params;
  const normalized = passportId.trim().toUpperCase();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Verificación de autenticidad PerGon",
    description:
      "Experiencia pública de verificación QR y Pasaporte Digital del sistema PerGon OS.",
    isPartOf: {
      "@type": "WebSite",
      name: "PerGon OS",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="bg-background text-foreground flex min-h-dvh flex-col">
        <Navbar
          aria-label="Navegación de verificación"
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
          <VerifyExperience passportId={normalized} />
        </main>
      </div>
    </>
  );
}
