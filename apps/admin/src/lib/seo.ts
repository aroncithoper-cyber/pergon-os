import type { Metadata } from "next";

import { APP_NAME, getAppUrl } from "@pergon/shared";

const appUrl = getAppUrl("http://localhost:3001");
const titleDefault = `${APP_NAME} Admin`;

export const siteMetadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: titleDefault,
    template: `%s · ${titleDefault}`,
  },
  description: `${APP_NAME} — panel operativo.`,
  applicationName: titleDefault,
  authors: [{ name: APP_NAME }],
  creator: APP_NAME,
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: titleDefault,
    title: titleDefault,
    description: `${APP_NAME} — panel operativo.`,
    url: appUrl,
  },
};
