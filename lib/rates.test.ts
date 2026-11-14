import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { validateAllRates } from './rates-fs';
import { parseRateFile } from './rates-schema';

const valid = {
  id: 'example-fees',
  effectiveFrom: '2026-08-01',
  verifiedOn: '2026-11-14',
  source: { url: 'https://example.com/fees', quote: 'Standard rate is 2.9% + fixed fee' },
  data: { percent: 2.9 },
};

describe('real /rates files', () => {
  it('every rates file is valid and listed in sources.md', () => {
    expect(() => validateAllRates()).not.toThrow();
  });
});

describe('parseRateFile', () => {
  it('accepts a valid file', () => {
    expect(parseRateFile('example-fees.json', valid).id).toBe('example-fees');
  });

  it.each([
    ['source.url', { ...valid, source: { quote: valid.source.quote } }],
    ['verifiedOn', { ...valid, verifiedOn: undefined }],
    ['effectiveFrom', { ...valid, effectiveFrom: undefined }],
    ['source.quote', { ...valid, source: { url: valid.source.url, quote: '' } }],
    ['http url', { ...valid, source: { ...valid.source, url: 'http://example.com' } }],
    ['bad date', { ...valid, verifiedOn: '14/11/2026' }],
  ])('rejects a file with missing/invalid %s', (_label, json) => {
    expect(() => parseRateFile('example-fees.json', json)).toThrow(/Invalid rates file/);
  });

  it('rejects an id that does not match the file name', () => {
    expect(() => parseRateFile('other.json', valid)).toThrow(/must match file name/);
  });
});

describe('validateAllRates', () => {
  function fixture(sources: string, files: Record<string, unknown>) {
    const root = mkdtempSync(join(tmpdir(), 'ch-rates-'));
    mkdirSync(join(root, 'rates'));
    writeFileSync(join(root, 'sources.md'), sources);
    for (const [name, json] of Object.entries(files)) {
      writeFileSync(join(root, 'rates', name), JSON.stringify(json));
    }
    return root;
  }

  it('fails when a file is not listed in sources.md', () => {
    const root = fixture('# sources\n', { 'example-fees.json': valid });
    expect(() => validateAllRates(root)).toThrow(/not listed in sources.md/);
  });

  it('passes when the file and its URL are listed', () => {
    const root = fixture('| `rates/example-fees.json` | x | https://example.com/fees |', {
      'example-fees.json': valid,
    });
    expect(validateAllRates(root)).toHaveLength(1);
  });
});
