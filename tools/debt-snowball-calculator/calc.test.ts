import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatMoney, type CurrencyCode } from '@/lib/format';
import { monthsToDuration as yearsAndMonths } from '@/lib/duration';
import { chartPoints, debtPayoff, formatOrder, MAX_MONTHS, type DebtResult } from './calc';
import { toQuery } from '@/lib/url-state';
import { addRow, debtDefaults, debtErrors, debtVariant, removeRow, shownDifference, switchDebtCurrency, toCalcInput, type DebtState } from './schema';

const m = (n: number, c: CurrencyCode = 'USD') => formatMoney(n, c);
const run = (debts: [number, number, number][], extra: number) =>
  debtPayoff({ debts: debts.map(([balance, apr, minimum]) => ({ balance, apr, minimum })), extra });
function plan(r: DebtResult) {
  if (r.kind !== 'plan') throw new Error(`expected a plan, got ${r.kind}`);
  return r;
}
const DEFAULTS: [number, number, number][] = [
  [2_500, 12, 75],
  [6_000, 24, 150],
  [9_000, 7, 250],
];

describe('spec test cases (worked out month by month)', () => {
  it('#1 USD defaults: snowball 31 months / 3,282.11, avalanche 31 months / 2,878.68, saves 403.43', () => {
    const r = plan(run(DEFAULTS, 200));
    expect(r.payment).toBe(675);
    expect(r.snowball.months).toBe(31);
    expect(m(r.snowball.totalInterest)).toBe('$3,282.11');
    expect(formatOrder(r.snowball.order)).toBe('Debt 1 (month 10) → Debt 2 (month 26) → Debt 3 (month 31)');
    expect(r.avalanche.months).toBe(31);
    expect(m(r.avalanche.totalInterest)).toBe('$2,878.68');
    expect(formatOrder(r.avalanche.order)).toBe('Debt 2 (month 22) → Debt 1 (month 25) → Debt 3 (month 31)');
    expect(m(shownDifference(r.snowball.totalInterest, r.avalanche.totalInterest))).toBe('$403.43');
  });

  it('the USD defaults in the schema give case 1', () => {
    const r = plan(debtPayoff(toCalcInput(debtDefaults)));
    expect(m(r.snowball.totalInterest)).toBe('$3,282.11');
    expect(m(r.avalanche.totalInterest)).toBe('$2,878.68');
  });

  it('#2 1,000 at 0%, min 100 → 10 months, 0.00 interest, same both ways', () => {
    const r = plan(run([[1_000, 0, 100]], 0));
    expect(r.snowball.months).toBe(10);
    expect(m(r.snowball.totalInterest)).toBe('$0.00');
    expect(r.avalanche).toEqual(r.snowball);
  });

  it('#3 1,000 at 12%, min 100 → 11 months, 58.98', () => {
    const r = plan(run([[1_000, 12, 100]], 0));
    expect(r.snowball.months).toBe(11);
    expect(m(r.snowball.totalInterest)).toBe('$58.98');
    expect(m(r.avalanche.totalInterest)).toBe('$58.98');
  });

  it('#4 two debts: snowball 23 / 841.34, avalanche 22 / 702.05, saves 139.29 and 1 month', () => {
    const r = plan(
      run(
        [
          [3_000, 20, 90],
          [1_500, 10, 50],
        ],
        100,
      ),
    );
    expect(r.snowball.months).toBe(23);
    expect(m(r.snowball.totalInterest)).toBe('$841.34');
    expect(formatOrder(r.snowball.order)).toBe('Debt 2 (month 11) → Debt 1 (month 23)');
    expect(r.avalanche.months).toBe(22);
    expect(m(r.avalanche.totalInterest)).toBe('$702.05');
    expect(formatOrder(r.avalanche.order)).toBe('Debt 1 (month 19) → Debt 2 (month 22)');
    expect(m(shownDifference(r.snowball.totalInterest, r.avalanche.totalInterest))).toBe('$139.29');
    expect(r.snowball.months - r.avalanche.months).toBe(1);
  });

  it('#5 INR: 26 months, ₹68,391.07, the same both ways', () => {
    const r = plan(
      run(
        [
          [50_000, 36, 2_500],
          [200_000, 14, 6_000],
          [120_000, 18, 4_000],
        ],
        5_000,
      ),
    );
    expect(r.snowball.months).toBe(26);
    expect(m(r.snowball.totalInterest, 'INR')).toBe('₹68,391.07');
    expect(formatOrder(r.snowball.order)).toBe('Debt 1 (month 8) → Debt 3 (month 18) → Debt 2 (month 26)');
    expect(r.avalanche.months).toBe(26);
    expect(m(r.avalanche.totalInterest, 'INR')).toBe('₹68,391.07');
  });

  it('the INR presets give case 5', () => {
    const r = plan(debtPayoff(toCalcInput(switchDebtCurrency(debtDefaults, 'INR'))));
    expect(m(r.snowball.totalInterest, 'INR')).toBe('₹68,391.07');
  });

  it('#6 10,000 at 24%, min 150 → never paid off (interest 200 ≥ payment 150)', () => {
    const r = run([[10_000, 24, 150]], 0);
    expect(r).toEqual({ ok: false, kind: 'never', payment: 150, interest: 200 });
  });

  it('#7 case 1 with no extra → 51 months, 6,381.50; Debt 1 and Debt 3 in month 41', () => {
    const r = plan(run(DEFAULTS, 0));
    expect(r.snowball.months).toBe(51);
    expect(m(r.snowball.totalInterest)).toBe('$6,381.50');
    expect(formatOrder(r.snowball.order)).toBe('Debt 1 (month 41) and Debt 3 (month 41) → Debt 2 (month 51)');
    expect(r.avalanche.months).toBe(51);
  });

  it('#8 USD → GBP without editing moves balances, minimums and extra; rates stay; a typed balance is kept', () => {
    const g = switchDebtCurrency(debtDefaults, 'GBP');
    expect([g.b1, g.m1, g.b2, g.m2, g.b3, g.m3, g.extra]).toEqual([2_000, 60, 5_000, 125, 7_500, 200, 150]);
    expect([g.r1, g.r2, g.r3]).toEqual([12, 24, 7]);
    const typed = switchDebtCurrency({ ...debtDefaults, b1: 4_000 }, 'GBP');
    expect(typed.b1).toBe(4_000);
    expect(typed.b2).toBe(5_000);
    // Retyped example value: kept when the field is touched.
    expect(switchDebtCurrency(debtDefaults, 'GBP', new Set(['b1'])).b1).toBe(2_500);
  });
});

