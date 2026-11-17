import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatMoney, roundTo, type CurrencyCode } from '@/lib/format';
import { getLiveToolBySlug, toolPath } from '@/lib/registry';
import { parseQuery, toQuery } from '@/lib/url-state';
import { websiteCost, type WebsiteCostInput } from './calc';
import { HOURLY_RATE_TOOL } from './links';
import {
  fieldErrors,
  switchWebsiteCostCurrency,
  toCalcInput,
  websiteCostDefaults,
  websiteCostSchema,
  websiteCostVariant,
} from './schema';

const r2 = (n: number) => roundTo(n, 2);

const CASES: { input: WebsiteCostInput; currency: CurrencyCode }[] = [
  {
    input: { rate: 75, pages: 5, hoursPerPage: 4, level: 'custom', setupHours: 6, features: { contact: 2, seo: 5 }, copyHoursPerPage: 0, buffer: 0.15, maintenanceHours: 2 },
    currency: 'USD',
  },
  {
    input: {
      rate: 1_500,
      pages: 10,
      hoursPerPage: 4,
      level: 'premium',
      setupHours: 6,
      features: { contact: 2, blog: 6, seo: 5, lang: 10 },
      copyHoursPerPage: 2,
      buffer: 0.2,
      maintenanceHours: 4,
    },
    currency: 'INR',
  },
  {
    input: { rate: 60, pages: 3, hoursPerPage: 4, level: 'template', setupHours: 6, features: { contact: 2, shop: 25 }, buffer: 0, maintenanceHours: 0 },
    currency: 'GBP',
  },
];

describe('spec test cases', () => {
  it('#1 USD defaults → 37.95 h, price 2,846.25, from 2,475.00, maintenance 150.00 / 1,800.00', () => {
    const r = websiteCost(CASES[0]!.input);
    expect([r.designHours, r.featureHours, r.baseHours, r.bufferHours, r.totalHours].map(r2)).toEqual([20, 7, 33, 4.95, 37.95]);
    expect([r.price, r.basePrice, r.maintenanceMonthly, r.maintenanceYearly].map(r2)).toEqual([2_846.25, 2_475, 150, 1_800]);
  });

  it('#2 INR premium, copy, 4 features, 20% → 130.8 h, price 1,96,200.00', () => {
    const r = websiteCost(CASES[1]!.input);
    expect([r.designHours, r.copyHours, r.featureHours, r.baseHours, r.bufferHours, r.totalHours].map(r2)).toEqual([60, 20, 23, 109, 21.8, 130.8]);
    expect([r.price, r.basePrice, r.maintenanceMonthly, r.maintenanceYearly].map(r2)).toEqual([196_200, 163_500, 6_000, 72_000]);
  });

  it('#3 GBP template shop, no buffer → 39 h, 2,340.00, range from = to, no maintenance', () => {
    const r = websiteCost(CASES[2]!.input);
    expect([r.designHours, r.featureHours, r.totalHours].map(r2)).toEqual([6, 27, 39]);
    expect(r2(r.price)).toBe(2_340);
    expect(r.basePrice).toBe(r.price);
    expect(r.maintenanceMonthly).toBe(0);
  });

  it('#4 1 page, template, nothing else, rate 0 → 2 h, price 0, no crash', () => {
    const r = websiteCost({ rate: 0, pages: 1, hoursPerPage: 4, level: 'template', setupHours: 0, features: {}, buffer: 0, maintenanceHours: 0 });
    expect(r.totalHours).toBe(2);
    expect(r.price).toBe(0);
  });

  it('#5 switching USD → INR moves an untouched rate, keeps hours and a typed rate', () => {
    const inr = switchWebsiteCostCurrency(websiteCostDefaults, 'INR');
    expect(inr).toEqual({ ...websiteCostDefaults, currency: 'INR', rate: 1_500 });
    const typed = { ...websiteCostDefaults, rate: 90, pages: 8 };
    expect(switchWebsiteCostCurrency(typed, 'INR')).toEqual({ ...typed, currency: 'INR' });
  });
});

describe('schema', () => {
  it('USD defaults convert to spec case #1', () => {
    expect(toCalcInput(websiteCostDefaults)).toEqual(CASES[0]!.input);
  });

  it('features that are off are left out, even with hours set', () => {
    const input = toCalcInput({ ...websiteCostDefaults, contact: 0, shop: 1, copy: 1 });
    expect(input.features).toEqual({ shop: 25, seo: 5 });
    expect(input.copyHoursPerPage).toBe(2);
  });

  it('validates ranges', () => {
    expect(fieldErrors(websiteCostSchema, { ...websiteCostDefaults, pages: 0, hpp: 0, buffer: 60, blog: 2, level: 'cheap' })).toEqual({
      pages: 'Minimum is 1 page',
      hpp: 'Minimum is 0.5 hours',
      buffer: 'Maximum is 50%',
      blog: 'Use 0 or 1',
      level: expect.any(String),
    });
    expect(fieldErrors(websiteCostSchema, { ...websiteCostDefaults, pages: 2.5 })).toEqual({ pages: 'Use a whole number of pages' });
  });

  it.each([
    ['CAD', 85],
    ['AUD', 90],
    ['GBP', 60],
    ['EUR', 60],
    ['INR', 1_500],
  ] as const)('untouched rate switches to the %s default', (cur, rate) => {
    expect(switchWebsiteCostCurrency(websiteCostDefaults, cur)).toEqual({ ...websiteCostDefaults, currency: cur, rate });
  });

  it('share links stay short and restore the currency defaults; level round-trips', () => {
    const inr = switchWebsiteCostCurrency(websiteCostDefaults, 'INR');
    expect(toQuery(inr, websiteCostDefaults, websiteCostVariant)).toBe('?currency=INR');
    expect(parseQuery('?currency=INR&level=premium&shop=1', websiteCostSchema, websiteCostDefaults, websiteCostVariant)).toEqual({
      ...inr,
      level: 'premium',
      shop: 1,
    });
    expect(parseQuery('?level=cheap', websiteCostSchema, websiteCostDefaults, websiteCostVariant).level).toBe('custom');
  });
});

describe('links and content', () => {
  it('the hourly rate link points at a live tool', () => {
    const tool = getLiveToolBySlug(HOURLY_RATE_TOOL.slug);
    expect(tool).toBeDefined();
    expect(toolPath(tool!)).toBe(HOURLY_RATE_TOOL.path);
  });

  const mdx = readFileSync(join(__dirname, 'content.mdx'), 'utf8');
  it.each(CASES)('$currency worked example matches the calculator', ({ input, currency }) => {
    const r = websiteCost(input);
    const values = [r.price, r.basePrice, ...(r.maintenanceMonthly > 0 ? [r.maintenanceMonthly, r.maintenanceYearly] : [])];
    for (const n of values) {
      const text = `**${formatMoney(n, currency)}**`;
      expect(mdx, `content.mdx should contain "${text}"`).toContain(text);
    }
  });
});
