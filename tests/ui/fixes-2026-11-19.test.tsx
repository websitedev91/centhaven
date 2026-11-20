// @vitest-environment happy-dom
/**
 * Batch 5 live-test fixes (Puru, 2026-11-19):
 *  - a retyped example value survives a currency switch, and every box shows what the maths uses
 *  - InputNumber drops stale typed text when its value is replaced from outside
 *  - ROAS: "Revenue per $1 spent" label; target ROAS 0 → field error + "—"
 */
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InputNumber } from '@/components/InputNumber';
import CostPerLead from '@/tools/cost-per-lead-calculator/Calculator';
import Roas from '@/tools/roas-calculator/Calculator';

// Each test renders a whole calculator many times; under a full parallel run that can pass 5 s on a busy machine.
vi.setConfig({ testTimeout: 20_000 });

beforeEach(() => window.history.replaceState(null, '', '/'));
afterEach(cleanup);

const resultBox = (root: HTMLElement) => root.querySelector<HTMLElement>('section[aria-live="polite"]')!;
const currency = (root: HTMLElement) => root.querySelector<HTMLSelectElement>('select')!;
const box = (root: HTMLElement, label: string) => {
  const l = [...root.querySelectorAll('label')].find((x) => x.textContent?.startsWith(label))!;
  return root.querySelector<HTMLInputElement>(`#${CSS.escape(l.htmlFor)}`)!;
};
function type(input: HTMLInputElement, text: string, blur = true) {
  fireEvent.focus(input);
  // Clear first, like a person retyping (React ignores a change to the same text).
  if (text !== '') fireEvent.change(input, { target: { value: '' } });
  fireEvent.change(input, { target: { value: text } });
  if (blur) fireEvent.blur(input);
}

describe('cost per lead: retyped example value + currency switch', () => {
  it.each([true, false])('keeps the typed 2,000 in INR, in the box and the maths (blurred: %s)', (blur) => {
    const { container } = render(<CostPerLead />);
    type(box(container, 'Campaign spend'), '2000', blur);
    fireEvent.change(currency(container), { target: { value: 'INR' } });
    expect(box(container, 'Campaign spend').value.replace(/,/g, '')).toBe('2000');
    // 2,000 ÷ 80 leads = ₹25.00 (the INR example would give ₹750.00)
    expect(resultBox(container).textContent).toContain('₹25.00');
    expect(resultBox(container).textContent).not.toContain('₹750.00');
  });

  it('an untouched box follows the currency, and the box shows the new value', () => {
    const { container } = render(<CostPerLead />);
    fireEvent.focus(box(container, 'Campaign spend'));
    fireEvent.change(currency(container), { target: { value: 'INR' } });
    expect(box(container, 'Campaign spend').value.replace(/,/g, '')).toBe('60000');
    expect(resultBox(container).textContent).toContain('₹750.00');
  });
});

describe('InputNumber shows a value replaced from outside', () => {
  function Harness() {
    const [v, setV] = useState(5);
    return (
      <>
        <InputNumber label="Amount" value={v} onChange={setV} />
        <button type="button" onClick={() => setV(99)}>
          replace
        </button>
      </>
    );
  }

  it('drops the typed text (focused, not blurred) when the value changes', () => {
    const { container, getByText } = render(<Harness />);
    const input = container.querySelector('input')!;
    type(input, '7', false);
    expect(input.value).toBe('7');
    fireEvent.click(getByText('replace'));
    expect(input.value).toBe('99');
  });

  it('drops a stale "Enter a number" error too', () => {
    const { container, getByText } = render(<Harness />);
    const input = container.querySelector('input')!;
    type(input, '', false);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    fireEvent.click(getByText('replace'));
    expect(input.value).toBe('99');
    expect(input.getAttribute('aria-invalid')).toBeNull();
  });
});

describe('ROAS fixes', () => {
  it('labels the per-unit row with the currency symbol', () => {
    const { container } = render(<Roas />);
    expect(resultBox(container).textContent).toContain('Revenue per $1 spent');
    fireEvent.change(currency(container), { target: { value: 'INR' } });
    expect(resultBox(container).textContent).toContain('Revenue per ₹1 spent');
  });

  it('revenue needed: target 0 → field error and "—"', () => {
    window.history.replaceState(null, '', '/?mode=needed');
    const { container } = render(<Roas />);
    const target = box(container, 'Target ROAS');
    type(target, '0');
    expect(target.getAttribute('aria-invalid')).toBe('true');
    expect(container.textContent).toContain('Enter a target ROAS above 0');
    expect(resultBox(container).textContent).toContain('—');
    expect(within(resultBox(container)).queryByRole('alert')).not.toBeNull();
  });

  it('an invalid margin (150%) shows its own error, and ROAS still shows', () => {
    const { container } = render(<Roas />);
    const margin = box(container, 'Profit margin');
    type(margin, '150');
    expect(margin.getAttribute('aria-invalid')).toBe('true');
    expect(within(resultBox(container)).queryByRole('alert')).toBeNull();
    expect(resultBox(container).textContent).toContain('5.00x');
  });
});
