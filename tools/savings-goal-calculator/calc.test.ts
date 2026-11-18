import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatMoney, roundTo, type CurrencyCode } from '@/lib/format';
import { NEED_MONTHS, savingsGoal, savingsPath, type SavingsGoalError, type SavingsGoalResult } from './calc';
import { fieldErrors, savingsGoalDefaults, savingsGoalSchema, switchSavingsGoalCurrency, toCalcInput } from './schema';

function ok(r: SavingsGoalResult | SavingsGoalError): SavingsGoalResult {
  if (!r.ok) throw new Error(`expected a result, got: ${r.error}`);
  return r;
}
const r2 = (n: number) => roundTo(n, 2);
/** rate as the UI holds it (4 = 4%). */
const run = (goal: number, saved: number, months: number, rate = 0) => ok(savingsGoal(toCalcInput({ goal, saved, months, rate })));

describe('spec test cases', () => {
  it('#1 $10,000 · 0 saved · 24 months · 0% → $416.67 a month, contributions $10,000', () => {
    const r = run(10_000, 0, 24);
    expect(r2(r.monthly)).toBe(416.67);
    expect(r2(r.contributions)).toBe(10_000);
  });

  it('#2 $10,000 · $2,000 saved · 12 months · 0% → $666.67 a month', () => {
    expect(r2(run(10_000, 2_000, 12).monthly)).toBe(666.67);
  });

  it('#3 $10,000 · 0 · 24 months · 4% → $400.92, contributions $9,621.98, interest $378.02', () => {
    const r = run(10_000, 0, 24, 4);
    expect(r2(r.monthly)).toBe(400.92);
    expect(r2(r.contributions)).toBe(9_621.98);
    expect(r2(r.interest)).toBe(378.02);
  });

  it('#4 $20,000 · $5,000 · 36 months · 5% → grows to $5,807.36, $366.23 a month, contributions $13,184.28, interest $1,815.72', () => {
    const r = run(20_000, 5_000, 36, 5);
    expect(r2(r.savedGrows)).toBe(5_807.36);
    expect(r2(r.monthly)).toBe(366.23);
    expect(r2(r.contributions)).toBe(13_184.28);
    expect(r2(r.interest)).toBe(1_815.72);
  });

  it('#5 ₹5,00,000 · ₹1,00,000 · 20 months · 0% → ₹20,000 a month', () => {
    expect(r2(run(500_000, 100_000, 20).monthly)).toBe(20_000);
  });
});

describe('edge cases', () => {
  it('already saved ≥ goal → 0 a month, reached', () => {
    const r = run(10_000, 12_000, 12);
    expect(r.monthly).toBe(0);
    expect(r.reached).toBe(true);
  });

  it('savings that grow past the goal with interest also count as reached', () => {
    expect(run(10_000, 9_900, 24, 5).reached).toBe(true);
  });

  it('months below 1 → error, no divide by zero', () => {
    expect(savingsGoal({ goal: 1_000, saved: 0, months: 0, rate: 0 })).toEqual({ ok: false, error: NEED_MONTHS });
  });

  it.each([
    ['goal', 0],
    ['saved', -1],
    ['months', 0],
    ['rate', -1],
    ['rate', 21],
  ] as const)('%s = %s → field error', (key, value) => {
    expect(fieldErrors(savingsGoalSchema, { ...savingsGoalDefaults, [key]: value })[key]).toBeDefined();
  });

  it('the chart path starts at what you have and ends at the goal (≤ 61 points)', () => {
    const input = toCalcInput({ goal: 50_000, saved: 5_000, months: 360, rate: 5 });
    const r = ok(savingsGoal(input));
    const path = savingsPath(input, r.monthly);
    expect(path[0]).toEqual({ month: 0, value: 5_000 });
    expect(path.at(-1)!.month).toBe(360);
    expect(r2(path.at(-1)!.value)).toBe(50_000);
    expect(path.length).toBeLessThanOrEqual(61);
  });
});

describe('currency defaults', () => {
  it('untouched goal follows the currency; a typed goal is kept; interest stays 0', () => {
    expect(switchSavingsGoalCurrency(savingsGoalDefaults, 'INR')).toMatchObject({ goal: 500_000, rate: 0 });
    expect(switchSavingsGoalCurrency({ ...savingsGoalDefaults, goal: 8_000 }, 'INR')).toMatchObject({ goal: 8_000 });
  });
});

describe('content.mdx worked examples match the calculator', () => {
  const mdx = readFileSync(join(__dirname, 'content.mdx'), 'utf8');
  const has = (t: string) => expect(mdx, `content.mdx should contain "${t}"`).toContain(t);
  const m = (n: number, c: CurrencyCode = 'USD') => formatMoney(n, c);

  it('Lena, Ravi, Sam and Arjun', () => {
    has(m(run(10_000, 0, 24).monthly));
    has(m(run(10_000, 2_000, 12).monthly));
    has(m(run(10_000, 0, 12).monthly - run(10_000, 2_000, 12).monthly));
    const lena = run(10_000, 0, 24, 4);
    [m(lena.monthly), m(lena.contributions), m(lena.interest)].forEach(has);
    const sam = run(20_000, 5_000, 36, 5);
    [m(sam.savedGrows), m(sam.monthly), m(sam.interest)].forEach(has);
    has(m(run(500_000, 100_000, 20).monthly, 'INR'));
  });
});
