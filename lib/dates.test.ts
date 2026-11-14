import { describe, expect, it } from 'vitest';
import { formatIsoDate } from './dates';

describe('formatIsoDate', () => {
  it('formats ISO dates without timezone shifts', () => {
    expect(formatIsoDate('2026-11-14')).toBe('14 November 2026');
    expect(formatIsoDate('2026-01-01')).toBe('1 January 2026');
  });
  it('returns input when not an ISO date', () => {
    expect(formatIsoDate('soon')).toBe('soon');
  });
});
