import { describe, expect, it } from 'vitest';
import { formatMoney, type CurrencyCode } from '@/lib/format';
import { formatPct } from '@/tools/margin-vs-markup-calculator/calc';
import { rentSplit, splitCents } from './calc';
import {
  INCOME_NEEDED,
  ROOM_ABOVE_0,
  addRow,
  removeRow,
  splitDefaults,
  splitErrors,
  switchSplitCurrency,
  toCalcInput,
  type SplitState,
} from './schema';

const m = (n: number, c: CurrencyCode = 'USD') => formatMoney(n, c);
const state = (patch: Partial<SplitState>): SplitState => ({ ...splitDefaults, ...patch });
const run = (patch: Partial<SplitState>) => rentSplit(toCalcInput(state(patch)));
const rents = (r: ReturnType<typeof rentSplit>, c: CurrencyCode = 'USD') => r.people.map((p) => m(p.rent, c));
const totals = (r: ReturnType<typeof rentSplit>, c: CurrencyCode = 'USD') => r.people.map((p) => m(p.total, c));
const sumCents = (xs: number[]) => xs.reduce((a, b) => a + Math.round(b * 100), 0);

describe('spec test cases', () => {
  it('#1 equal · 3 people · 2,400 + bills 300 → 800.00 + 100.00 = 900.00 each · 33.33%', () => {
    const r = run({ mode: 'equal', rent: 2_400, bills: 300 });
    expect(rents(r)).toEqual(['$800.00', '$800.00', '$800.00']);
    expect(r.people.map((p) => m(p.bills))).toEqual(['$100.00', '$100.00', '$100.00']);
    expect(totals(r)).toEqual(['$900.00', '$900.00', '$900.00']);
    expect(formatPct(r.people[0]!.fraction)).toBe('33.33%');
    expect(m(r.total)).toBe('$2,700.00');
  });

  it('#2 room 150 / 120 / 90 · bills equally → 1,000 / 800 / 600 · totals 1,100 / 900 / 700 · 41.67% / 33.33% / 25%', () => {
    const r = run({ mode: 'room', billSplit: 'equal' });
    expect(rents(r)).toEqual(['$1,000.00', '$800.00', '$600.00']);
    expect(totals(r)).toEqual(['$1,100.00', '$900.00', '$700.00']);
    expect(r.people.map((p) => formatPct(p.fraction))).toEqual(['41.67%', '33.33%', '25%']);
  });

  it('#3 room · bills the same way as rent → bills 125 / 100 / 75 · totals 1,125 / 900 / 675', () => {
    const r = run({ mode: 'room', billSplit: 'rent' });
    expect(r.people.map((p) => m(p.bills))).toEqual(['$125.00', '$100.00', '$75.00']);
    expect(totals(r)).toEqual(['$1,125.00', '$900.00', '$675.00']);
  });

  it('#4 income 4,000 / 3,000 / 3,000 · bills same way as rent → 40/30/30 · 960/720/720 · totals 1,080/810/810', () => {
    const r = run({ mode: 'income', billSplit: 'rent' });
    expect(r.people.map((p) => formatPct(p.incomeShare!))).toEqual(['40%', '30%', '30%']);
    expect(rents(r)).toEqual(['$960.00', '$720.00', '$720.00']);
    expect(r.people.map((p) => m(p.bills))).toEqual(['$120.00', '$90.00', '$90.00']);
    expect(totals(r)).toEqual(['$1,080.00', '$810.00', '$810.00']);
  });

  it('#5 INR income defaults · ₹30,000 · bills ₹4,500 equally → ₹12,000 / ₹9,000 / ₹9,000 · totals ₹13,500 / ₹10,500 / ₹10,500', () => {
    const s = switchSplitCurrency(state({ mode: 'income', billSplit: 'equal' }), 'INR');
    expect([s.rent, s.bills, s.i1, s.i2, s.i3]).toEqual([30_000, 4_500, 60_000, 45_000, 45_000]);
    const r = rentSplit(toCalcInput(s));
    expect(rents(r, 'INR')).toEqual(['₹12,000.00', '₹9,000.00', '₹9,000.00']);
    expect(r.people.map((p) => m(p.bills, 'INR'))).toEqual(['₹1,500.00', '₹1,500.00', '₹1,500.00']);
    expect(totals(r, 'INR')).toEqual(['₹13,500.00', '₹10,500.00', '₹10,500.00']);
  });

  it('#6 equal · 6 people · 3,000 → 500.00 each, nothing left over', () => {
    const r = run({ mode: 'equal', rows: 6, rent: 3_000, bills: 0 });
    expect(rents(r)).toEqual(Array(6).fill('$500.00'));
    expect(r.leftoverCents).toBe(0);
  });

  it('#7 income 4,000 / 0 / 4,000 · 2,400 → 1,200 / 0.00 / 1,200', () => {
    const r = run({ mode: 'income', i1: 4_000, i2: 0, i3: 4_000, bills: 0 });
    expect(rents(r)).toEqual(['$1,200.00', '$0.00', '$1,200.00']);
  });
});

