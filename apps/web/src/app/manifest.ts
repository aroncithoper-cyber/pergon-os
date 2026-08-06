import type { MetadataRoute } from "next";

import { APP_NAME } from "@pergon/shared";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: "PerGon",
    description:
      "Plataforma de identidad digital, verificación QR, Pasaporte Digital y trazabilidad.",
    start_url: "/",
    display: "standalone",
    background_color: "#0B0D12",
    theme_color: "#0B0D12",
    lang: "es-MX",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
