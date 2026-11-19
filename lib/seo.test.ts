import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { absoluteUrl, breadcrumbJsonLd, faqJsonLd, jsonLdString, webApplicationJsonLd, wordCount } from './seo';
import { loadKeywordMap, parseKeywordMap } from './keyword-map';
import { registry, toolPath } from './registry';
import { categories, site } from '@/config/site';
import { getHub, hubs as hubMetas } from './hubs';

describe('seo helpers', () => {
  it('builds absolute urls', () => {
    expect(absoluteUrl('/')).toBe('https://centhaven.com');
    expect(absoluteUrl('/freelance/hourly-rate-calculator')).toBe('https://centhaven.com/freelance/hourly-rate-calculator');
  });

  it('builds WebApplication JSON-LD with a free offer', () => {
    const ld = webApplicationJsonLd({ name: 'X', description: 'Y', path: '/a', dateModified: '2026-11-14' });
    expect(ld['@type']).toBe('WebApplication');
    expect(ld.applicationCategory).toBe('FinanceApplication');
    expect(ld.offers.price).toBe('0');
  });

  it('builds BreadcrumbList and FAQPage JSON-LD', () => {
    const bc = breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Freelance', path: '/freelance' },
    ]);
    expect(bc.itemListElement[1]).toMatchObject({ position: 2, item: 'https://centhaven.com/freelance' });
    const faq = faqJsonLd([{ q: 'Q?', a: 'A.' }]);
    expect(faq.mainEntity[0]?.acceptedAnswer.text).toBe('A.');
  });

  it('escapes < in JSON-LD output', () => {
    expect(jsonLdString({ a: '</script>' })).not.toContain('</script>');
  });

  it('counts words', () => {
    expect(wordCount('  one two\nthree ')).toBe(3);
  });
});

/* -------------------------------------------------- keyword map (SEO.md §1.4) */

const keywordMap = loadKeywordMap();
const norm = (s: string) => s.toLowerCase().replace(/-/g, ' ').replace(/\s+/g, ' ').trim();

/** Words that don't make a heading "about" a keyword. */
const STOP = new Set(['i', 'a', 'the', 'to', 'of', 'for', 'per', 'how', 'much', 'should', 'do', 'my', 'is', 'calculator']);

/** A heading uses a keyword (or a close variant) if it has every meaningful word, matched by stem. */
function usesKeyword(heading: string, keyword: string): boolean {
  const words = norm(heading).split(/[^a-z0-9]+/).filter(Boolean);
  const stem = (w: string) => w.slice(0, 5);
  return norm(keyword)
    .split(' ')
    .filter((w) => !STOP.has(w))
    .every((k) => words.some((w) => stem(w) === stem(k)));
}

function readContent(slug: string): string {
  return readFileSync(join(process.cwd(), 'tools', slug, 'content.mdx'), 'utf8').replace(/\r\n/g, '\n');
}

