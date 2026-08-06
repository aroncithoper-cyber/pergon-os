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
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans`}>
        <a
          href="#main"
          className="bg-primary text-primary-foreground focus:ring-ring sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:rounded-md focus:px-4 focus:py-2 focus:ring-2"
        >
          Saltar al contenido
        </a>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