describe('shares add up exactly (Puru, 2026-11-21): round down to the cent, leftover cents to Person 1, 2, …', () => {
  it('1,000 ÷ 3 → 333.34 / 333.33 / 333.33', () => {
    const r = run({ mode: 'equal', rent: 1_000, bills: 0 });
    expect(rents(r)).toEqual(['$333.34', '$333.33', '$333.33']);
    expect(sumCents(r.people.map((p) => p.rent))).toBe(100_000);
    expect(r.leftoverCents).toBe(1);
  });

  it('6 people · 1,000 → 166.67 × 4 and 166.66 × 2 (4 leftover cents to Persons 1–4)', () => {
    const r = run({ mode: 'equal', rows: 6, rent: 1_000, bills: 0 });
    expect(rents(r)).toEqual(['$166.67', '$166.67', '$166.67', '$166.67', '$166.66', '$166.66']);
    expect(sumCents(r.people.map((p) => p.rent))).toBe(100_000);
  });

  it('INR ₹25,000 ÷ 3 → ₹8,333.34 / ₹8,333.33 / ₹8,333.33', () => {
    const r = rentSplit(toCalcInput(state({ mode: 'equal', currency: 'INR', rent: 25_000, bills: 0 })));
    expect(rents(r, 'INR')).toEqual(['₹8,333.34', '₹8,333.33', '₹8,333.33']);
  });

  it('INR 6 people · ₹1,00,000 + bills ₹5,000 → rent ₹16,666.67 × 4 / ₹16,666.66 × 2 · bills ₹833.34 × 2 / ₹833.33 × 4', () => {
    const r = rentSplit(toCalcInput(state({ mode: 'equal', currency: 'INR', rows: 6, rent: 100_000, bills: 5_000 })));
    expect(rents(r, 'INR')).toEqual(['₹16,666.67', '₹16,666.67', '₹16,666.67', '₹16,666.67', '₹16,666.66', '₹16,666.66']);
    expect(r.people.map((p) => m(p.bills, 'INR'))).toEqual(['₹833.34', '₹833.34', '₹833.33', '₹833.33', '₹833.33', '₹833.33']);
    expect(sumCents(r.people.map((p) => p.total))).toBe(10_500_000);
    expect(m(r.total, 'INR')).toBe('₹1,05,000.00');
  });

  it('room sizes that don’t divide evenly still add up: 1,000 by 1 / 1 / 1 sq ft → 333.34 / 333.33 / 333.33', () => {
    const r = run({ mode: 'room', rent: 1_000, bills: 0, s1: 1, s2: 1, s3: 1 });
    expect(rents(r)).toEqual(['$333.34', '$333.33', '$333.33']);
  });

  it('a person whose share is 0 never gets a leftover cent', () => {
    const { cents } = splitCents(100, [0, 1 / 3, 2 / 3]);
    expect(cents[0]).toBe(0);
    expect(cents.reduce((a, b) => a + b, 0)).toBe(100);
  });
});

