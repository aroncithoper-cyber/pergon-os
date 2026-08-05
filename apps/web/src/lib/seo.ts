import type { Metadata } from "next";

import { APP_NAME, getAppUrl } from "@pergon/shared";

const appUrl = getAppUrl("http://localhost:3000");

export const siteMetadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: APP_NAME,
    template: `%s · ${APP_NAME}`,
  },
  description: `${APP_NAME} — plataforma de identidad digital, trazabilidad y operación.`,
  applicationName: APP_NAME,
  authors: [{ name: APP_NAME }],
  creator: APP_NAME,
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: APP_NAME,
    title: APP_NAME,
    description: `${APP_NAME} — plataforma de identidad digital, trazabilidad y operación.`,
    url: appUrl,
  },
  twitter: {
    card: "summary",
    title: APP_NAME,
    description: `${APP_NAME} — plataforma de identidad digital, trazabilidad y operación.`,
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};
