/**
 * Single source of truth for every tool and its publishing status (PRD §5).
 *
 * - Only `live` tools get pages, sitemap entries and links.
 * - New tools start as `draft`; set `ready` when all quality gates pass.
 * - Never set `live` unless Puru asks. Going live = status 'live' + publishDate.
 */
import type { RegistryRow, ToolEntry, ToolMeta, ToolStatus } from './tool-types';
import { meta as hourlyRate } from '@/tools/hourly-rate-calculator/meta';

type Publishing = Pick<ToolEntry, 'status' | 'lastUpdated' | 'publishDate' | 'reviewedBy'>;

export function row(meta: ToolMeta, p: Publishing): RegistryRow {
  return { slug: meta.slug, category: meta.category, title: meta.title, risk: meta.risk, ...p, meta };
}

export const registry: readonly RegistryRow[] = [
  row(hourlyRate, { status: 'draft', lastUpdated: '2026-11-14' }),
];

export function allTools(): readonly RegistryRow[] {
  return registry;
}

export function toolsWithStatus(status: ToolStatus): RegistryRow[] {
  return registry.filter((t) => t.status === status);
}

export function liveTools(): RegistryRow[] {
  return toolsWithStatus('live');
}

export function getLiveTool(category: string, slug: string): RegistryRow | undefined {
  return registry.find((t) => t.status === 'live' && t.category === category && t.slug === slug);
}

export function getLiveToolBySlug(slug: string): RegistryRow | undefined {
  return registry.find((t) => t.status === 'live' && t.slug === slug);
}

export function liveToolsInCategory(category: string): RegistryRow[] {
  return liveTools().filter((t) => t.category === category);
}

/** Categories that have at least one live tool. */
export function liveCategories(): string[] {
  return [...new Set(liveTools().map((t) => t.category))];
}

/** Related tools that are live (CLAUDE.md: links to live tools only), max 6. */
export function liveRelated(tool: RegistryRow): RegistryRow[] {
  return tool.meta.related
    .map((slug) => getLiveToolBySlug(slug))
    .filter((t): t is RegistryRow => t !== undefined)
    .slice(0, 6);
}

export function toolPath(t: Pick<ToolEntry, 'category' | 'slug'>): string {
  return `/${t.category}/${t.slug}`;
}
