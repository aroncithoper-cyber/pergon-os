import type { MetadataRoute } from "next";

import { getAppUrl } from "@pergon/shared";

import { getCmsServices } from "@/lib/cms";

function productPathsFromHome(hrefs: string[]): string[] {
  const paths = new Set<string>();
  for (const href of hrefs) {
    try {
      const path = href.startsWith("http") ? new URL(href).pathname : href;
      const match = path.match(/^\/productos\/([^/?#]+)/);
      if (match?.[1]) paths.add(`/productos/${decodeURIComponent(match[1])}`);
    } catch {
      // ignore malformed hrefs
    }
  }
  return [...paths];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = getAppUrl("http://localhost:3000");
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    {
      url: appUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${appUrl}/expert`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  try {
    const home = await getCmsServices().getPublishedHome({ locale: "es" });
    const featured = home?.sections?.find((s) => s.type === "featured_products");
    const hrefs =
      featured && featured.type === "featured_products"
        ? featured.items.filter((i) => i.enabled).map((i) => i.href)
        : [];
    for (const path of productPathsFromHome(hrefs)) {
      entries.push({
        url: `${appUrl}${path}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch {
    // Sitemap must not fail the build if CMS is unreachable.
  }

  return entries;
}
