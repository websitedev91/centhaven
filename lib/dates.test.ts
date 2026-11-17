import { describe, expect, it } from 'vitest';
import { formatIsoDate, lastPaymentMonth, monthYearAfter } from './dates';

describe('formatIsoDate', () => {
  it('formats ISO dates without timezone shifts', () => {
    expect(formatIsoDate('2026-11-14')).toBe('14 November 2026');
    expect(formatIsoDate('2026-01-01')).toBe('1 January 2026');
  });
  it('returns input when not an ISO date', () => {
    expect(formatIsoDate('soon')).toBe('soon');
  });
});

describe('monthYearAfter', () => {
  it('adds months across year ends (hand-checked)', () => {
    expect(monthYearAfter(2026, 10, 0)).toBe('November 2026');
    expect(monthYearAfter(2026, 10, 2)).toBe('January 2027');
    expect(monthYearAfter(2026, 10, 14)).toBe('January 2028');
    expect(monthYearAfter(2026, 10, 15)).toBe('February 2028');
    expect(monthYearAfter(2026, 0, 12)).toBe('January 2027');
    expect(monthYearAfter(2026, 11, 1)).toBe('January 2027');
  });
});

describe('lastPaymentMonth (this month is payment 1)', () => {
  it('14 payments from November 2026 end in December 2027 (hand-checked)', () => {
    expect(lastPaymentMonth(2026, 10, 14)).toBe('December 2027');
    expect(lastPaymentMonth(2026, 10, 1)).toBe('November 2026');
    expect(lastPaymentMonth(2026, 10, 2)).toBe('December 2026');
    expect(lastPaymentMonth(2026, 10, 15)).toBe('January 2028');
  });
});
