import type { Metadata, Viewport } from "next";

import { APP_NAME, getAppUrl } from "@pergon/shared";

const appUrl = getAppUrl("http://localhost:3000");

const defaultDescription = `${APP_NAME} — plataforma de identidad digital, trazabilidad y operación.`;

/** Default social / brand preview (file-based OG route). */
export const DEFAULT_OG_IMAGE = "/opengraph-image";

export const siteViewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0B0D12" },
    { media: "(prefers-color-scheme: light)", color: "#0B0D12" },
  ],
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export const siteMetadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: APP_NAME,
    template: `%s · ${APP_NAME}`,
  },
  description: defaultDescription,
  applicationName: APP_NAME,
  authors: [{ name: APP_NAME }],
  creator: APP_NAME,
  publisher: APP_NAME,
  category: "technology",
  keywords: [
    "PerGon",
    "Pasaporte Digital",
    "QR dinámico",
    "trazabilidad",
    "identidad digital",
    "verificación",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: APP_NAME,
    title: APP_NAME,
    description: defaultDescription,
    url: appUrl,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${APP_NAME} — identidad digital y trazabilidad`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: defaultDescription,
    images: [DEFAULT_OG_IMAGE],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#1E6BFF",
      },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "PerGon",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};
