import { describe, expect, it } from 'vitest';
import { formatMoney, type CurrencyCode } from '@/lib/format';
import { formatPct } from '@/tools/margin-vs-markup-calculator/calc';
import { UNITS, itemNames, perFor, unitPrices, type Item, type Per } from './calc';
import {
  PRICE_ABOVE_0,
  SIZE_ABOVE_0,
  addRow,
  perOf,
  removeRow,
  switchUnitCurrency,
  toItems,
  unitDefaults,
  unitErrors,
  type UnitState,
} from './schema';

const m = (n: number, c: CurrencyCode = 'USD') => formatMoney(n, c);
const run = (items: Item[], per: Per) => unitPrices(items, per);
const state = (patch: Partial<UnitState>): UnitState => ({ ...unitDefaults, ...patch });

describe('spec test cases', () => {
  it('#1 USD 4.99 / 16 oz vs 7.49 / 32 oz per oz → $0.31 vs $0.23 · Item 2 cheapest · Item 1 33.24% more · saving 24.95%', () => {
    const r = unitPrices(toItems(unitDefaults), perOf(unitDefaults));
    expect(perOf(unitDefaults)).toBe('perOz');
    expect(r.shown.map((x) => m(x))).toEqual(['$0.31', '$0.23']);
    expect(itemNames(r.cheapest)).toBe('Item 2');
    expect(formatPct(r.more[0]!)).toBe('33.24%');
    expect(formatPct(r.saving!.fraction)).toBe('24.95%');
  });

  it('#2 GBP £2.50 / 500 g vs £4.20 / 1 kg per 100 g → £0.50 vs £0.42 · Item 1 19.05% more', () => {
    const s = switchUnitCurrency(unitDefaults, 'GBP');
    const r = unitPrices(toItems(s), perOf(s));
    expect(perOf(s)).toBe('per100g');
    expect(r.shown.map((x) => m(x, 'GBP'))).toEqual(['£0.50', '£0.42']);
    expect(itemNames(r.cheapest)).toBe('Item 2');
    expect(formatPct(r.more[0]!)).toBe('19.05%');
  });

  it('#3 3.00 / 1 lb vs 6.00 / 1 kg per kg → 6.61 vs 6.00 · Item 1 10.23% more', () => {
    const r = run([{ price: 3, quantity: 1, unit: 'lb' }, { price: 6, quantity: 1, unit: 'kg' }], 'perKg');
    expect(r.shown.map((x) => m(x))).toEqual(['$6.61', '$6.00']);
    expect(itemNames(r.cheapest)).toBe('Item 2');
    expect(formatPct(r.more[0]!)).toBe('10.23%');
  });

  it('#4 1.80 / 1.5 l vs 0.65 / 330 ml per l → 1.20 vs 1.97 · Item 1 cheapest · Item 2 64.14% more', () => {
    const r = run([{ price: 1.8, quantity: 1.5, unit: 'l' }, { price: 0.65, quantity: 330, unit: 'ml' }], 'perL');
    expect(r.shown.map((x) => m(x))).toEqual(['$1.20', '$1.97']);
    expect(itemNames(r.cheapest)).toBe('Item 1');
    expect(formatPct(r.more[1]!)).toBe('64.14%');
  });

  it('#5 3.60 / 12 items vs 5.00 / 20 items per item → 0.30 vs 0.25 · Item 1 20% more', () => {
    const r = run([{ price: 3.6, quantity: 12, unit: 'count' }, { price: 5, quantity: 20, unit: 'count' }], 'perItem');
    expect(r.shown.map((x) => m(x))).toEqual(['$0.30', '$0.25']);
    expect(formatPct(r.more[0]!)).toBe('20%');
  });

  it('#6 2.00 / 500 g vs 4.00 / 1 kg → tie, no saving', () => {
    const r = run([{ price: 2, quantity: 500, unit: 'g' }, { price: 4, quantity: 1, unit: 'kg' }], 'per100g');
    expect(itemNames(r.cheapest)).toBe('Items 1 and 2');
    expect(r.saving).toBeNull();
    expect(r.more).toEqual([0, 0]);
  });

  it('#7 2.99 / 64 fl oz (US) vs 1.89 / 1 l per l → 1.58 · Item 1 cheapest · Item 2 19.64% more', () => {
    const r = run([{ price: 2.99, quantity: 64, unit: 'flozUS' }, { price: 1.89, quantity: 1, unit: 'l' }], 'perL');
    expect(m(r.shown[0]!)).toBe('$1.58');
    expect(itemNames(r.cheapest)).toBe('Item 1');
    expect(formatPct(r.more[1]!)).toBe('19.64%');
  });

  it('#8 INR defaults ₹120 / 500 g vs ₹210 / 1 kg per 100 g → ₹24.00 vs ₹21.00 · Item 1 14.29% more', () => {
    const s = switchUnitCurrency(unitDefaults, 'INR');
    const r = unitPrices(toItems(s), perOf(s));
    expect(r.shown.map((x) => m(x, 'INR'))).toEqual(['₹24.00', '₹21.00']);
    expect(formatPct(r.more[0]!)).toBe('14.29%');
  });

  it('#9 Item 1 in g, Item 2 in ml → error on Item 2', () => {
    const e = unitErrors(state({ u1: 'g', u2: 'ml' }));
    expect(e.q2).toBe('Item 1 is a weight: use g, kg, oz or lb');
    expect(unitErrors(state({ u1: 'ml', u2: 'g' })).q2).toBe('Item 1 is a volume: use ml, l or fl oz');
  });

  it('#10 4 items, remove Item 2 → items 3–4 move up; the hidden row is back at its default', () => {
    const four = { ...addRow(addRow(state({}))), p3: 1, q3: 2, p4: 3, q4: 4 };
    const next = removeRow(four, 1);
    expect(next.rows).toBe(3);
    expect([next.p2, next.q2, next.p3, next.q3]).toEqual([1, 2, 3, 4]);
    expect([next.p4, next.q4, next.u4]).toEqual([unitDefaults.p4, unitDefaults.q4, unitDefaults.u4]);
  });

  it('#11 USD → GBP without editing: prices, sizes, units and "per" follow; a typed price is kept', () => {
    const g = switchUnitCurrency(unitDefaults, 'GBP');
    expect([g.p1, g.q1, g.u1, g.p2, g.q2, g.u2, g.per]).toEqual([2.5, 500, 'g', 4.2, 1, 'kg', 'per100g']);
    const typed = switchUnitCurrency(state({ p1: 3.49 }), 'GBP', new Set(['p1']));
    expect(typed.p1).toBe(3.49);
    expect(typed.p2).toBe(4.2);
  });
});

