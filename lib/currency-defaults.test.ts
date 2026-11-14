import { describe, expect, it } from 'vitest';
import { defaultsForCurrency, switchCurrency, type CurrencyPresets } from './currency-defaults';
import type { CurrencyCode } from './format';

type S = { currency: CurrencyCode; amount: number; rate: number; other: number };
const base: S = { currency: 'USD', amount: 100, rate: 5, other: 1 };
const presets: CurrencyPresets<S> = {
  USD: { amount: 100, rate: 5 },
  CAD: { amount: 100, rate: 5 },
  AUD: { amount: 100, rate: 5 },
  GBP: { amount: 80, rate: 5 },
  EUR: { amount: 80, rate: 5 },
  INR: { amount: 8000, rate: 2 },
};

describe('currency defaults pattern', () => {
  it('merges presets into the base defaults', () => {
    expect(defaultsForCurrency(base, presets, 'INR')).toEqual({ currency: 'INR', amount: 8000, rate: 2, other: 1 });
  });

  it('moves untouched fields to the new currency defaults', () => {
    expect(switchCurrency(base, 'INR', base, presets)).toEqual({ currency: 'INR', amount: 8000, rate: 2, other: 1 });
  });

  it('keeps fields the user edited', () => {
    const edited = { ...base, amount: 250 };
    expect(switchCurrency(edited, 'INR', base, presets)).toEqual({ currency: 'INR', amount: 250, rate: 2, other: 1 });
  });

  it('never touches fields without presets', () => {
    const edited = { ...base, other: 9 };
    expect(switchCurrency(edited, 'GBP', base, presets).other).toBe(9);
  });

  it('chains across several switches and back', () => {
    const inr = switchCurrency(base, 'INR', base, presets);
    const gbp = switchCurrency(inr, 'GBP', base, presets);
    expect(gbp).toEqual({ currency: 'GBP', amount: 80, rate: 5, other: 1 });
    expect(switchCurrency(gbp, 'USD', base, presets)).toEqual(base);
  });

  it('is a no-op for the same currency', () => {
    const s = { ...base, amount: 1 };
    expect(switchCurrency(s, 'USD', base, presets)).toBe(s);
  });
});
