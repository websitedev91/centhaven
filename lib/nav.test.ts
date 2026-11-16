import { describe, expect, it } from 'vitest';
import { navCategories, searchIndex } from './nav';
import { searchTools, type SearchItem } from './nav-search';
import { liveTools } from './registry';

const items: SearchItem[] = [
  { title: 'Freelance Hourly Rate Calculator', href: '/freelance/hourly-rate-calculator', category: 'Freelance', terms: 'freelance hourly rate calculator freelance how much to charge per hour' },
  { title: 'Day Rate Calculator', href: '/freelance/day-rate-calculator', category: 'Freelance', terms: 'day rate calculator freelance daily rate hourly' },
  { title: 'PayPal Fee Calculator', href: '/fees/paypal-fee-calculator', category: 'Payment & Platform Fees', terms: 'paypal fee calculator payment & platform fees' },
];

describe('searchTools', () => {
  it('returns everything (up to the limit) for an empty query', () => {
    expect(searchTools(items, '  ')).toHaveLength(3);
    expect(searchTools(items, '', 2)).toHaveLength(2);
  });

  it('needs every word to match, case-insensitive', () => {
    expect(searchTools(items, 'PAYPAL fee').map((i) => i.title)).toEqual(['PayPal Fee Calculator']);
    expect(searchTools(items, 'paypal hourly')).toEqual([]);
  });

  it('ranks title matches before keyword-only matches', () => {
    expect(searchTools(items, 'hourly').map((i) => i.title)).toEqual([
      'Freelance Hourly Rate Calculator',
      'Day Rate Calculator',
    ]);
  });
});

describe('nav data', () => {
  it('only contains live tools', () => {
    const live = new Set(liveTools().map((t) => t.title));
    for (const i of searchIndex()) expect(live.has(i.title)).toBe(true);
    for (const c of navCategories()) {
      expect(c.tools.length).toBeLessThanOrEqual(6);
      for (const t of c.tools) expect(live.has(t.title)).toBe(true);
    }
  });
});
