import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { headingText, mdxH2s, slugify } from './headings';
import { registry } from './registry';

describe('headings', () => {
  it('slugifies headings', () => {
    expect(slugify('Freelance rate vs salary: why your rate must be higher')).toBe('freelance-rate-vs-salary-why-your-rate-must-be-higher');
    expect(slugify("Will you lose clients if you raise your rates?")).toBe('will-you-lose-clients-if-you-raise-your-rates');
    expect(slugify('Don’t forget')).toBe('dont-forget');
  });

  it('strips markdown and JSX from heading text', () => {
    expect(headingText('How the **break-even** point is `calculated`')).toBe('How the break-even point is calculated');
    expect(headingText('See <ToolLink slug="x">this</ToolLink>')).toBe('See this');
  });

  it('lists H2s outside code blocks only', () => {
    const mdx = '## One\n\ntext\n\n```text\n## not a heading\n```\n\n### Three\n\n## Two\n';
    expect(mdxH2s(mdx)).toEqual([
      { id: 'one', text: 'One' },
      { id: 'two', text: 'Two' },
    ]);
  });

  it.each(registry.map((t) => [t.slug] as const))('%s has unique H2 anchors that never clash with #faq or #sources', (slug) => {
    const ids = mdxH2s(readFileSync(join(process.cwd(), 'tools', slug, 'content.mdx'), 'utf8')).map((h) => h.id);
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).not.toContain('faq');
    expect(ids).not.toContain('sources');
  });
});

describe('content.mdx has no markdown tables (they render as raw text without GFM)', () => {
  it.each(registry.map((t) => [t.slug] as const))('%s', (slug) => {
    const mdx = readFileSync(join(process.cwd(), 'tools', slug, 'content.mdx'), 'utf8').replace(/```[\s\S]*?```/g, '');
    expect(mdx, 'use an HTML <table> instead of a markdown table').not.toMatch(/^\s*\|.*\|\s*$/m);
  });
});

describe('tool page headings', () => {
  it('"Related tools" is an H2 only once (the rail uses a plain label)', () => {
    const rail = readFileSync('components/ToolRail.tsx', 'utf8');
    const related = readFileSync('components/RelatedTools.tsx', 'utf8');
    expect(rail).not.toMatch(/<h[1-6][^>]*>\s*Related tools/);
    expect(related).toMatch(/<h2[^>]*>\s*Related tools/);
  });
});
