import { describe, expect, it } from 'vitest';
import { PREVIEW_DRAFTS, isPublished, liveTools, registry } from './registry';
import { getCategory } from '@/config/site';
import { wordCount } from './seo';
import { affiliates } from './affiliates';

const ISO = /^\d{4}-\d{2}-\d{2}$/;

describe('registry integrity', () => {
  it('has unique slugs', () => {
    const slugs = registry.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  describe.each(registry.map((t) => [t.slug, t] as const))('%s', (_slug, t) => {
    it('uses a valid slug and a known category', () => {
      expect(t.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*-(calculator|generator|checker)$/);
      expect(getCategory(t.category), `unknown category ${t.category}`).toBeDefined();
      expect(t.meta.slug).toBe(t.slug);
    });

    it('has valid dates and publishing rules', () => {
      expect(t.lastUpdated).toMatch(ISO);
      if (t.status === 'live') expect(t.publishDate, 'live tools need publishDate').toMatch(ISO);
      if (t.status === 'live' && t.risk === 'red') expect(t.reviewedBy, 'red tools need reviewedBy').toBeTruthy();
    });

    it('has no "Best …" title or H1 (title/meta rules from the keyword map: lib/seo.test.ts)', () => {
      expect(t.meta.title).not.toMatch(/^best\b/i);
      expect(t.meta.h1).not.toMatch(/^best\b/i);
    });

    it('has 6–10 FAQs answered in 50–80 words, no lists', () => {
      expect(t.meta.faq.length).toBeGreaterThanOrEqual(6);
      expect(t.meta.faq.length).toBeLessThanOrEqual(10);
      for (const f of t.meta.faq) {
        const n = wordCount(f.a);
        expect(n, `"${f.q}" has ${n} words`).toBeGreaterThanOrEqual(50);
        expect(n, `"${f.q}" has ${n} words`).toBeLessThanOrEqual(80);
        expect(f.a, 'no lists inside answers').not.toMatch(/(^|\n)\s*([-*•]|\d+\.)\s/);
      }
    });

    it('references existing affiliates and tools only', () => {
      if (t.meta.affiliateId) expect(affiliates.some((a) => a.id === t.meta.affiliateId)).toBe(true);
      expect(t.meta.relatedTools.length).toBeLessThanOrEqual(6);
      expect(t.meta.relatedTools).not.toContain(t.slug);
    });
  });
});

describe('preview flag', () => {
  it('is off in normal runs, so only live tools are published', () => {
    expect(PREVIEW_DRAFTS).toBe(false);
    expect(liveTools().every((t) => t.status === 'live')).toBe(true);
    expect(isPublished({ status: 'draft' })).toBe(false);
    expect(isPublished({ status: 'ready' })).toBe(false);
    expect(isPublished({ status: 'live' })).toBe(true);
  });
});
