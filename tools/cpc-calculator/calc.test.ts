import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatMoney, type CurrencyCode } from '@/lib/format';
import { cpc, formatClicks, formatClicksPerConversion, formatConversions } from './calc';
import { cpcDefaults, cpcErrors, switchCpcCurrency, toCalcInput, type CpcState } from './schema';

const m = (n: number, c: CurrencyCode = 'USD') => formatMoney(n, c);
const find = (spend: number, clicks: number, conv: number) => cpc(toCalcInput({ ...cpcDefaults, mode: 'find', spend, clicks, conv }));
const budget = (b: number, c: number, conv: number) => cpc(toCalcInput({ ...cpcDefaults, mode: 'clicks', budget: b, cpc: c, conv }));

describe('spec test cases', () => {
  it('#1 500 ÷ 250 → CPC 2.00, conversion rows off', () => {
    const r = find(500, 250, 0);
    expect(m(r.cpc)).toBe('$2.00');
    expect(r.conversions).toBeNull();
    expect(r.costPerConversion).toBeNull();
  });

  it('#2 + 4% → 10 conversions, 50.00 each, 25 clicks per conversion', () => {
    const r = find(500, 250, 4);
    expect(formatConversions(r.conversions!)).toBe('10 conversions');
    expect(m(r.costPerConversion!)).toBe('$50.00');
    expect(formatClicksPerConversion(r.clicksPerConversion!)).toBe('About 25 clicks for each conversion');
  });

  it('#3 budget 1,000 at 1.25, 3% → 800 clicks, 24 conversions, 41.67', () => {
    const r = budget(1_000, 1.25, 3);
    expect(formatClicks(r.clicks)).toBe('800 clicks');
    expect(formatConversions(r.conversions!)).toBe('24 conversions');
    expect(m(r.costPerConversion!)).toBe('$41.67');
  });

  it('#4 budget 100 at 0.30 → about 333 clicks', () => {
    const r = budget(100, 0.3, 0);
    expect(formatClicks(r.clicks)).toBe('about 333 clicks');
  });

  it('#5 INR ₹20,000 ÷ 800 at 2.5% → ₹25.00, 20 conversions, ₹1,000.00', () => {
    const r = find(20_000, 800, 2.5);
    expect(m(r.cpc, 'INR')).toBe('₹25.00');
    expect(formatConversions(r.conversions!)).toBe('20 conversions');
    expect(m(r.costPerConversion!, 'INR')).toBe('₹1,000.00');
  });

  it('#6 300 ÷ 120 at 5% → 2.50, 6 conversions (no "about"), 50.00', () => {
    const r = find(300, 120, 5);
    expect(m(r.cpc)).toBe('$2.50');
    expect(formatConversions(r.conversions!)).toBe('6 conversions');
    expect(m(r.costPerConversion!)).toBe('$50.00');
  });

  it('#7 1,000 ÷ 450 at 3% → 2.22, about 13.5 conversions (on average), 74.07', () => {
    const r = find(1_000, 450, 3);
    expect(m(r.cpc)).toBe('$2.22');
    expect(formatConversions(r.conversions!)).toBe('about 13.5 conversions (on average)');
    expect(m(r.costPerConversion!)).toBe('$74.07');
  });

  it('#8 USD → INR without editing: money moves, clicks and rate stay; a typed value is kept', () => {
    const i = switchCpcCurrency(cpcDefaults, 'INR');
    expect([i.spend, i.budget, i.cpc, i.clicks, i.conv]).toEqual([20_000, 50_000, 25, 250, 4]);
    expect(switchCpcCurrency({ ...cpcDefaults, spend: 900 }, 'INR').spend).toBe(900);
    expect(switchCpcCurrency(cpcDefaults, 'INR', new Set(['spend'])).spend).toBe(500);
  });
});

describe('edge cases', () => {
  const errs = (patch: Partial<CpcState>) => cpcErrors({ ...cpcDefaults, ...patch });

  it('clicks 0 / decimal → field errors; CPC 0 in clicks mode → field error', () => {
    expect(errs({ clicks: 0 }).clicks).toBe('Enter at least 1 click');
    expect(errs({ clicks: 2.5 }).clicks).toBe('Enter a whole number');
    expect(errs({ mode: 'clicks', cpc: 0 }).cpc).toBe('Enter a cost per click above 0');
    expect(errs({ mode: 'clicks', cpc: -1 }).cpc).toBe('Can’t be negative');
    expect(errs({ mode: 'clicks', cpc: 0.005 }).cpc).toBe('Minimum is 0.01');
    expect(errs({ mode: 'find', cpc: 0 })).toEqual({});
  });

  it('spend 0 → CPC 0.00 and cost per conversion 0.00; budget 0 → 0 clicks', () => {
    const a = find(0, 250, 4);
    expect(m(a.cpc)).toBe('$0.00');
    expect(m(a.costPerConversion!)).toBe('$0.00');
    const b = budget(0, 1.25, 4);
    expect(formatClicks(b.clicks)).toBe('0 clicks');
    expect(m(b.costPerConversion!)).toBe('$0.00');
  });

  it('rate over 100 or negative → field error', () => {
    expect(errs({ conv: 101 }).conv).toBe('Maximum is 100%');
    expect(errs({ conv: -1 }).conv).toBe('Minimum is 0%');
  });

  it('huge values stay finite', () => {
    const r = budget(10_000_000_000, 0.01, 100);
    expect(formatClicks(r.clicks)).toBe('1,000,000,000,000 clicks');
    expect(m(r.costPerConversion!)).not.toMatch(/e\+|NaN|Infinity/);
  });

  it('1 click / 1 conversion read in the singular', () => {
    expect(formatClicks(1)).toBe('1 click');
    expect(formatConversions(1)).toBe('1 conversion');
    expect(formatClicksPerConversion(1)).toBe('About 1 click for each conversion');
  });
});

describe('content.mdx worked examples match the calculator', () => {
  const mdx = readFileSync(join(__dirname, 'content.mdx'), 'utf8');
  const has = (t: string) => expect(mdx, `content.mdx should contain "${t}"`).toContain(t);

  it('cases 2, 3 and 5', () => {
    const a = find(500, 250, 4);
    [m(a.cpc), formatConversions(a.conversions!), m(a.costPerConversion!)].forEach(has);
    const b = budget(1_000, 1.25, 3);
    [formatClicks(b.clicks), formatConversions(b.conversions!), m(b.costPerConversion!)].forEach(has);
    const c = find(20_000, 800, 2.5);
    [m(c.cpc, 'INR'), formatConversions(c.conversions!), m(c.costPerConversion!, 'INR')].forEach(has);
  });
});
