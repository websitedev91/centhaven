import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { parseQuery, toQuery } from './url-state';

const schema = z.object({
  currency: z.enum(['USD', 'GBP']),
  amount: z.number().min(0).max(100),
});
const defaults = { currency: 'USD', amount: 10 } as { currency: 'USD' | 'GBP'; amount: number };

describe('url state', () => {
  it('reads valid values and ignores bad ones per field', () => {
    expect(parseQuery('?currency=GBP&amount=50', schema, defaults)).toEqual({ currency: 'GBP', amount: 50 });
    expect(parseQuery('?currency=XYZ&amount=50', schema, defaults)).toEqual({ currency: 'USD', amount: 50 });
    expect(parseQuery('?amount=999', schema, defaults)).toEqual(defaults);
    expect(parseQuery('?amount=abc', schema, defaults)).toEqual(defaults);
  });

  it('writes only non-default values', () => {
    expect(toQuery(defaults, defaults)).toBe('');
    expect(toQuery({ ...defaults, amount: 20 }, defaults)).toBe('?amount=20');
  });

  it('round-trips', () => {
    const s = { currency: 'GBP' as const, amount: 42.5 };
    expect(parseQuery(toQuery(s, defaults), schema, defaults)).toEqual(s);
  });
});
