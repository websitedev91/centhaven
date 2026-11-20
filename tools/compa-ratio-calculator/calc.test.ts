import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatMoney, type CurrencyCode } from '@/lib/format';
import { formatPct } from '@/tools/margin-vs-markup-calculator/calc';
import { compaRatio, formatRatio, midpointOf, position, rangePenetration } from './calc';
import { MAX_ABOVE_MIN, compaDefaults, compaErrors, rangeOf, switchCompaCurrency, type CompaState } from './schema';

const m = (n: number, c: CurrencyCode = 'USD') => formatMoney(n, c);
const inRange = (salary: number, min: number, max: number, own?: number) => {
  const mid = own ?? midpointOf(min, max);
  return {
    mid,
    ratio: compaRatio(salary, mid),
    pen: rangePenetration(salary, min, max),
    pos: position(salary, mid, { min, max }),
    diff: salary - mid,
  };
};

describe('spec test cases', () => {
  it('#1 USD defaults: midpoint 75,000, 0.96 (96%), penetration 40%, 3,000 below the midpoint', () => {
    const r = inRange(72_000, 60_000, 90_000);
    expect(m(r.mid)).toBe('$75,000.00');
    expect(formatRatio(r.ratio)).toBe('0.96');
    expect(formatPct(r.ratio)).toBe('96%');
    expect(formatPct(r.pen)).toBe('40%');
    expect(r.pos).toBe('below-mid');
    expect(m(Math.abs(r.diff))).toBe('$3,000.00');
  });

  it('#2 own midpoint 80,000, salary 88,000 → 1.10 (110%), penetration 93.33%, 8,000 above', () => {
    const r = inRange(88_000, 60_000, 90_000, 80_000);
    expect(formatRatio(r.ratio)).toBe('1.10');
    expect(formatPct(r.ratio)).toBe('110%');
    expect(formatPct(r.pen)).toBe('93.33%');
    expect(r.pos).toBe('above-mid');
    expect(m(r.diff)).toBe('$8,000.00');
  });

  it('#3 95,000 → 1.27 (126.67%), penetration 116.67%, above the top of the range', () => {
    const r = inRange(95_000, 60_000, 90_000);
    expect(formatRatio(r.ratio)).toBe('1.27');
    expect(formatPct(r.ratio)).toBe('126.67%');
    expect(formatPct(r.pen)).toBe('116.67%');
    expect(r.pos).toBe('above-range');
  });

  it('#4 55,000 → 0.73 (73.33%), penetration −16.67%, below the bottom of the range', () => {
    const r = inRange(55_000, 60_000, 90_000);
    expect(formatRatio(r.ratio)).toBe('0.73');
    expect(formatPct(r.ratio)).toBe('73.33%');
    expect(formatPct(r.pen)).toBe('-16.67%');
    expect(r.pos).toBe('below-range');
  });

  it('#5 GBP defaults: midpoint 48,000, 0.94 (93.75%), penetration 31.25%', () => {
    const g = switchCompaCurrency(compaDefaults, 'GBP');
    const r = inRange(g.salary, g.min, g.max);
    expect(m(r.mid, 'GBP')).toBe('£48,000.00');
    expect(formatRatio(r.ratio)).toBe('0.94');
    expect(formatPct(r.ratio)).toBe('93.75%');
    expect(formatPct(r.pen)).toBe('31.25%');
  });

  it('#6 INR defaults: midpoint ₹12,50,000.00, 0.96 (96%), penetration 40%', () => {
    const i = switchCompaCurrency(compaDefaults, 'INR');
    const r = inRange(i.salary, i.min, i.max);
    expect(m(r.mid, 'INR')).toBe('₹12,50,000.00');
    expect(formatRatio(r.ratio)).toBe('0.96');
    expect(formatPct(r.pen)).toBe('40%');
  });

  it('#7 own midpoint with no range → ratio only; penetration asks for the range', () => {
    const s: CompaState = { ...compaDefaults, mid: 'own', min: 0, max: 0 };
    expect(compaErrors(s)).toEqual({});
    expect(rangeOf(s)).toBeNull();
    expect(formatRatio(compaRatio(s.salary, s.midpoint))).toBe('0.96');
  });

  it('#8 range mode, max = min → "Maximum must be above the minimum"', () => {
    expect(compaErrors({ ...compaDefaults, min: 60_000, max: 60_000 }).max).toBe(MAX_ABOVE_MIN);
  });

  it('#9 USD → GBP without editing: all money moves; a typed salary is kept', () => {
    const g = switchCompaCurrency(compaDefaults, 'GBP');
    expect([g.salary, g.min, g.max, g.midpoint]).toEqual([45_000, 40_000, 56_000, 48_000]);
    expect(switchCompaCurrency({ ...compaDefaults, salary: 70_000 }, 'GBP').salary).toBe(70_000);
    expect(switchCompaCurrency(compaDefaults, 'GBP', new Set(['salary'])).salary).toBe(72_000);
  });
});

describe('edge cases', () => {
  const errs = (patch: Partial<CompaState>) => compaErrors({ ...compaDefaults, ...patch });

  it('salary 0 → 0.00 and penetration from the minimum', () => {
    const r = inRange(0, 60_000, 90_000);
    expect(formatRatio(r.ratio)).toBe('0.00');
    expect(formatPct(r.pen)).toBe('-200%');
  });

  it('own midpoint 0 → field error; negatives → field errors', () => {
    expect(errs({ mid: 'own', midpoint: 0 }).midpoint).toBe('Enter a midpoint above 0');
    expect(errs({ salary: -1 }).salary).toBe('Can’t be negative');
  });

  it('own mode: an empty range is fine, a reversed range shows on the maximum', () => {
    expect(errs({ mid: 'own', min: 0, max: 0 })).toEqual({});
    expect(errs({ mid: 'own', min: 90_000, max: 60_000 }).max).toBe(MAX_ABOVE_MIN);
    expect(errs({ mid: 'range', midpoint: Number.NaN })).toEqual({});
  });

  it('exactly at the midpoint', () => {
    expect(position(75_000, 75_000, { min: 60_000, max: 90_000 })).toBe('at-mid');
  });

  it('huge values stay finite', () => {
    expect(formatRatio(compaRatio(1_000_000_000, 0.01))).not.toMatch(/e\+|NaN|Infinity/);
  });
});

describe('content.mdx worked examples match the calculator', () => {
  const mdx = readFileSync(join(__dirname, 'content.mdx'), 'utf8');
  const has = (t: string) => expect(mdx, `content.mdx should contain "${t}"`).toContain(t);

  it('cases 1, 3 and 6', () => {
    const a = inRange(72_000, 60_000, 90_000);
    [m(a.mid), formatRatio(a.ratio), formatPct(a.pen)].forEach(has);
    const b = inRange(95_000, 60_000, 90_000);
    [formatRatio(b.ratio), formatPct(b.pen)].forEach(has);
    const c = inRange(1_200_000, 1_000_000, 1_500_000);
    has(m(c.mid, 'INR'));
  });
});
