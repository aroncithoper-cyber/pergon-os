import type { MetadataRoute } from "next";

import { getAppUrl } from "@pergon/shared";

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = getAppUrl("http://localhost:3000");

  return [
    {
      url: appUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${appUrl}/expert`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];
}
