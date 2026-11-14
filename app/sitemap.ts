import type { MetadataRoute } from 'next';
import { liveCategories, liveTools, liveToolsInCategory, toolPath } from '@/lib/registry';
import { absoluteUrl } from '@/lib/seo';

export const dynamic = 'force-static';

/** Live tools only, lastmod = lastUpdated (PRD §9). */
export default function sitemap(): MetadataRoute.Sitemap {
  const tools = liveTools();
  const newest = (dates: string[]) => dates.sort().at(-1);

  const entries: MetadataRoute.Sitemap = [{ url: absoluteUrl('/'), lastModified: newest(tools.map((t) => t.lastUpdated)) }];

  for (const category of liveCategories()) {
    entries.push({
      url: absoluteUrl(`/${category}`),
      lastModified: newest(liveToolsInCategory(category).map((t) => t.lastUpdated)),
    });
  }
  for (const t of tools) {
    entries.push({ url: absoluteUrl(toolPath(t)), lastModified: t.lastUpdated });
  }
  return entries;
}
