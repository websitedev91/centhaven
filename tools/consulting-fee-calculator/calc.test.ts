import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatMoney, formatNumber, roundTo, type CurrencyCode } from '@/lib/format';
import { parseQuery, toQuery } from '@/lib/url-state';
import { consultingFee, INVALID_TAX_RATE, NO_BILLABLE_DAYS, type ConsultingError, type ConsultingInput, type ConsultingResult } from './calc';
import {
  consultingDefaults,
  consultingSchema,
  consultingVariant,
  fieldErrors,
  planBSchema,
  switchConsultingCurrency,
  toCalcInput,
} from './schema';

function ok(r: ConsultingResult | ConsultingError): ConsultingResult {
  if (!r.ok) throw new Error(`expected a result, got: ${r.error}`);
  return r;
}
const r2 = (n: number) => roundTo(n, 2);

const CASES: { input: ConsultingInput; currency: CurrencyCode }[] = [
  { input: { income: 120_000, taxRate: 0.25, overheads: 15_000, billableDays: 180, hoursPerDay: 6, margin: 0.15, projectHours: 40 }, currency: 'USD' },
  { input: { income: 3_000_000, taxRate: 0.1, overheads: 300_000, billableDays: 200, hoursPerDay: 7, margin: 0.1, projectHours: 20 }, currency: 'INR' },
  { input: { income: 90_000, taxRate: 0, overheads: 10_000, billableDays: 200, hoursPerDay: 5, margin: 0, projectHours: 40 }, currency: 'GBP' },
];

describe('spec test cases', () => {
  it('#1 USD: income 120,000 · tax 25% · overheads 15,000 · 180 days · 6 h · margin 15% · 40 h', () => {
    const r = ok(consultingFee(CASES[0]!.input));
    expect(r2(r.grossNeeded)).toBe(175_000);
    expect(r.billableHours).toBe(1_080);
    expect(r2(r.hourlyRate)).toBe(186.34);
    expect(r2(r.dayRate)).toBe(1_118.06);
    expect(r2(r.projectFee)).toBe(7_453.7);
    expect(r2(r.annualRevenue)).toBe(201_250);
    expect(r2(r.marginPerYear)).toBe(26_250);
  });

  it('#2 INR: income 30,00,000 · tax 10% · overheads 3,00,000 · 200 days · 7 h · margin 10% · 20 h', () => {
    const r = ok(consultingFee(CASES[1]!.input));
    expect(r2(r.grossNeeded)).toBe(3_633_333.33);
    expect(r.billableHours).toBe(1_400);
    expect(r2(r.hourlyRate)).toBe(2_854.76);
    expect(r2(r.dayRate)).toBe(19_983.33);
    expect(r2(r.projectFee)).toBe(57_095.24);
    expect(r2(r.annualRevenue)).toBe(3_996_666.67);
  });

  it('#3 GBP: income 90,000 · no tax · overheads 10,000 · 200 days · 5 h · no margin · 40 h', () => {
    const r = ok(consultingFee(CASES[2]!.input));
    expect(r2(r.hourlyRate)).toBe(100);
    expect(r2(r.dayRate)).toBe(500);
    expect(r2(r.projectFee)).toBe(4_000);
    expect(r2(r.annualRevenue)).toBe(100_000);
    expect(r2(r.marginPerYear)).toBe(0);
  });

  it('#4 billable days 0 gives a validation error, no crash', () => {
    expect(fieldErrors(consultingSchema, { ...consultingDefaults, billableDays: 0 })).toEqual({ billableDays: 'Minimum is 1 day' });
    expect(consultingFee({ ...CASES[0]!.input, billableDays: 0 })).toEqual({ ok: false, error: NO_BILLABLE_DAYS });
  });
});

describe('other checks', () => {
  it('splits each hour into take-home, tax, overheads and margin that add up to the rate', () => {
    for (const { input } of CASES) {
      const r = ok(consultingFee(input));
      const { takeHome, tax, overheads, margin } = r.perHour;
      expect(r2(takeHome + tax + overheads + margin)).toBe(r2(r.hourlyRate));
    }
  });

  it('guards a 100% tax rate', () => {
    expect(consultingFee({ ...CASES[0]!.input, taxRate: 1 })).toEqual({ ok: false, error: INVALID_TAX_RATE });
  });

  it('validates ranges, including plan B', () => {
    expect(fieldErrors(consultingSchema, { ...consultingDefaults, hoursPerDay: 13, taxRate: 61 })).toEqual({
      taxRate: 'Maximum is 60%',
      hoursPerDay: 'Maximum is 12 hours',
    });
    expect(fieldErrors(planBSchema, { margin: 101, billableDays: 261 })).toEqual({
      billableDays: 'Maximum is 260 days',
      margin: 'Maximum is 100%',
    });
  });

  it('converts UI percentages for the calc', () => {
    expect(toCalcInput(consultingDefaults)).toEqual(CASES[0]!.input);
  });
});

describe('currency-dependent defaults', () => {
  const usd = consultingDefaults;

  it.each([
    ['CAD', 120_000, 15_000, 25],
    ['AUD', 120_000, 15_000, 25],
    ['GBP', 90_000, 11_000, 25],
    ['EUR', 90_000, 11_000, 25],
    ['INR', 3_000_000, 300_000, 10],
  ] as const)('untouched values switch to %s defaults', (cur, income, overheads, taxRate) => {
    const next = switchConsultingCurrency(usd, cur);
    expect(next).toEqual({ ...usd, currency: cur, income, overheads, taxRate });
    expect(consultingSchema.safeParse(next).success).toBe(true);
  });

  it('keeps typed values and never changes days, hours, margin or project hours', () => {
    const typed = { ...usd, income: 150_000, billableDays: 160, margin: 20 };
    expect(switchConsultingCurrency(typed, 'INR')).toEqual({ ...typed, currency: 'INR', overheads: 300_000, taxRate: 10 });
  });

  it('share links stay short and restore the currency defaults', () => {
    const inr = switchConsultingCurrency(usd, 'INR');
    expect(toQuery(inr, usd, consultingVariant)).toBe('?currency=INR');
    expect(parseQuery('?currency=INR&margin=20', consultingSchema, usd, consultingVariant)).toEqual({ ...inr, margin: 20 });
  });
});

describe('content.mdx worked examples match the calculator', () => {
  const mdx = readFileSync(join(__dirname, 'content.mdx'), 'utf8');
  it.each(CASES)('$currency example', ({ input, currency }) => {
    const r = ok(consultingFee(input));
    const texts = [formatMoney(r.hourlyRate, currency), formatMoney(r.dayRate, currency), formatMoney(r.projectFee, currency), formatMoney(r.annualRevenue, currency)];
    if (input.taxRate > 0) texts.push(formatMoney(r.grossNeeded, currency), `**${formatNumber(r.billableHours)}**`);
    if (input.margin > 0 && currency === 'USD') texts.push(formatMoney(r.marginPerYear, currency));
    for (const text of texts) expect(mdx, `content.mdx should contain "${text}"`).toContain(text);
  });

  it('cross-links to the freelance hourly rate calculator near the top', () => {
    expect(mdx.slice(0, 600)).toContain('<ToolLink slug="hourly-rate-calculator">');
  });
});
