import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { site } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, priority: 1 },
    { url: `${site.url}/resume`, priority: 0.8 },
    ...projects.map((p) => ({
      url: `${site.url}/project/${p.slug}`,
      priority: 0.7,
    })),
  ];
}
