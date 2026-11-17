import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatMoney, formatNumber, formatPercent, roundTo, type CurrencyCode } from '@/lib/format';
import { parseQuery, toQuery } from '@/lib/url-state';
import {
  BILLABLE_OVER_AVAILABLE,
  LEAVE_TOO_HIGH,
  NO_AVAILABLE_HOURS,
  utilizationRate,
  type UtilizationError,
  type UtilizationInput,
  type UtilizationResult,
} from './calc';
import {
  fieldErrors,
  switchUtilizationCurrency,
  toCalcInput,
  utilizationDefaults,
  utilizationSchema,
  utilizationVariant,
} from './schema';

function ok(r: UtilizationResult | UtilizationError): UtilizationResult {
  if (!r.ok) throw new Error(`expected a result, got: ${r.error}`);
  return r;
}
const r2 = (n: number) => roundTo(n, 2);

describe('spec test cases', () => {
  it('#1 billable 28 · available 40 · target 75% · rate 100', () => {
    const r = ok(utilizationRate({ billable: 28, available: 40, target: 0.75, rate: 100 }));
    expect(roundTo(r.utilization * 100, 2)).toBe(70);
    expect(r2(r.targetHours)).toBe(30);
    expect(r2(r.gapHours)).toBe(2);
    expect(r2(r.revenueGap)).toBe(200);
    expect(r2(r.nonBillable)).toBe(12);
  });

  it('#2 billable 1,200 · available 1,800 · target 65% · rate 1,500 → 30 hours above target', () => {
    const r = ok(utilizationRate({ billable: 1_200, available: 1_800, target: 0.65, rate: 1_500 }));
    expect(roundTo(r.utilization * 100, 2)).toBe(66.67);
    expect(r2(r.targetHours)).toBe(1_170);
    expect(r2(r.gapHours)).toBe(-30);
    expect(r2(r.revenueGap)).toBe(0);
  });

  it('#3 billable 0 · available 40 · target 75% · rate 100', () => {
    const r = ok(utilizationRate({ billable: 0, available: 40, target: 0.75, rate: 100 }));
    expect(r2(r.utilization)).toBe(0);
    expect(r2(r.gapHours)).toBe(30);
    expect(r2(r.revenueGap)).toBe(3_000);
  });

  it('#4 billable 50 · available 40 → error, no crash', () => {
    expect(utilizationRate({ billable: 50, available: 40, target: 0.75, rate: 100 })).toEqual({
      ok: false,
      error: BILLABLE_OVER_AVAILABLE,
    });
  });
});

describe('other checks', () => {
  it('exactly at target has no gap and no revenue gap', () => {
    const r = ok(utilizationRate({ billable: 30, available: 40, target: 0.75, rate: 100 }));
    expect(r2(r.gapHours)).toBe(0);
    expect(r2(r.revenueGap)).toBe(0);
  });

  it('a zero rate gives no revenue gap but still a gap in hours', () => {
    const r = ok(utilizationRate({ billable: 10, available: 40, target: 0.75, rate: 0 }));
    expect(r2(r.gapHours)).toBe(20);
    expect(r2(r.revenueGap)).toBe(0);
  });

  it('guards zero available hours and validates ranges', () => {
    expect(utilizationRate({ billable: 0, available: 0, target: 0.75, rate: 100 })).toEqual({ ok: false, error: NO_AVAILABLE_HOURS });
    expect(fieldErrors(utilizationSchema, { ...utilizationDefaults, available: 0, target: 5, billable: -1 })).toEqual({
      billable: 'Minimum is 0 hours',
      available: 'Minimum is 1 hour',
      target: 'Minimum is 10%',
    });
  });

  it('converts the UI percentage for the calc', () => {
    expect(toCalcInput(utilizationDefaults)).toEqual({ billable: 28, available: 40, leave: 0, target: 0.75, rate: 100 });
  });
});