describe('edge cases', () => {
  const errs = (patch: Partial<DebtState>) => debtErrors({ ...debtDefaults, ...patch });

  it('all balances 0 → no debt (valid)', () => {
    expect(run([[0, 12, 75]], 200)).toEqual({ ok: true, kind: 'none' });
  });

  it('a 0 balance row is ignored, minimum and all', () => {
    const r = plan(run([[1_000, 12, 100], [0, 24, 500]], 0));
    expect(r.payment).toBe(100);
    expect(r.snowball.months).toBe(11);
  });

  it('a minimum of 0 is paid off by rollover', () => {
    const r = plan(run([[500, 0, 100], [300, 0, 0]], 0));
    expect(r.snowball.months).toBe(8);
  });

  it('a minimum below its interest is flagged but still paid off', () => {
    const r = plan(run([[1_000, 0, 200], [10_000, 24, 150]], 100));
    expect(r.minBelowInterest).toEqual([1]);
    expect(r.snowball.months).toBeGreaterThan(0);
  });

  it(`over ${MAX_MONTHS} months → cap`, () => {
    expect(run([[1_000_000, 12, 10_001]], 0)).toEqual({ ok: false, kind: 'cap' });
  });

  it('negative, rate over 100 → field errors; hidden rows never block', () => {
    expect(errs({ b1: -1 }).b1).toBe('Can’t be negative');
    expect(errs({ r2: 101 }).r2).toBe('Maximum is 100%');
    expect(errs({ b5: Number.NaN })).toEqual({});
    expect(errs({ b1: Number.NaN }).b1).toBe('Enter a number');
  });

  it('huge values stay finite', () => {
    const r = run([[1_000_000_000, 100, 1_000_000_000]], 1_000_000_000);
    expect(r.kind).toBe('plan');
    expect(Number.isFinite(plan(r).snowball.totalInterest)).toBe(true);
  });

  it('add copies the last debt; remove moves later debts up', () => {
    const a = addRow(debtDefaults);
    expect([a.rows, a.b4, a.r4, a.m4]).toEqual([4, 9_000, 7, 250]);
    const r = removeRow(a, 0);
    expect([r.rows, r.b1, r.b2, r.b3, r.b4]).toEqual([3, 6_000, 9_000, 9_000, 0]);
    expect(removeRow({ ...debtDefaults, rows: 1 }, 0).rows).toBe(1);
  });

  it('years and months text', () => {
    expect(yearsAndMonths(31)).toBe('2 years and 7 months');
    expect(yearsAndMonths(24)).toBe('2 years');
    expect(yearsAndMonths(1)).toBe('1 month');
  });

  it('chart has at most 60 points and ends at the last month', () => {
    const r = plan(run(DEFAULTS, 0));
    const pts = chartPoints(r);
    expect(pts.length).toBeLessThanOrEqual(60);
    expect(pts[0]!.month).toBe(0);
    expect(pts.at(-1)!.month).toBe(51);
    expect(pts.at(-1)!.snowball).toBe(0);
  });
});