describe('shared space (Puru, 2026-11-21)', () => {
  it('2,400 rent, 25% shared, rooms 150 / 120 / 90 → 200 each shared + 1,800 by size (750 / 600 / 450) → 950 / 800 / 650', () => {
    const r = run({ mode: 'room', rent: 2_400, shared: 25, bills: 0 });
    expect(m(r.sharedPart!)).toBe('$600.00');
    expect(m(r.roomPart!)).toBe('$1,800.00');
    expect(rents(r)).toEqual(['$950.00', '$800.00', '$650.00']);
  });

  it('0% = off (pure room size); 100% = everyone pays the same; only room mode uses it', () => {
    expect(run({ mode: 'room', shared: 0 }).sharedPart).toBeNull();
    expect(rents(run({ mode: 'room', shared: 100, bills: 0 }))).toEqual(['$800.00', '$800.00', '$800.00']);
    expect(rents(run({ mode: 'income', shared: 50, bills: 0 }))).toEqual(['$960.00', '$720.00', '$720.00']);
    expect(splitErrors(state({ mode: 'room', shared: 101 })).shared).toBe('Maximum is 100%');
  });
});

describe('rows, currency and edge cases', () => {
  it('#8 4 people, remove Person 2 → later rows move up, rows = 3, the hidden row is back at its default', () => {
    const four = addRow(state({ mode: 'income', i1: 5_000, i2: 1_000, i3: 2_000 }));
    const s = { ...four, i4: 7_000 };
    const next = removeRow(s, 1);
    expect(next.rows).toBe(3);
    expect([next.i1, next.i2, next.i3]).toEqual([5_000, 2_000, 7_000]);
    expect(next.i4).toBe(splitDefaults.i4);
    expect(next.s4).toBe(splitDefaults.s4);
  });

  it('never fewer than 2 or more than 6 people', () => {
    expect(removeRow(state({ rows: 2 }), 0).rows).toBe(2);
    expect(addRow(state({ rows: 6 })).rows).toBe(6);
  });

  it('#9 USD → INR without editing: rent, bills and incomes move, room sizes stay; a typed rent is kept', () => {
    const i = switchSplitCurrency(splitDefaults, 'INR');
    expect([i.rent, i.bills, i.i1, i.s1, i.s2, i.s3]).toEqual([30_000, 4_500, 60_000, 150, 120, 90]);
    const typed = switchSplitCurrency(state({ rent: 2_000 }), 'INR', new Set(['rent']));
    expect(typed.rent).toBe(2_000);
    expect(typed.bills).toBe(4_500);
  });

  it('room size 0 → field error; all incomes 0 → error on Person 1; negatives → field errors', () => {
    expect(splitErrors(state({ mode: 'room', s2: 0 })).s2).toBe(ROOM_ABOVE_0);
    expect(splitErrors(state({ mode: 'income', i1: 0, i2: 0, i3: 0 })).i1).toBe(INCOME_NEEDED);
    expect(splitErrors(state({ rent: -1 })).rent).toBe('Can’t be negative');
    // Hidden rows and other modes' boxes never block.
    expect(splitErrors(state({ mode: 'equal', s1: 0, i1: -1 }))).toEqual({});
    expect(splitErrors(state({ mode: 'room', rows: 3, s5: 0 }))).toEqual({});
  });

  it('rent 0 → 0.00 everywhere (valid); huge values stay finite', () => {
    expect(splitErrors(state({ rent: 0 }))).toEqual({});
    expect(totals(run({ rent: 0, bills: 0 }))).toEqual(['$0.00', '$0.00', '$0.00']);
    const r = run({ mode: 'income', rent: 1_000_000_000, bills: 1_000_000_000, i1: 1_000_000_000, i2: 1, i3: 1 });
    expect(sumCents(r.people.map((p) => p.total))).toBe(200_000_000_000);
    for (const p of r.people) expect(m(p.total)).not.toMatch(/e\+|NaN|Infinity/);
  });
});
