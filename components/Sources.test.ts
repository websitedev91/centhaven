import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DOCUMENT_SOURCES_NOTE, Sources } from './Sources';

describe('Sources', () => {
  it('pure-maths tools say they use only the numbers you enter, with no date or link', () => {
    const html = renderToStaticMarkup(createElement(Sources));
    expect(html).toContain('uses only the numbers you enter');
    expect(html).not.toMatch(/checked on|<time|<a /i);
  });

  it('document generators use their own note (Puru, 2026-11-18)', () => {
    const html = renderToStaticMarkup(createElement(Sources, { note: DOCUMENT_SOURCES_NOTE }));
    expect(DOCUMENT_SOURCES_NOTE).toBe("This tool only uses what you type. It doesn't use any external rates or fees.");
    expect(html).toContain('This tool only uses what you type.');
  });
});
