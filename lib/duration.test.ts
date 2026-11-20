import { describe, expect, it } from 'vitest';
import { formatDuration, monthsToDuration, plural, yearsToDuration } from './duration';

describe('duration wording (Puru, 2026-11-20)', () => {
  it('drops zero parts: "4 years", not "4 years and 0 months"', () => {
    expect(yearsToDuration(4)).toBe('4 years');
    expect(monthsToDuration(24)).toBe('2 years');
  });

  it('uses the singular for 1', () => {
    expect(yearsToDuration(1)).toBe('1 year');
    expect(monthsToDuration(1)).toBe('1 month');
    expect(monthsToDuration(13)).toBe('1 year and 1 month');
    expect(formatDuration({ days: 1 })).toBe('1 day');
    expect(plural(1, 'week')).toBe('1 week');
  });

  it('years and months together', () => {
    expect(yearsToDuration(3.75)).toBe('3 years and 9 months');
    expect(yearsToDuration(2.857142857)).toBe('2 years and 10 months');
    expect(monthsToDuration(31)).toBe('2 years and 7 months');
  });

  it('months under a year, and rounding into the next year', () => {
    expect(yearsToDuration(0.5)).toBe('6 months');
    expect(yearsToDuration(3.997)).toBe('4 years');
  });

  it('three parts read "a, b and c"; all zero reads "0 months"', () => {
    expect(monthsToDuration(30, 3)).toBe('2 years, 6 months and 3 days');
    expect(monthsToDuration(8, 3)).toBe('8 months and 3 days');
    expect(formatDuration({})).toBe('0 months');
    expect(yearsToDuration(0)).toBe('0 months');
  });

  it('big numbers are grouped', () => {
    expect(plural(1200, 'month')).toBe('1,200 months');
  });
});