describe('share URL after removing a debt (Puru, 2026-11-20)', () => {
  const q = (s: DebtState) => toQuery(s, debtDefaults, debtVariant);

  it('removing debt 3 leaves only rows=2 (no b3=0&r3=0&m3=0)', () => {
    expect(q(removeRow(debtDefaults, 2))).toBe('?rows=2');
  });

  it('removing debt 1 keeps the moved debts and drops the vacated row', () => {
    const query = q(removeRow(debtDefaults, 0));
    expect(query).not.toMatch(/b3=|r3=|m3=/);
    expect(query).toContain('b1=6000');
  });

  it('add then remove leaves a clean URL; in INR too', () => {
    expect(q(removeRow(addRow(debtDefaults), 3))).toBe('');
    const inr = switchDebtCurrency(debtDefaults, 'INR');
    expect(q(removeRow(inr, 2))).toBe('?currency=INR&rows=2');
  });

  it('a hidden row typed earlier never comes back on a currency switch', () => {
    const removed = removeRow({ ...debtDefaults, b3: 4_321 }, 2);
    expect(q(switchDebtCurrency(removed, 'GBP', new Set(['b3'])))).toBe('?currency=GBP&rows=2');
  });
});

describe('content.mdx worked examples match the calculator', () => {
  const mdx = readFileSync(join(__dirname, 'content.mdx'), 'utf8');
  const has = (t: string) => expect(mdx, `content.mdx should contain "${t}"`).toContain(t);

  it('cases 1, 4 and 5', () => {
    const a = plan(run(DEFAULTS, 200));
    [m(a.snowball.totalInterest), m(a.avalanche.totalInterest), m(shownDifference(a.snowball.totalInterest, a.avalanche.totalInterest))].forEach(has);
    const b = plan(run([[3_000, 20, 90], [1_500, 10, 50]], 100));
    [m(b.snowball.totalInterest), m(b.avalanche.totalInterest), m(shownDifference(b.snowball.totalInterest, b.avalanche.totalInterest))].forEach(has);
    const c = plan(run([[50_000, 36, 2_500], [200_000, 14, 6_000], [120_000, 18, 4_000]], 5_000));
    has(m(c.snowball.totalInterest, 'INR'));
  });
});
