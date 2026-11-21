import { describe, expect, it } from 'vitest';
import { formatShort, formatYears, rateToDouble, yearsToDouble } from './calc';
import { RATE_ABOVE_0, YEARS_ABOVE_0, doubleDefaults, doubleErrors, type DoubleState } from './schema';

const pct = (n: number) => `${formatShort(n)}%`;
const errs = (patch: Partial<DoubleState>) => doubleErrors({ ...doubleDefaults, ...patch });

describe('spec test cases', () => {
  it.each([
    [8, '9 years', '9.01 years'],
    [6, '12 years', '11.9 years'],
    [1, '72 years', '69.66 years'],
    [24, '3 years', '3.22 years'],
    [100, '0.72 years', '1 year'],
  ])('years · %s%% → rule %s · exact %s', (rate, rule, exact) => {
    const r = yearsToDouble(rate);
    expect(formatYears(r.rule)).toBe(rule);
    expect(formatYears(r.exact)).toBe(exact);
  });

  it.each([
    [10, '7.2%', '7.18%'],
    [6, '12%', '12.25%'],
    [1, '72%', '100%'],
  ])('rate · %s years → rule %s · exact %s', (years, rule, exact) => {
    const r = rateToDouble(years);
    expect(pct(r.rule)).toBe(rule);
    expect(pct(r.exact)).toBe(exact);
  });
});

describe('edge cases', () => {
  it('defaults: 8% (example only, not a suggestion) and 9 years; no currency', () => {
    expect(doubleDefaults).toEqual({ mode: 'years', rate: 8, years: 9 });
  });

  it('rate 0 or negative → "Enter a rate above 0"; over 1,000 → field error', () => {
    expect(errs({ rate: 0 }).rate).toBe(RATE_ABOVE_0);
    expect(errs({ rate: -5 }).rate).toBe(RATE_ABOVE_0);
    expect(errs({ rate: 1_001 }).rate).toBe('Maximum is 1,000');
  });

  it('years 0 → "Enter years above 0"; the other mode’s box never blocks', () => {
    expect(errs({ mode: 'rate', years: 0 }).years).toBe(YEARS_ABOVE_0);
    expect(errs({ mode: 'rate', rate: 0 })).toEqual({});
    expect(errs({ mode: 'years', years: 0 })).toEqual({});
  });

  it('tiny and huge values stay finite', () => {
    for (const r of [yearsToDouble(0.01), yearsToDouble(1_000), rateToDouble(0.01), rateToDouble(1_000)]) {
      expect(Number.isFinite(r.rule) && Number.isFinite(r.exact)).toBe(true);
      expect(formatShort(r.exact)).not.toMatch(/e\+|NaN|Infinity/);
    }
  });
});
