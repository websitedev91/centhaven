import { afterEach, describe, expect, it } from 'vitest';
import { track } from './analytics';

describe('track', () => {
  afterEach(() => {
    delete (globalThis as { window?: unknown }).window;
  });

  it('pushes a GTM custom event to the dataLayer', () => {
    const dataLayer: unknown[] = [];
    (globalThis as { window?: unknown }).window = { dataLayer };
    track('calculate', { tool: 'break-even-calculator' });
    expect(dataLayer).toEqual([{ event: 'calculate', tool: 'break-even-calculator' }]);
  });

  it('does nothing when GTM is not on the page', () => {
    (globalThis as { window?: unknown }).window = {};
    expect(() => track('share_click')).not.toThrow();
  });
});
