import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AnimatedNumber } from './AnimatedNumber';

describe('AnimatedNumber accessibility', () => {
  it('exposes the value once: one sr-only copy, the visible digits aria-hidden', () => {
    const html = renderToStaticMarkup(createElement(AnimatedNumber, { value: '$62.32' }));
    expect(html.match(/class="sr-only">\$62\.32</g)).toHaveLength(1);
    // Everything after the sr-only copy is inside one aria-hidden wrapper.
    const visible = html.slice(html.indexOf('</span>') + '</span>'.length);
    expect(visible.startsWith('<span aria-hidden="true">')).toBe(true);
    expect(visible.replace(/<[^>]+>/g, '')).toBe('$62.32');
  });
});

describe('spaces in animated values', () => {
  it('keep their width ("Not burning", not "Notburning")', () => {
    const html = renderToStaticMarkup(createElement(AnimatedNumber, { value: 'Not burning' }));
    expect(html).toContain(' ');
  });
});
