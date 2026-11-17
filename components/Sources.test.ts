import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { formatIsoDate } from '@/lib/dates';
import { DOCUMENT_SOURCES_NOTE, Sources } from './Sources';

describe('Sources', () => {
  it('shows "Rates checked on {verifiedOn} · Source: {link}" for tools that use rates', () => {
    const html = renderToStaticMarkup(
      createElement(Sources, {
        sources: [{ id: 'paypal-uk', url: 'https://www.paypal.com/uk/legalhub/fees', verifiedOn: '2026-11-10', effectiveFrom: '2026-01-01' }],
      }),
    );
    expect(html).toContain(`Rates checked on <time dateTime="2026-11-10">${formatIsoDate('2026-11-10')}</time> · Source:`);
    expect(html).toContain('href="https://www.paypal.com/uk/legalhub/fees"');
    expect(html).toContain('>www.paypal.com</a>');
  });

  it('shows no date for pure-maths tools', () => {
    const html = renderToStaticMarkup(createElement(Sources, { sources: [] }));
    expect(html).toContain('uses only the numbers you enter');
    expect(html).not.toMatch(/checked on|<time/i);
  });

  it('document generators use their own note (Puru, 2026-11-18)', () => {
    const html = renderToStaticMarkup(createElement(Sources, { sources: [], pureMathsNote: DOCUMENT_SOURCES_NOTE }));
    expect(DOCUMENT_SOURCES_NOTE).toBe("This tool only uses what you type. It doesn't use any external rates or fees.");
    expect(html).toContain('This tool only uses what you type.');
  });
});
