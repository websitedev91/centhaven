import { describe, expect, it } from 'vitest';
import { toCsv } from './csv';

describe('toCsv', () => {
  it('writes plain rounded numbers and CRLF lines', () => {
    expect(toCsv(['Year', 'Book value'], [[1, 1100], [2, 700.004]])).toBe('Year,Book value\r\n1,1100\r\n2,700\r\n');
  });

  it('quotes cells with commas, quotes or line breaks', () => {
    expect(toCsv(['a'], [['x, y'], ['say "hi"'], ['plain']])).toBe('a\r\n"x, y"\r\n"say ""hi"""\r\nplain\r\n');
  });
});
