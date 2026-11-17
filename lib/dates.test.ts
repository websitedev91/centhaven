import { describe, expect, it } from 'vitest';
import { addDays, formatIsoDate, isoDate, lastPaymentMonth, monthYearAfter } from './dates';

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

describe('addDays (quote valid-until and invoice due dates)', () => {
  it('adds calendar days across months, years and February (hand-checked)', () => {
    expect(addDays('2026-11-18', 30)).toBe('2026-12-18');
    expect(addDays('2026-11-18', 14)).toBe('2026-12-02');
    expect(addDays('2026-12-15', 30)).toBe('2027-01-14');
    expect(addDays('2026-01-31', 30)).toBe('2026-03-02');
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
    expect(addDays('2026-11-18', 0)).toBe('2026-11-18');
  });

  it('returns bad input unchanged', () => {
    expect(addDays('', 5)).toBe('');
    expect(addDays('18/11/2026', 5)).toBe('18/11/2026');
  });

  it('isoDate uses the local calendar date', () => {
    expect(isoDate(new Date(2026, 10, 18, 23, 59))).toBe('2026-11-18');
    expect(isoDate(new Date(2027, 0, 5))).toBe('2027-01-05');
  });
});
