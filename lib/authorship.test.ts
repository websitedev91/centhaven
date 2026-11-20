import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { reportMistakeHref, site } from '@/config/site';
import { webApplicationJsonLd } from './seo';

/** Authorship is the brand only (Puru, 2026-11-18): no personal names, no Person in schema. */
describe('brand-only authorship', () => {
  it('tool schema: author and publisher are the CentHaven Organization', () => {
    const ld = webApplicationJsonLd({ name: 'X', description: 'Y', path: '/freelance/x', dateModified: '2026-11-18' });
    const org = { '@type': 'Organization', name: 'CentHaven', url: 'https://centhaven.com' };
    expect(ld.author).toEqual(org);
    expect(ld.publisher).toEqual(org);
  });

  it('byline and contact email', () => {
    expect(site.byline).toBe('Built and checked by the CentHaven team');
    expect(site.contactEmail).toBe('info@centhaven.com');
  });

  it('"Report a mistake" mails info@centhaven.com with the page URL in the subject', () => {
    const href = reportMistakeHref('https://centhaven.com/freelance/hourly-rate-calculator');
    expect(href).toBe('mailto:info@centhaven.com?subject=Report%20a%20mistake%3A%20https%3A%2F%2Fcenthaven.com%2Ffreelance%2Fhourly-rate-calculator');
    expect(decodeURIComponent(href.split('subject=')[1]!)).toBe('Report a mistake: https://centhaven.com/freelance/hourly-rate-calculator');
  });

  it('no Person schema and no personal author or reviewer line in site source', () => {
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        if (statSync(p).isDirectory()) walk(p);
        else if (/\.(tsx?|mdx)$/.test(name) && !name.includes('.test.') && !name.endsWith('.dev.tsx')) files.push(p);
      }
    };
    for (const dir of ['app', 'components', 'lib', 'tools', 'hubs', 'config']) walk(join(process.cwd(), dir));
    for (const f of files) {
      const src = readFileSync(f, 'utf8');
      expect(src, f).not.toMatch(/'@type':\s*'Person'/);
      expect(src, f).not.toMatch(/Reviewed by \{|Purushothaman|Built by /);
    }
    // Reads every source file: well under 1 s alone, but slower under a full parallel run.
  }, 20_000);
});