describe('currency-dependent defaults', () => {
  const usd = utilizationDefaults;

  it('page-load defaults are the spec defaults (USD, weekly)', () => {
    expect(usd).toEqual({ period: 'week', currency: 'USD', billable: 28, available: 40, leave: 0, target: 75, rate: 100 });
  });

  it('INR uses 1,500; other currencies keep 100; typed values are kept', () => {
    expect(switchUtilizationCurrency(usd, 'INR')).toEqual({ ...usd, currency: 'INR', rate: 1_500 });
    expect(switchUtilizationCurrency(usd, 'GBP')).toEqual({ ...usd, currency: 'GBP' });
    const typed = { ...usd, rate: 120, billable: 30 };
    expect(switchUtilizationCurrency(typed, 'INR')).toEqual({ ...typed, currency: 'INR' });
  });

  it('share links stay short and restore the currency defaults', () => {
    const inr = switchUtilizationCurrency(usd, 'INR');
    expect(toQuery(inr, usd, utilizationVariant)).toBe('?currency=INR');
    expect(parseQuery('?currency=INR&period=year', utilizationSchema, usd, utilizationVariant)).toEqual({ ...inr, period: 'year' });
  });
});

describe('content.mdx worked examples match the calculator', () => {
  const mdx = readFileSync(join(__dirname, 'content.mdx'), 'utf8');
  const cases: { input: UtilizationInput; currency: CurrencyCode }[] = [
    { input: { billable: 28, available: 40, target: 0.75, rate: 100 }, currency: 'USD' },
    { input: { billable: 120, available: 160, target: 0.8, rate: 75 }, currency: 'GBP' },
    { input: { billable: 1_200, available: 1_800, target: 0.65, rate: 1_500 }, currency: 'INR' },
  ];
  it.each(cases)('$currency example', ({ input, currency }) => {
    const r = ok(utilizationRate(input));
    for (const text of [
      `**${formatPercent(r.utilization, 2)}**`,
      `**${formatNumber(r.targetHours)}**`,
      `**${formatNumber(Math.abs(r.gapHours))}**`,
      `**${formatMoney(r.revenueGap, currency)}**`,
      `**${formatNumber(r.nonBillable)}**`,
    ]) {
      expect(mdx, `content.mdx should contain "${text}"`).toContain(text);
    }
  });
});

describe('review C9: leave hours and net capacity', () => {
  it('28 billable of 40 available with 8 hours leave → net 32, 87.50%, 4 hours above a 75% target (hand-checked)', () => {
    const r = ok(utilizationRate({ billable: 28, available: 40, leave: 8, target: 0.75, rate: 100 }));
    expect(r.grossAvailable).toBe(40);
    expect(r.netAvailable).toBe(32);
    expect(roundTo(r.utilization * 100, 2)).toBe(87.5);
    expect(r2(r.targetHours)).toBe(24);
    expect(r2(r.gapHours)).toBe(-4);
    expect(r2(r.revenueGap)).toBe(0);
    expect(r2(r.nonBillable)).toBe(4);
  });

  it('monthly: 120 of 168 with 16 leave, target 80%, £75 → 78.95%, gap 1.6 h, £120.00 (hand-checked)', () => {
    const r = ok(utilizationRate({ billable: 120, available: 168, leave: 16, target: 0.8, rate: 75 }));
    expect(roundTo(r.utilization * 100, 2)).toBe(78.95);
    expect(r2(r.targetHours)).toBe(121.6);
    expect(r2(r.gapHours)).toBe(1.6);
    expect(r2(r.revenueGap)).toBe(120);
    expect(r2(r.nonBillable)).toBe(32);
  });

  it('no leave (default) leaves net = gross; leave ≥ available or billable > net is an error', () => {
    expect(ok(utilizationRate({ billable: 28, available: 40, target: 0.75, rate: 100 })).netAvailable).toBe(40);
    expect(utilizationRate({ billable: 0, available: 40, leave: 40, target: 0.75, rate: 100 })).toEqual({ ok: false, error: LEAVE_TOO_HIGH });
    expect(utilizationRate({ billable: 35, available: 40, leave: 8, target: 0.75, rate: 100 })).toEqual({ ok: false, error: BILLABLE_OVER_AVAILABLE });
    expect(toQuery(utilizationDefaults, utilizationDefaults, utilizationVariant)).toBe('');
  });
});
