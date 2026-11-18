import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatMoney, roundTo, type CurrencyCode } from '@/lib/format';
import { commission, TIERS_OUT_OF_ORDER, type CommissionError, type CommissionResult } from './calc';
import { commissionDefaults, commissionSchema, fieldErrors, switchCommissionCurrency, toCalcInput, type CommissionState } from './schema';

function ok(r: CommissionResult | CommissionError): CommissionResult {
  if (!r.ok) throw new Error(`expected a result, got: ${r.error}`);
  return r;
}
const r2 = (n: number) => roundTo(n, 2);
const run = (s: Partial<CommissionState>) => commission(toCalcInput({ ...commissionDefaults, ...s }));
const tiered = (sales: number, extra: Partial<CommissionState> = {}) => ok(run({ plan: 'tiered', sales, ...extra }));

describe('spec test cases', () => {
  it('#1 flat $50,000 at 5% → $2,500, effective 5%', () => {
    const r = ok(run({ sales: 50_000, rate: 5 }));
    expect(r2(r.commission)).toBe(2_500);
    expect(roundTo(r.effective! * 100, 2)).toBe(5);
  });

  it('#2 flat + base $3,000 → total $5,500', () => {
    expect(r2(ok(run({ sales: 50_000, rate: 5, base: 3_000 })).total)).toBe(5_500);
  });

  it('#3 tiered $60,000 → 600 + 1,500 + 800 = $2,900, effective 4.83%', () => {
    const r = tiered(60_000);
    expect(r.rows.map((x) => r2(x.amount))).toEqual([600, 1_500, 800]);
    expect(r2(r.commission)).toBe(2_900);
    expect(roundTo(r.effective! * 100, 2)).toBe(4.83);
  });

  it('#4 tiered $15,000 → $450, all in tier 1, effective 3%', () => {
    const r = tiered(15_000);
    expect(r2(r.commission)).toBe(450);
    expect(r.rows.map((x) => x.inTier)).toEqual([15_000, 0, 0]);
    expect(roundTo(r.effective! * 100, 2)).toBe(3);
  });

  it('#5 tiered ₹6,00,000 → 6,000 + 15,000 + 8,000 = ₹29,000', () => {
    const inr = switchCommissionCurrency(commissionDefaults, 'INR');
    const r = ok(commission(toCalcInput({ ...inr, plan: 'tiered', sales: 600_000 })));
    expect(r.rows.map((x) => r2(x.amount))).toEqual([6_000, 15_000, 8_000]);
    expect(r2(r.commission)).toBe(29_000);
  });
});

describe('edge cases', () => {
  it('sales 0 → commission 0, effective rate null (shown as —)', () => {
    const r = ok(run({ sales: 0 }));
    expect(r.commission).toBe(0);
    expect(r.effective).toBeNull();
  });

  it('tier starts not in order → error', () => {
    expect(run({ plan: 'tiered', t2From: 50_000, t3From: 20_000 })).toEqual({ ok: false, error: TIERS_OUT_OF_ORDER });
  });

  it('a tier with "starts at" 0 is skipped; a 4th tier works', () => {
    expect(tiered(60_000).rows).toHaveLength(3);
    const r = tiered(120_000, { t4From: 100_000, t4Rate: 10 });
    expect(r.rows.map((x) => r2(x.amount))).toEqual([600, 1_500, 4_000, 2_000]);
  });

  it.each([
    ['sales', -1],
    ['rate', 101],
    ['rate', -1],
    ['base', -1],
    ['t2Rate', 101],
  ] as const)('%s = %s → field error', (key, value) => {
    expect(fieldErrors(commissionSchema, { ...commissionDefaults, [key]: value })[key]).toBeDefined();
  });
});

describe('currency defaults', () => {
  it('untouched sales and tier starts follow the currency; typed values are kept', () => {
    expect(switchCommissionCurrency(commissionDefaults, 'INR')).toMatchObject({ sales: 500_000, t2From: 200_000, t3From: 500_000 });
    const typed = { ...commissionDefaults, sales: 75_000 };
    expect(switchCommissionCurrency(typed, 'INR')).toMatchObject({ sales: 75_000, t2From: 200_000 });
  });
});

describe('content.mdx worked examples match the calculator', () => {
  const mdx = readFileSync(join(__dirname, 'content.mdx'), 'utf8');
  const has = (t: string) => expect(mdx, `content.mdx should contain "${t}"`).toContain(t);
  const m = (n: number, c: CurrencyCode = 'USD') => formatMoney(n, c);

  it('Jordan, Mia and Arjun', () => {
    const jordan = ok(run({ sales: 50_000, rate: 5, base: 3_000 }));
    [m(jordan.commission), m(jordan.total)].forEach(has);
    const busy = tiered(60_000);
    [...busy.rows.map((x) => m(x.amount)), m(busy.commission), `${roundTo(busy.effective! * 100, 2)}%`].forEach(has);
    has(m(tiered(15_000).commission));
    const inr = switchCommissionCurrency(commissionDefaults, 'INR');
    has(m(ok(commission(toCalcInput({ ...inr, plan: 'tiered', sales: 600_000 }))).commission, 'INR'));
  });
});
