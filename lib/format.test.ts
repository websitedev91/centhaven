import { describe, expect, it } from 'vitest';
import { formatMoney, formatNumber, formatPercent, roundTo, currencySymbol, isCurrency } from './format';

describe('roundTo', () => {
  it('rounds half away from zero without float drift', () => {
    expect(roundTo(1.005, 2)).toBe(1.01);
    expect(roundTo(62.318840579, 2)).toBe(62.32);
    expect(roundTo(-2.675, 2)).toBe(-2.68);
    expect(roundTo(0, 2)).toBe(0);
  });
});

describe('formatMoney', () => {
  it('formats per currency locale', () => {
    expect(formatMoney(86000, 'USD')).toBe('$86,000.00');
    expect(formatMoney(1453333.333, 'INR')).toBe('₹14,53,333.33');
    expect(formatMoney(62.3188, 'GBP')).toBe('£62.32');
    expect(formatMoney(10, 'USD', 0)).toBe('$10');
  });
  it('handles non-finite values', () => {
    expect(formatMoney(Number.NaN, 'USD')).toBe('—');
  });
});

describe('formatNumber / formatPercent', () => {
  it('formats numbers and percentages', () => {
    expect(formatNumber(1380)).toBe('1,380');
    expect(formatPercent(0.25)).toBe('25%');
    expect(formatPercent(0.755, 1)).toBe('75.5%');
  });
});

describe('currency helpers', () => {
  it('returns symbols and validates codes', () => {
    expect(currencySymbol('USD')).toBe('$');
    expect(currencySymbol('INR')).toBe('₹');
    expect(isCurrency('EUR')).toBe(true);
    expect(isCurrency('XYZ')).toBe(false);
  });
});

describe('formatMoney below the smallest unit (Puru, 2026-11-19)', () => {
  it('says "less than" in the right currency instead of 0.00', () => {
    expect(formatMoney(0.004, 'USD')).toBe('less than $0.01');
    expect(formatMoney(0.001, 'INR')).toBe('less than ₹0.01');
    expect(formatMoney(0.0049, 'GBP')).toBe('less than £0.01');
    expect(formatMoney(0.3, 'EUR', 0)).toBe('less than €1');
  });

  it('negative tiny values are a loss of less than one unit', () => {
    expect(formatMoney(-0.004, 'USD')).toBe('loss of less than $0.01');
  });

  it('exact zero, float noise and values that round up are unchanged', () => {
    expect(formatMoney(0, 'USD')).toBe('$0.00');
    expect(formatMoney(0.1 + 0.2 - 0.3, 'USD')).toBe('$0.00');
    expect(formatMoney(-1e-12, 'USD')).toBe('$0.00');
    expect(formatMoney(0.005, 'USD')).toBe('$0.01');
  });
});