describe('fluid ounces (Puru, 2026-11-21)', () => {
  it('US and UK fl oz use their own definitions, labelled "fl oz (US)" and "fl oz (UK)"', () => {
    expect(UNITS.flozUS).toMatchObject({ factor: 29.5735295625, label: 'fl oz (US)' });
    expect(UNITS.flozUK).toMatchObject({ factor: 28.4130625, label: 'fl oz (UK)' });
  });

  it('1 l vs 33.814 fl oz (US) at the same price ≈ equal: same shown price, counted as a tie', () => {
    const r = run([{ price: 2, quantity: 1, unit: 'l' }, { price: 2, quantity: 33.814, unit: 'flozUS' }], 'perL');
    expect(r.shown.map((x) => m(x))).toEqual(['$2.00', '$2.00']);
    expect(itemNames(r.cheapest)).toBe('Items 1 and 2');
    expect(r.saving).toBeNull();
  });

  it('a UK pint (20 fl oz UK) is not a US pint (16 fl oz US): 568.26 ml vs 473.18 ml', () => {
    expect((20 * UNITS.flozUK.factor).toFixed(2)).toBe('568.26');
    expect((16 * UNITS.flozUS.factor).toFixed(2)).toBe('473.18');
  });
});

describe('edge cases', () => {
  it('price 0 / size 0 → field errors; negatives → field errors', () => {
    expect(unitErrors(state({ p1: 0 })).p1).toBe(PRICE_ABOVE_0);
    expect(unitErrors(state({ q2: 0 })).q2).toBe(SIZE_ABOVE_0);
    expect(unitErrors(state({ p2: -1 })).p2).toBe('Can’t be negative');
  });

  it('"show per" falls back to the kind’s first option; hidden rows never block', () => {
    expect(perFor('volume', 'perOz')).toBe('per100ml');
    expect(perFor('count', 'perKg')).toBe('perItem');
    expect(unitErrors(state({ rows: 2, p3: 0, u4: 'ml' }))).toEqual({});
  });

  it('three items with two tied cheapest → both named, the third gets a % and the saving', () => {
    const r = run(
      [
        { price: 2, quantity: 500, unit: 'g' },
        { price: 4, quantity: 1, unit: 'kg' },
        { price: 3, quantity: 500, unit: 'g' },
      ],
      'per100g',
    );
    expect(itemNames(r.cheapest)).toBe('Items 1 and 2');
    expect(formatPct(r.more[2]!)).toBe('50%');
    expect(r.saving).toMatchObject({ from: 2, to: 0 });
  });

  it('tiny and huge values stay finite', () => {
    const r = run([{ price: 0.01, quantity: 1_000_000, unit: 'kg' }, { price: 1_000_000, quantity: 0.001, unit: 'g' }], 'per100g');
    for (const x of r.shown) expect(m(x)).not.toMatch(/e\+|NaN|Infinity/);
    expect(formatPct(r.more[1]!)).not.toMatch(/e\+|NaN|Infinity/);
  });
});
