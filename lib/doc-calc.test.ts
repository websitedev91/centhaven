import { describe, expect, it } from 'vitest';
import { docTotals, nextDocNumber } from './doc-calc';
import { roundTo } from './format';

describe('roundTo is float-safe (Puru, 2026-11-18)', () => {
  it('49.995 → 50.00 and 1.005 → 1.01', () => {
    expect(roundTo(49.995, 2)).toBe(50);
    expect(roundTo(1.005, 2)).toBe(1.01);
    expect(roundTo(1.5 * 33.33, 2)).toBe(50);
  });
});

describe('quote spec test cases', () => {
  it('#1 USD: 3 lines, contingency 10%, discount 5% → total 2,476.65', () => {
    const t = docTotals({
      lines: [
        { qty: 10, rate: 75 },
        { qty: 20, rate: 75 },
        { qty: 1, rate: 120 },
      ],
      contingency: 0.1,
      discount: 0.05,
      taxRate: 0,
    });
    expect(t.lineTotals).toEqual([750, 1_500, 120]);
    expect([t.subtotal, t.contingency, t.discount, t.tax, t.total]).toEqual([2_370, 237, 130.35, 0, 2_476.65]);
  });

  it('#2 INR: tax 10% → total 30,250.00', () => {
    const t = docTotals({
      lines: [
        { qty: 1, rate: 15_000 },
        { qty: 1, rate: 8_000 },
        { qty: 3, rate: 1_500 },
      ],
      taxRate: 0.1,
    });
    expect([t.subtotal, t.tax, t.total]).toEqual([27_500, 2_750, 30_250]);
  });

  it('#3 GBP rounding: 1.5 × 33.33 = 49.995 → 50.00; discount 9.00, tax 16.20, total 97.18', () => {
    const t = docTotals({
      lines: [
        { qty: 1.5, rate: 33.33 },
        { qty: 2, rate: 19.99 },
      ],
      discount: 0.1,
      taxRate: 0.2,
    });
    expect(t.lineTotals).toEqual([50, 39.98]);
    expect([t.subtotal, t.discount, t.taxable, t.tax, t.total]).toEqual([89.98, 9, 80.98, 16.2, 97.18]);
  });

  it('#4 qty 0 or no lines → 0, no NaN', () => {
    expect(docTotals({ lines: [{ qty: 0, rate: 75 }] }).total).toBe(0);
    expect(docTotals({ lines: [] })).toMatchObject({ subtotal: 0, total: 0, balance: 0 });
  });

  it('the printed lines always add up to the printed totals', () => {
    const t = docTotals({
      lines: [
        { qty: 0.1, rate: 0.2 },
        { qty: 3, rate: 33.333 },
        { qty: 7, rate: 1.115 },
      ],
      contingency: 0.07,
      discount: 0.033,
      taxRate: 0.175,
    });
    const cents = (n: number) => Math.round(n * 100);
    expect(cents(t.subtotal)).toBe(t.lineTotals.reduce((a, b) => a + cents(b), 0));
    expect(cents(t.total)).toBe(cents(t.subtotal) + cents(t.contingency) - cents(t.discount) + cents(t.tax));
  });
});

describe('invoice spec test cases', () => {
  it('#1 USD: total 2,850.00, paid 1,000 → balance 1,850.00', () => {
    const t = docTotals({ lines: [{ qty: 1, rate: 2_400 }, { qty: 3, rate: 150 }], paid: 1_000 });
    expect([t.subtotal, t.total, t.paid, t.balance]).toEqual([2_850, 2_850, 1_000, 1_850]);
  });

  it('#2 GBP: tax 20% → 209.12, total 1,254.72', () => {
    const t = docTotals({ lines: [{ qty: 12.5, rate: 80 }, { qty: 1, rate: 45.6 }], taxRate: 0.2 });
    expect([t.subtotal, t.tax, t.total, t.balance]).toEqual([1_045.6, 209.12, 1_254.72, 1_254.72]);
  });

  it('#3 INR: discount 10%, tax 5%, paid in full → balance 0', () => {
    const t = docTotals({ lines: [{ qty: 2, rate: 25_000 }], discount: 0.1, taxRate: 0.05, paid: 47_250 });
    expect([t.discount, t.taxable, t.tax, t.total, t.balance]).toEqual([5_000, 45_000, 2_250, 47_250, 0]);
  });
});

describe('nextDocNumber (spec shared rule 3)', () => {
  it.each([
    ['Q-0001', 'Q-0002'],
    ['Q-0099', 'Q-0100'],
    ['Q-9999', 'Q-10000'],
    ['2026-014', '2026-015'],
    ['INV-0001', 'INV-0002'],
    ['INV-0099', 'INV-0100'],
    ['Q-7', 'Q-8'],
    ['INV-12/A', 'INV-13/A'],
    ['ABC', 'ABC-2'],
    ['  Q-0003 ', 'Q-0004'],
  ])('%s → %s', (current, next) => {
    expect(nextDocNumber(current, 'Q-0001')).toBe(next);
  });

  it('empty → the default number', () => {
    expect(nextDocNumber('', 'Q-0001')).toBe('Q-0001');
    expect(nextDocNumber('   ', 'INV-0001')).toBe('INV-0001');
  });
});
