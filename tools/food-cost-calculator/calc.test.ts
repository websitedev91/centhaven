import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatMoney, type CurrencyCode } from '@/lib/format';
import { formatPct } from '@/tools/margin-vs-markup-calculator/calc';
import { dishFoodCost, menuPrice, periodFoodCost } from './calc';
import { foodCostDefaults, foodCostErrors, switchFoodCostCurrency, type FoodCostState } from './schema';

const m = (n: number, c: CurrencyCode = 'USD') => formatMoney(n, c);

describe('spec test cases', () => {
  it('#1 3.50 / 12.00 → 29.17%, gross profit 8.50', () => {
    const r = dishFoodCost(3.5, 12);
    expect(formatPct(r.pct)).toBe('29.17%');
    expect(m(r.profit)).toBe('$8.50');
  });

  it('#2 4.00 at 32% → menu price 12.50, gross profit 8.50', () => {
    const r = menuPrice(4, 0.32);
    expect(m(r.price)).toBe('$12.50');
    expect(m(r.profit)).toBe('$8.50');
  });

  it('#3 period: 4,000 + 12,000 − 3,500 = 12,500 ÷ 40,000 → 31.25%', () => {
    const r = periodFoodCost(4_000, 12_000, 3_500, 40_000);
    expect(m(r.used)).toBe('$12,500.00');
    expect(formatPct(r.pct)).toBe('31.25%');
  });

  it('the USD defaults give cases 1 and 3; the target default is 32%', () => {
    const d = foodCostDefaults;
    expect(formatPct(dishFoodCost(d.cost, d.price).pct)).toBe('29.17%');
    expect(formatPct(periodFoodCost(d.open, d.buy, d.close, d.sales).pct)).toBe('31.25%');
    expect(d.target).toBe(32);
  });

  it('#4 INR ₹90 / ₹300 → 30%, ₹210.00', () => {
    const r = dishFoodCost(90, 300);
    expect(formatPct(r.pct)).toBe('30%');
    expect(m(r.profit, 'INR')).toBe('₹210.00');
  });

  it('#5 INR ₹120 at 32% → ₹375.00', () => {
    expect(m(menuPrice(120, 0.32).price, 'INR')).toBe('₹375.00');
  });

  it('#6 6.00 / 5.00 → 120%, gross profit −1.00', () => {
    const r = dishFoodCost(6, 5);
    expect(formatPct(r.pct)).toBe('120%');
    expect(m(r.profit)).toBe('-$1.00');
  });

  it('#7 period: closing 20,000 (> 16,000) → field error', () => {
    expect(foodCostErrors({ ...foodCostDefaults, mode: 'period', close: 20_000 }).close).toBe(
      'Closing inventory can’t be more than opening inventory plus purchases',
    );
  });

  it('#8 USD → INR without editing: money moves, the target stays; a typed value is kept', () => {
    const i = switchFoodCostCurrency(foodCostDefaults, 'INR');
    expect([i.cost, i.price, i.open, i.buy, i.close, i.sales, i.target]).toEqual([90, 300, 100_000, 300_000, 80_000, 1_000_000, 32]);
    expect(switchFoodCostCurrency({ ...foodCostDefaults, cost: 4.25 }, 'INR').cost).toBe(4.25);
    expect(switchFoodCostCurrency(foodCostDefaults, 'INR', new Set(['cost'])).cost).toBe(3.5);
  });
});

describe('edge cases', () => {
  const errs = (patch: Partial<FoodCostState>) => foodCostErrors({ ...foodCostDefaults, ...patch });

  it('cost 0 → 0% (valid); price 0, target 0, sales 0 → field errors', () => {
    expect(errs({ cost: 0 })).toEqual({});
    expect(formatPct(dishFoodCost(0, 12).pct)).toBe('0%');
    expect(errs({ price: 0 }).price).toBe('Enter a menu price above 0');
    expect(errs({ mode: 'price', target: 0 }).target).toBe('Enter a target above 0');
    expect(errs({ mode: 'period', sales: 0 }).sales).toBe('Enter food sales above 0');
  });

  it('target 100% → price = cost, profit 0 (valid); over 100 → field error', () => {
    expect(errs({ mode: 'price', target: 100 })).toEqual({});
    expect(menuPrice(4, 1).profit).toBe(0);
    expect(errs({ mode: 'price', target: 101 }).target).toBe('Maximum is 100%');
  });

  it('negatives → field errors; hidden boxes never block', () => {
    expect(errs({ cost: -1 }).cost).toBe('Can’t be negative');
    expect(errs({ mode: 'period', price: Number.NaN, cost: Number.NaN })).toEqual({});
    expect(errs({ mode: 'percent', sales: 0, close: 99_999 })).toEqual({});
  });

  it('huge values stay finite', () => {
    expect(m(menuPrice(1_000_000, 0.0001).price)).not.toMatch(/e\+|NaN|Infinity/);
  });
});

describe('content.mdx worked examples match the calculator', () => {
  const mdx = readFileSync(join(__dirname, 'content.mdx'), 'utf8');
  const has = (t: string) => expect(mdx, `content.mdx should contain "${t}"`).toContain(t);

  it('cases 1, 2, 3 and the INR case', () => {
    const a = dishFoodCost(3.5, 12);
    [formatPct(a.pct), m(a.profit)].forEach(has);
    has(m(menuPrice(4, 0.32).price));
    const c = periodFoodCost(4_000, 12_000, 3_500, 40_000);
    [m(c.used), formatPct(c.pct)].forEach(has);
    has(m(menuPrice(120, 0.32).price, 'INR'));
  });
});
