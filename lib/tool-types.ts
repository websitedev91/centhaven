import type { FaqItem } from './seo';

export type ToolStatus = 'draft' | 'ready' | 'live';
export type Risk = 'green' | 'yellow' | 'red';

/**
 * Static facts about a tool. Lives in tools/<slug>/meta.ts.
 * The SEO fields (primaryKeyword … relatedTools) are copied EXACTLY from the tool's entry in
 * docs/seo/keyword-map.md (SEO.md §1); lib/seo.test.ts fails if they drift.
 */
export interface ToolMeta {
  slug: string;
  category: string;
  /** Keyword map: one per page, never shared with another page. */
  primaryKeyword: string;
  secondaryKeywords: readonly string[];
  /** Keyword map "Title": the <title> tag, ≤ 60 characters. */
  title: string;
  /** Keyword map "Meta description": 140–160 characters. */
  description: string;
  /** Keyword map "H1": the tool name shown on the page, in menus and in search. */
  h1: string;
  /** One line under the H1 saying what it calculates. */
  subtitle: string;
  risk: Risk;
  /** Keyword map "Internal links to", as tool slugs. Only live ones render. */
  relatedTools: readonly string[];
  affiliateId?: string;
  /**
   * Keyword-map questions first (exact text, same order), then 2–3 more. Answers live here
   * (not in content.mdx) so the visible FAQ and the FAQPage JSON-LD come from one source.
   */
  faq: readonly FaqItem[];
  /**
   * Document generators (quote, invoice). Their fields hold personal data (names, addresses,
   * bank details), so: no share link (GTM/GA4 records page URLs), no embed (no /embed page),
   * and their own Download PDF button replaces the share/print/embed row.
   */
  document?: boolean;
}

/** Registry row — PRD §5. */
export interface ToolEntry {
  slug: string;
  category: string;
  title: string;
  status: ToolStatus;
  risk: Risk;
  publishDate?: string;
  lastUpdated: string;
  reviewedBy?: string;
}

export interface RegistryRow extends ToolEntry {
  meta: ToolMeta;
}
