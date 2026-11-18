// @vitest-environment happy-dom
/**
 * UI input tests (CLAUDE.md quality gate 8). Every tool's calculator is rendered like a page and
 * driven like a user:
 *  1. clear each number box: required → the box says "Enter a number" and the result shows "—";
 *     optional (data-optional) → a valid result.
 *  2. type 0, a negative and a huge value into each box: no crash, no NaN/Infinity on screen,
 *     and either a valid result or "—" with a message.
 *  3. switch every mode (radio groups) and every select (currency, period…): the output updates.
 * New tools are picked up automatically from tools/<slug>/Calculator.tsx.
 */
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import type { ComponentType } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CURRENCIES, formatMoney, type CurrencyCode } from '@/lib/format';
import { liveTools, registry } from '@/lib/registry';

const modules = import.meta.glob<{ default: ComponentType }>('../../tools/*/Calculator.tsx', { eager: true });
const calculators = Object.entries(modules).map(([path, mod]) => ({
  slug: path.split('/').at(-2)!,
  Calculator: mod.default,
}));

beforeEach(() => {
  window.history.replaceState(null, '', '/');
  window.localStorage.clear();
});
afterEach(cleanup);

/** The live result: ResultCard ("Result") or the generators' total box. */
function resultBox(root: HTMLElement): HTMLElement {
  const box = root.querySelector<HTMLElement>('section[aria-live="polite"]');
  if (!box) throw new Error('no result box found');
  return box;
}

function isDash(root: HTMLElement): boolean {
  const box = resultBox(root);
  return box.textContent!.includes('—') && within(box).queryByRole('alert') !== null;
}

function isValid(root: HTMLElement): boolean {
  const box = resultBox(root);
  return within(box).queryByRole('alert') === null;
}

const BROKEN = /NaN|Infinity|undefined|∞/;

/** Number boxes in the calculator's own form (not the hidden Plan B panel). */
function numberBoxes(root: HTMLElement): HTMLInputElement[] {
  return [...root.querySelectorAll<HTMLInputElement>('input[inputmode="decimal"]')].filter((el) => !el.closest('[hidden]'));
}

function labelOf(input: HTMLInputElement): string {
  return input.getAttribute('aria-label') ?? (input.id ? document.querySelector(`label[for="${input.id}"]`)?.textContent : null) ?? input.id;
}

function type(input: HTMLInputElement, text: string) {
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: text } });
}

function restore(input: HTMLInputElement, text: string) {
  type(input, text);
  fireEvent.blur(input);
}

const tools = new Map(registry.map((t) => [t.slug, t]));

describe('every tool folder has a calculator under test', () => {
  it('covers every live tool', () => {
    const tested = new Set(calculators.map((c) => c.slug));
    for (const t of liveTools()) expect(tested.has(t.slug), t.slug).toBe(true);
  });
});

describe.each(calculators)('$slug', ({ slug, Calculator }) => {
  const isDocument = Boolean(tools.get(slug)?.meta.document);

  it('renders a valid default result with no broken numbers', () => {
    const { container } = render(<Calculator />);
    expect(isValid(container), resultBox(container).textContent!).toBe(true);
    expect(container.textContent).not.toMatch(BROKEN);
  });

  it('clearing a required box shows "Enter a number" and "—"; clearing an optional box keeps a valid result', () => {
    const { container } = render(<Calculator />);
    const boxes = numberBoxes(container);
    expect(boxes.length, 'number boxes found').toBeGreaterThan(0);
    for (let i = 0; i < boxes.length; i++) {
      const box = numberBoxes(container)[i]!;
      const before = box.value;
      const name = labelOf(box);
      type(box, '');
      if (box.hasAttribute('data-optional')) {
        expect(isValid(container), `${name}: optional, empty should still give a result`).toBe(true);
      } else {
        expect(isDash(container), `${name}: required, empty should show "—" and a message`).toBe(true);
        // The box itself is marked invalid (InputNumber says "Enter a number"; slider boxes use the schema message).
        expect(box.getAttribute('aria-invalid'), `${name}: marked invalid`).toBe('true');
      }
      expect(container.textContent, name).not.toMatch(BROKEN);
      restore(box, before);
      expect(isValid(container), `${name}: valid again after restoring "${before}"`).toBe(true);
    }
  });

  it.each([
    ['zero', '0'],
    ['negative', '-5'],
    ['huge', '999999999999'],
  ])('%s values never break the page', (_label, text) => {
    const { container } = render(<Calculator />);
    const count = numberBoxes(container).length;
    for (let i = 0; i < count; i++) {
      const box = numberBoxes(container)[i]!;
      const before = box.value;
      const name = labelOf(box);
      type(box, text);
      expect(container.textContent, `${name} = ${text}`).not.toMatch(BROKEN);
      expect(isValid(container) || isDash(container), `${name} = ${text}: a result or "—" with a message`).toBe(true);
      restore(box, before);
    }
  });

  it('every mode and select option updates the output', () => {
    const { container } = render(<Calculator />);
    const selects = [...container.querySelectorAll<HTMLSelectElement>('select')];
    for (const select of selects) {
      const original = select.value;
      for (const option of [...select.options].map((o) => o.value)) {
        if (option === original) continue;
        const before = container.textContent;
        fireEvent.change(select, { target: { value: option } });
        // USD → CAD or AUD can look identical ("$", same example values): then it only has to stay valid.
        const lookAlike =
          (CURRENCIES as readonly string[]).includes(option) &&
          formatMoney(1234.5, original as CurrencyCode) === formatMoney(1234.5, option as CurrencyCode);
        if (lookAlike) expect(isValid(container) || isDash(container)).toBe(true);
        else expect(container.textContent, `${labelOf(select as unknown as HTMLInputElement)} → ${option}`).not.toBe(before);
        expect(container.textContent).not.toMatch(BROKEN);
        fireEvent.change(select, { target: { value: original } });
      }
    }
    // Radio groups (SegmentedControl modes). The generators' Edit/Preview tabs only switch views on phones.
    const groups = [...container.querySelectorAll('fieldset')].filter(
      (f) => f.querySelector('input[type="radio"]') && !f.querySelector('legend')?.textContent?.startsWith('Edit or preview'),
    );
    for (const group of groups) {
      const radios = [...group.querySelectorAll<HTMLInputElement>('input[type="radio"]')];
      const original = radios.find((r) => r.checked)!;
      for (const radio of radios) {
        if (radio === original) continue;
        const before = container.textContent;
        fireEvent.click(radio);
        expect(container.textContent, `${group.querySelector('legend')?.textContent} → ${radio.value}`).not.toBe(before);
        expect(container.textContent).not.toMatch(BROKEN);
        expect(isValid(container) || isDash(container)).toBe(true);
      }
      fireEvent.click(original);
    }
    if (!isDocument) expect(selects.length + groups.length, 'at least one currency or mode control').toBeGreaterThan(0);
  });
});
