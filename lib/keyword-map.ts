/**
 * Parser for docs/seo/keyword-map.md (SEO.md §1). Node-only: used by tests, never by pages.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface KeywordMapEntry {
  /** e.g. '/freelance/hourly-rate-calculator', or '/freelance/' for a category hub */
  path: string;
  /** Category hub pages only: the "(hub: …)" name and the "Display name" field. */
  hub?: string;
  displayName?: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  title: string;
  /** The "(58 chars)" count written in the map, to catch stale counts. */
  titleStatedLength?: number;
  description: string;
  descriptionStatedLength?: number;
  h1: string;
  faqQuestions: string[];
  internalLinks: string[];
}

export interface KeywordMap {
  /** Rows of the summary table at the top: path → primary keyword. */
  table: { path: string; primaryKeyword: string }[];
  entries: KeywordMapEntry[];
}

export const KEYWORD_MAP_PATH = join(process.cwd(), 'docs', 'seo', 'keyword-map.md');

const field = (block: string, label: RegExp) => block.match(label)?.[1]?.trim();

function list(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function parseKeywordMap(markdown: string): KeywordMap {
  const text = markdown.replace(/\r\n/g, '\n');

  const table = [...text.matchAll(/^\|\s*(\/[^\s|]+)\s*\|\s*([^|]+?)\s*\|/gm)].map((m) => ({
    path: m[1]!,
    primaryKeyword: m[2]!,
  }));

  const entries = text
    .split(/^## (?=\/)/m)
    .slice(1)
    .map((block): KeywordMapEntry => {
      const heading = block.split('\n')[0]!.trim();
      const path = heading.split(/\s+/)[0]!;
      const hub = heading.match(/\(hub:\s*([^)]+)\)/)?.[1]?.trim();
      const displayName = field(block, /\*\*Display name:\*\*\s*(.+)/);
      const title = block.match(/\*\*Title\*\*(?:\s*\((\d+) chars\))?:\s*(.+)/);
      const meta = block.match(/\*\*Meta description\*\*(?:\s*\((\d+) chars\))?:\s*(.+)/);
      const faqStart = block.indexOf('**FAQ questions');
      const faqQuestions =
        faqStart === -1
          ? []
          : block
              .slice(faqStart)
              .split('\n')
              .slice(1)
              .filter((l, i, all) => /^\s+-\s+/.test(l) && all.slice(0, i).every((p) => /^\s+-\s+/.test(p)))
              .map((l) => l.replace(/^\s+-\s+/, '').trim());
      return {
        path,
        ...(hub ? { hub } : {}),
        ...(displayName ? { displayName } : {}),
        primaryKeyword: (field(block, /\*\*Primary keyword:\*\*\s*(.+)/) ?? '').replace(/\s*\([^)]*\/month\)\s*$/, ''),
        secondaryKeywords: list(field(block, /\*\*Secondary keywords:\*\*\s*(.+)/)),
        title: title?.[2]?.trim() ?? '',
        titleStatedLength: title?.[1] ? Number(title[1]) : undefined,
        description: meta?.[2]?.trim() ?? '',
        descriptionStatedLength: meta?.[1] ? Number(meta[1]) : undefined,
        h1: field(block, /\*\*H1:\*\*\s*(.+)/) ?? '',
        faqQuestions,
        internalLinks: list(field(block, /\*\*Internal links to:\*\*\s*(.+)/)),
      };
    });

  return { table, entries };
}

export function loadKeywordMap(): KeywordMap {
  return parseKeywordMap(readFileSync(KEYWORD_MAP_PATH, 'utf8'));
}
