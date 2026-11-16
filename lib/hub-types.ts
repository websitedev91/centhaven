import type { FaqItem } from './seo';

/**
 * A category hub page (DESIGN.md §9). Lives in hubs/<category>/meta.ts.
 * The SEO fields are copied EXACTLY from the hub's entry in docs/seo/keyword-map.md
 * ("Category hub pages"); lib/seo.test.ts fails if they drift.
 */
export interface HubMeta {
  /** Category slug, e.g. 'freelance'. */
  slug: string;
  primaryKeyword: string;
  secondaryKeywords: readonly string[];
  /** Keyword map "Title": the <title> tag, ≤ 60 characters. */
  title: string;
  /** Keyword map "Meta description": 140–160 characters. */
  description: string;
  /** Keyword map "H1". */
  h1: string;
  /** 2–3 sentences under the H1. */
  intro: string;
  /** Optional FAQ, answers 50–80 words. */
  faq: readonly FaqItem[];
  /** ISO date the hub content was last changed. */
  lastUpdated: string;
}
