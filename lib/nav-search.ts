/** Client-safe search over the serialised nav index (no registry import). */
export interface NavTool {
  title: string;
  href: string;
}

export interface SearchItem extends NavTool {
  category: string;
  /** Lower-case haystack: title, category, keyword, long-tail phrases. */
  terms: string;
}

/** Every word of the query must appear somewhere in the item's terms. Title matches rank first. */
export function searchTools(items: readonly SearchItem[], query: string, limit = 8): SearchItem[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return items.slice(0, limit);
  return items
    .filter((i) => words.every((w) => i.terms.includes(w)))
    .sort((a, b) => {
      const at = words.every((w) => a.title.toLowerCase().includes(w)) ? 0 : 1;
      const bt = words.every((w) => b.title.toLowerCase().includes(w)) ? 0 : 1;
      return at - bt || a.title.localeCompare(b.title);
    })
    .slice(0, limit);
}
