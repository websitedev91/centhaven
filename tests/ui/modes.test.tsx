// @vitest-environment happy-dom
/**
 * Quality gate 8, other modes: calculators.test.tsx drives each calculator in its default mode.
 * Boxes that only appear in another mode (opened here from a share-link query) get the same
 * checks: clear → required "Enter a number" + "—" / optional still valid; 0, negative and huge
 * values never show NaN or Infinity.
 */
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import type { ComponentType } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import AppCost from '@/tools/app-development-cost-calculator/Calculator';
import Meeting from '@/tools/meeting-cost-calculator/Calculator';
import Roas from '@/tools/roas-calculator/Calculator';

afterEach(cleanup);

const BROKEN = /NaN|Infinity|undefined|∞/;

const CASES: [string, ComponentType, string][] = [
  ['roas: revenue needed', Roas, '?mode=needed'],
  ['meeting: rate per person, repeats', Meeting, '?mode=each&rep=repeats'],
  ['meeting: same rate, repeats', Meeting, '?rep=repeats'],
  ['app: one platform, every feature on', AppCost, '?android=0&pay=1&push=1&chat=1&device=1&offline=1&admin=1'],
];

const box = (root: HTMLElement) => root.querySelector<HTMLElement>('section[aria-live="polite"]')!;
const valid = (root: HTMLElement) => within(box(root)).queryByRole('alert') === null;
const dash = (root: HTMLElement) => box(root).textContent!.includes('—') && !valid(root);
const inputs = (root: HTMLElement) => [...root.querySelectorAll<HTMLInputElement>('input[inputmode="decimal"]')].filter((el) => !el.closest('[hidden]'));

function type(input: HTMLInputElement, text: string) {
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: text } });
}

describe.each(CASES)('%s', (_name, Calculator, query) => {
  it('starts valid, and clearing each box behaves', () => {
    window.history.replaceState(null, '', `/${query}`);
    const { container } = render(<Calculator />);
    expect(valid(container)).toBe(true);
    const count = inputs(container).length;
    for (let i = 0; i < count; i++) {
      const el = inputs(container)[i]!;
      const before = el.value;
      type(el, '');
      if (el.hasAttribute('data-optional')) expect(valid(container), `${el.id} optional`).toBe(true);
      else expect(dash(container), `${el.id} required`).toBe(true);
      expect(container.textContent).not.toMatch(BROKEN);
      type(el, before);
      fireEvent.blur(el);
      expect(valid(container)).toBe(true);
    }
  });

  it.each(['0', '-5', '999999999999'])('value %s never breaks the page', (text) => {
    window.history.replaceState(null, '', `/${query}`);
    const { container } = render(<Calculator />);
    const count = inputs(container).length;
    for (let i = 0; i < count; i++) {
      const el = inputs(container)[i]!;
      const before = el.value;
      type(el, text);
      expect(container.textContent).not.toMatch(BROKEN);
      expect(valid(container) || dash(container)).toBe(true);
      type(el, before);
      fireEvent.blur(el);
    }
  });
});

describe('meeting: adding and removing people', () => {
  it('updates the result and never breaks', () => {
    window.history.replaceState(null, '', '/?mode=each');
    const { container, getByText, getByLabelText } = render(<Meeting />);
    const before = box(container).textContent;
    fireEvent.click(getByText('Add a person'));
    expect(box(container).textContent).not.toBe(before);
    fireEvent.click(getByLabelText('Remove person 1'));
    expect(valid(container)).toBe(true);
    expect(container.textContent).not.toMatch(BROKEN);
  });
});

describe('app: unticking every platform', () => {
  it('shows "Choose at least one platform" and "—"', () => {
    window.history.replaceState(null, '', '/?android=0');
    const { container, getByLabelText, getAllByText } = render(<AppCost />);
    fireEvent.click(getByLabelText('iOS'));
    expect(dash(container)).toBe(true);
    expect(getAllByText('Choose at least one platform').length).toBeGreaterThan(0);
  });
});