/** Plain prose: no code blocks, no markdown symbols. */
function prose(mdx: string): string {
  return mdx.replace(/```[\s\S]*?```/g, ' ').replace(/[#*_`>|]/g, ' ');
}

describe('keyword map parser', () => {
  it('reads an entry', () => {
    const map = parseKeywordMap(
      [
        '| /a/b | b calculator | 10–100 |',
        '',
        '## /a/b',
        '',
        '- **Primary keyword:** b calculator (10–100/month)',
        '- **Secondary keywords:** x, y z',
        '- **Title** (5 chars): Hello',
        '- **Meta description** (3 chars): Hi.',
        '- **H1:** B Calculator',
        '- **FAQ questions (People Also Ask style):**',
        '  - One?',
        '  - Two?',
        '- **Internal links to:** /a/c, /a/d',
      ].join('\n'),
    );
    expect(map.table).toEqual([{ path: '/a/b', primaryKeyword: 'b calculator' }]);
    expect(map.entries[0]).toEqual({
      path: '/a/b',
      primaryKeyword: 'b calculator',
      secondaryKeywords: ['x', 'y z'],
      title: 'Hello',
      titleStatedLength: 5,
      description: 'Hi.',
      descriptionStatedLength: 3,
      h1: 'B Calculator',
      faqQuestions: ['One?', 'Two?'],
      internalLinks: ['/a/c', '/a/d'],
    });
  });
});

describe('keyword map integrity', () => {
  it('has an entry for every row of the summary table, with the same primary keyword', () => {
    for (const row of keywordMap.table) {
      const entry = keywordMap.entries.find((e) => e.path === row.path);
      expect(entry, `no section for ${row.path}`).toBeDefined();
      expect(entry?.primaryKeyword).toBe(row.primaryKeyword);
    }
  });

  it('never gives two pages the same primary keyword', () => {
    const seen = new Map<string, string>();
    for (const e of keywordMap.entries) {
      const k = norm(e.primaryKeyword);
      expect(seen.get(k), `"${e.primaryKeyword}" is used by ${seen.get(k)} and ${e.path}`).toBeUndefined();
      seen.set(k, e.path);
    }
  });

  it('never gives two pages the same title or meta description', () => {
    const titles = keywordMap.entries.map((e) => e.title);
    const metas = keywordMap.entries.map((e) => e.description);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(metas).size).toBe(metas.length);
  });
});

describe('category hub entries', () => {
  const hubs = keywordMap.entries.filter((e) => e.hub);

  it('parses every hub with a display name', () => {
    expect(hubs.map((h) => h.path)).toEqual(['/freelance/', '/salary/', '/business/', '/marketing/', '/personal-finance/']);
    for (const h of hubs) expect(h.displayName, h.path).toBe(h.hub);
  });

  it.each(hubs.map((h) => [h.path, h] as const))('%s keeps title ≤ 60, meta 140–160 and correct stated counts', (_p, h) => {
    expect(h.title.length).toBeLessThanOrEqual(60);
    expect(h.description.length).toBeGreaterThanOrEqual(140);
    expect(h.description.length).toBeLessThanOrEqual(160);
    expect(h.title.length).toBe(h.titleStatedLength);
    expect(h.description.length).toBe(h.descriptionStatedLength);
  });

  it('every category that has a tool has hub meta and a hub guide', () => {
    for (const cat of new Set(registry.map((t) => t.category))) {
      expect(getHub(cat), `hubs/${cat}/meta.ts missing (and register it in lib/hubs.ts)`).toBeDefined();
      expect(existsSync(join(process.cwd(), 'hubs', cat, 'content.mdx')), `hubs/${cat}/content.mdx missing`).toBe(true);
    }
  });

  describe.each(hubMetas.map((h) => [h.slug, h] as const))('hub %s', (slug, h) => {
    const entry = keywordMap.entries.find((e) => e.path === `/${slug}/`);

    it('copies title, description, H1 and keywords exactly from the keyword map', () => {
      expect(entry, `no keyword map hub entry for /${slug}/`).toBeDefined();
      expect(h.title).toBe(entry?.title);
      expect(h.description).toBe(entry?.description);
      expect(h.h1).toBe(entry?.h1);
      expect(h.primaryKeyword).toBe(entry?.primaryKeyword);
      expect([...h.secondaryKeywords]).toEqual(entry?.secondaryKeywords);
    });

    it('has a 2–3 sentence intro with the primary keyword', () => {
      const sentences = h.intro.split(/(?<=[.!?])\s+/).filter(Boolean);
      expect(sentences.length).toBeGreaterThanOrEqual(2);
      expect(sentences.length).toBeLessThanOrEqual(3);
      expect(norm(h.intro)).toContain(norm(h.primaryKeyword));
    });

    it('has a 300–500 word guide', () => {
      const words = wordCount(prose(readFileSync(join(process.cwd(), 'hubs', slug, 'content.mdx'), 'utf8')));
      expect(words).toBeGreaterThanOrEqual(300);
      expect(words).toBeLessThanOrEqual(500);
    });

    it('answers FAQs in 50–80 words, no lists', () => {
      for (const f of h.faq) {
        const n = wordCount(f.a);
        expect(n, `"${f.q}" has ${n} words`).toBeGreaterThanOrEqual(50);
        expect(n, `"${f.q}" has ${n} words`).toBeLessThanOrEqual(80);
      }
    });
  });

  it('every configured category has a hub entry, and uses its display name', () => {
    for (const c of categories) {
      const hub = hubs.find((h) => h.path === `/${c.slug}/`);
      expect(hub, `keyword map has no hub entry for /${c.slug}/`).toBeDefined();
      expect(c.name).toBe(hub?.displayName);
    }
  });
});

describe.each(registry.map((t) => [t.slug, t] as const))('SEO for %s', (slug, t) => {
  const entry = keywordMap.entries.find((e) => e.path === toolPath(t));

  it('has a keyword map entry (CLAUDE.md: no entry → stop and ask)', () => {
    expect(entry, `docs/seo/keyword-map.md has no section for ${toolPath(t)}`).toBeDefined();
  });

  if (!entry) return;

  it('copies title, description, H1 and keywords exactly from the keyword map', () => {
    expect(t.meta.title).toBe(entry.title);
    expect(t.meta.description).toBe(entry.description);
    expect(t.meta.h1).toBe(entry.h1);
    expect(t.meta.primaryKeyword).toBe(entry.primaryKeyword);
    expect([...t.meta.secondaryKeywords]).toEqual(entry.secondaryKeywords);
  });

  it('asks the keyword-map FAQ questions first, word for word', () => {
    expect(t.meta.faq.slice(0, entry.faqQuestions.length).map((f) => f.q)).toEqual(entry.faqQuestions);
  });

  it('links to the keyword-map related tools', () => {
    expect(t.meta.relatedTools.map((s) => entry.internalLinks.find((l) => l.endsWith(`/${s}`)) ?? s)).toEqual(
      entry.internalLinks,
    );
  });

  it('keeps title ≤ 60 and description 140–160 characters (and the map counts are right)', () => {
    expect(t.meta.title.length).toBeLessThanOrEqual(60);
    expect(t.meta.description.length).toBeGreaterThanOrEqual(140);
    expect(t.meta.description.length).toBeLessThanOrEqual(160);
    if (entry.titleStatedLength) expect(entry.title.length, 'stale "(N chars)" for Title').toBe(entry.titleStatedLength);
    if (entry.descriptionStatedLength)
      expect(entry.description.length, 'stale "(N chars)" for Meta description').toBe(entry.descriptionStatedLength);
  });

  it('starts the title with the primary keyword', () => {
    expect(norm(t.meta.title).startsWith(norm(t.meta.primaryKeyword))).toBe(true);
  });

  it('places keywords in the content as SEO.md §2 asks', () => {
    const mdx = readContent(slug);
    const first100 = prose(mdx).split(/\s+/).filter(Boolean).slice(0, 100).join(' ');
    expect(norm(first100), 'primary keyword in the first 100 words').toContain(norm(t.meta.primaryKeyword));

    const h2s = [...mdx.matchAll(/^## (.+)$/gm)].map((m) => m[1]!);
    const withSecondary = h2s.filter((h) => t.meta.secondaryKeywords.some((k) => usesKeyword(h, k)));
    expect(withSecondary.length, `H2s using a secondary keyword: ${JSON.stringify(withSecondary)}`).toBeGreaterThanOrEqual(2);

    const body = norm(prose(mdx));
    const repeats = body.split(norm(t.meta.primaryKeyword)).length - 1;
    expect(repeats, 'exact primary keyword used too often (stuffing)').toBeLessThanOrEqual(4);
  });

  it('has 900–1,500 words of content including the FAQ answers', () => {
    const words = wordCount(prose(readContent(slug))) + t.meta.faq.reduce((n, f) => n + wordCount(`${f.q} ${f.a}`), 0);
    expect(words).toBeGreaterThanOrEqual(900);
    expect(words).toBeLessThanOrEqual(1500);
  });
});

describe('homepage meta matches the keyword map', () => {
  const md = readFileSync(join(process.cwd(), 'docs', 'seo', 'keyword-map.md'), 'utf8');
  const section = md.split('## / (homepage)')[1]?.split(/\n#/)[0] ?? '';
  const field = (name: string) => new RegExp(`\\*\\*${name}\\*\\*(?: \\((\\d+) chars\\))?: (.+)`).exec(section);

  it('description is copied exactly, 140–160 chars, and keeps "free money calculators"', () => {
    const m = field('Meta description');
    expect(m?.[2]?.trim()).toBe(site.homeDescription);
    expect(Number(m?.[1])).toBe(site.homeDescription.length);
    expect(site.homeDescription.length).toBeGreaterThanOrEqual(140);
    expect(site.homeDescription.length).toBeLessThanOrEqual(160);
    expect(site.homeDescription.toLowerCase()).toContain('free money calculators');
  });

  it('title matches', () => {
    expect(field('Title')?.[2]?.trim()).toBe(`${site.name} – ${site.tagline}`);
  });
});
