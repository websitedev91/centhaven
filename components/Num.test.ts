import { describe, expect, it } from 'vitest';
import { splitNumber } from './Num';

describe('splitNumber', () => {
  it('marks decimal and grouping separators', () => {
    expect(splitNumber('$86,000.00')).toEqual([
      { text: '$86', sep: false },
      { text: ',', sep: true },
      { text: '000', sep: false },
      { text: '.', sep: true },
      { text: '00', sep: false },
    ]);
  });

  it('handles Indian grouping and plain values', () => {
    expect(splitNumber('₹12,00,000').filter((p) => p.sep)).toHaveLength(2);
    expect(splitNumber('1380')).toEqual([{ text: '1380', sep: false }]);
  });

  it('treats a lone separator character as a separator', () => {
    expect(splitNumber('.')).toEqual([{ text: '.', sep: true }]);
    expect(splitNumber('7')).toEqual([{ text: '7', sep: false }]);
  });
});
