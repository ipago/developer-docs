import type { MetadataRoute } from "next";
import { creatorsSource, devSource } from "@/lib/source";

import { DOCS_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [...creatorsSource.getPages(), ...devSource.getPages()];
  return [
    { url: DOCS_URL, changeFrequency: "weekly", priority: 1 },
    ...pages.map((p) => ({ url: `${DOCS_URL}${p.url}`, changeFrequency: "weekly" as const, priority: 0.7 })),
  ];
}
