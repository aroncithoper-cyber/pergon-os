import type { MetadataRoute } from "next";

import { getAppUrl } from "@pergon/shared";

export default function robots(): MetadataRoute.Robots {
  const appUrl = getAppUrl("http://localhost:3000");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/preview/"],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
    host: appUrl,
  };
}
