/**
 * Small, serialisable navigation data built from the registry (live tools only), passed to
 * the client header/search so the client bundle never imports tool metadata (FAQs etc.).
 * Server-only: client code imports types and searchTools from ./nav-search instead.
 */
import { categories } from '@/config/site';
import { liveCategories, liveToolsInCategory, liveTools, toolPath } from './registry';

import type { NavTool, SearchItem } from './nav-search';

export type { NavTool, SearchItem } from './nav-search';

export interface NavCategory {
  slug: string;
  name: string;
  href: string;
  /** Up to `limit` tools, for menus. */
  tools: NavTool[];
  total: number;
}

/** Live categories in config order, each with up to `limit` live tools. */
export function navCategories(limit = 6): NavCategory[] {
  const live = new Set(liveCategories());
  return categories
    .filter((c) => live.has(c.slug))
    .map((c) => {
      const tools = liveToolsInCategory(c.slug);
      return {
        slug: c.slug,
        name: c.name,
        href: `/${c.slug}`,
        tools: tools.slice(0, limit).map((t) => ({ title: t.title, href: toolPath(t) })),
        total: tools.length,
      };
    });
}

export function searchIndex(): SearchItem[] {
  const names = new Map(categories.map((c) => [c.slug, c.name]));
  return liveTools().map((t) => {
    const category = names.get(t.category) ?? t.category;
    return {
      title: t.title,
      href: toolPath(t),
      category,
      terms: [t.title, category, t.meta.keyword, ...t.meta.longTail].join(' ').toLowerCase(),
    };
  });
}
