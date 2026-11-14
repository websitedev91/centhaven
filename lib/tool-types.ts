import type { FaqItem } from './seo';

export type ToolStatus = 'draft' | 'ready' | 'live';
export type Risk = 'green' | 'yellow' | 'red';

/** Static facts about a tool. Lives in tools/<slug>/meta.ts. */
export interface ToolMeta {
  slug: string;
  category: string;
  /** H1 / tool name, e.g. 'Freelance Hourly Rate Calculator'. */
  title: string;
  /** One line under the H1 saying what it calculates. */
  subtitle: string;
  /** <title> tag, `{Tool name} – Free Calculator | CentHaven`. */
  seoTitle: string;
  /** 140–155 characters. */
  description: string;
  keyword: string;
  longTail: readonly string[];
  risk: Risk;
  related: readonly string[];
  affiliateId?: string;
  /** Ids of /rates files used (empty for pure-maths tools). */
  rates: readonly string[];
  faqs: readonly FaqItem[];
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
