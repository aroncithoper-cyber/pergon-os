import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { DEFAULT_LOCALE } from "@pergon/shared/constants";

import { AppProviders } from "@/components/providers";
import { siteMetadata } from "@/lib/seo";

import "@pergon/ui/globals.css";

export const metadata = siteMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={DEFAULT_LOCALE} suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable}`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
