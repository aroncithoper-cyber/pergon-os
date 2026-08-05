import type { Metadata } from "next";

import { APP_NAME, getAppUrl } from "@pergon/shared";

import { HomePage } from "@/features/home/home-page";

const appUrl = getAppUrl("http://localhost:3000");

const title = `${APP_NAME} — Identidad digital y trazabilidad`;
const description =
  "PerGon OS es la plataforma de identidad digital, verificación QR, Pasaporte Digital y operación. Tecnología, confianza y trazabilidad.";

export const metadata: Metadata = {
  title: {
    absolute: title,
  },
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: appUrl,
    siteName: APP_NAME,
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${appUrl}/#website`,
      url: appUrl,
      name: APP_NAME,
      description,
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

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomePage />
    </>
  );
}
