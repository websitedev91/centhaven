// @vitest-environment happy-dom
/**
 * Quality gate 8, other modes: calculators.test.tsx drives each calculator in its default mode.
 * Boxes that only appear in another mode (opened here from a share-link query) get the same
 * checks: clear → required "Enter a number" + "—" / optional still valid; 0, negative and huge
 * values never show NaN or Infinity.
 */
import { cleanup, fireEvent, render, waitFor, within } from '@testing-library/react';
import type { ComponentType } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AppCost from '@/tools/app-development-cost-calculator/Calculator';
import Meeting from '@/tools/meeting-cost-calculator/Calculator';
import Roas from '@/tools/roas-calculator/Calculator';
import Margin from '@/tools/margin-vs-markup-calculator/Calculator';
import Cpc from '@/tools/cpc-calculator/Calculator';
import Biweekly from '@/tools/biweekly-pay-calculator/Calculator';
import Payback from '@/tools/payback-period-calculator/Calculator';
import Debt from '@/tools/debt-snowball-calculator/Calculator';
import ConversionRate from '@/tools/conversion-rate-calculator/Calculator';
import FoodCost from '@/tools/food-cost-calculator/Calculator';
import WeeklyPay from '@/tools/weekly-pay-calculator/Calculator';
import Budget from '@/tools/50-30-20-budget-calculator/Calculator';
import Compa from '@/tools/compa-ratio-calculator/Calculator';
import Bonus from '@/tools/bonus-calculator/Calculator';
import PartTime from '@/tools/part-time-salary-calculator/Calculator';
import RuleOf72 from '@/tools/rule-of-72-calculator/Calculator';
import RentSplit from '@/tools/rent-split-calculator/Calculator';
import CurrentRatio from '@/tools/current-ratio-calculator/Calculator';
import BackPay from '@/tools/back-pay-calculator/Calculator';
import SavingsRate from '@/tools/savings-rate-calculator/Calculator';
import UnitPrice from '@/tools/unit-price-calculator/Calculator';
import Wedding from '@/tools/wedding-budget-calculator/Calculator';
import Margin2 from '@/tools/contribution-margin-calculator/Calculator';

// Each test renders a whole calculator many times; under a full parallel run that can pass 5 s on a busy machine.
vi.setConfig({ testTimeout: 20_000 });

afterEach(cleanup);

const BROKEN = /NaN|Infinity|undefined|∞/;

const CASES: [string, ComponentType, string][] = [
  ['roas: revenue needed', Roas, '?mode=needed'],
  ['meeting: rate per person, repeats', Meeting, '?mode=each&rep=repeats'],
  ['meeting: same rate, repeats', Meeting, '?rep=repeats'],
  ['app: one platform, every feature on', AppCost, '?android=0&pay=1&push=1&chat=1&device=1&offline=1&admin=1'],
  ['margin: find a price from a markup', Margin, '?mode=find&by=markup'],
  ['margin: find a price from a margin', Margin, '?mode=find'],
  ['margin: convert a margin', Margin, '?mode=convert'],
  ['margin: convert a markup', Margin, '?mode=convert&by=markup'],
  ['cpc: clicks from a budget', Cpc, '?mode=clicks'],
  ['biweekly: hourly with overtime', Biweekly, '?mode=hourly&otH=4&otRate=37.5'],
  ['payback: different each year', Payback, '?mode=uneven'],
  ['payback: ten years', Payback, '?mode=uneven&years=10'],
  ['debt: five debts', Debt, '?rows=5&b4=1000&r4=5&m4=50&b5=500&r5=0&m5=25'],
  ['conversion rate: conversions needed', ConversionRate, '?mode=conversions'],
  ['conversion rate: visitors needed', ConversionRate, '?mode=visitors'],
  ['food cost: menu price', FoodCost, '?mode=price'],
  ['food cost: for a period', FoodCost, '?mode=period'],
  ['weekly pay: hourly with overtime', WeeklyPay, '?mode=hourly&otH=5&otRate=37.5'],
  ['50/30/20: with actual spending', Budget, '?aNeeds=2300&aWants=1000&aSave=700'],
  ['compa ratio: own midpoint', Compa, '?mid=own'],
  ['compa ratio: own midpoint, no range', Compa, '?mid=own&min=0&max=0'],
  ['bonus: fixed amount', Bonus, '?mode=fixed'],
  ['bonus: target × achievement, spread over 12', Bonus, '?mode=target&checks=12'],
  ['part-time salary: hourly', PartTime, '?mode=hourly'],
  ['rule of 72: rate needed', RuleOf72, '?mode=rate'],
  ['rent split: by room size with shared space and bills like rent', RentSplit, '?mode=room&shared=25&billSplit=rent'],
  ['rent split: by income, 6 people', RentSplit, '?mode=income&rows=6'],
  ['back pay: salary raise paid late', BackPay, '?mode=salary'],
  ['back pay: missed pay, monthly', BackPay, '?mode=missed&period=month'],
  ['savings rate: gross income with a target', SavingsRate, '?basis=gross&target=20'],
  ['unit price: 4 items in volume', UnitPrice, '?rows=4&u1=l&u2=ml&u3=flozUS&u4=flozUK&per=perL'],
  ['unit price: counts', UnitPrice, '?u1=count&u2=count&per=perItem'],
  ['contribution margin: negative margin', Margin2, '?vc=55'],
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

describe('debt: adding and removing debts', () => {
  it('updates the result and never breaks', () => {
    window.history.replaceState(null, '', '/');
    const { container, getByText, getByLabelText } = render(<Debt />);
    const before = box(container).textContent;
    fireEvent.click(getByText('Add a debt'));
    expect(box(container).textContent).not.toBe(before);
    const added = box(container).textContent;
    fireEvent.click(getByLabelText('Remove debt 1'));
    expect(box(container).textContent).not.toBe(added);
    expect(valid(container)).toBe(true);
    expect(container.textContent).not.toMatch(BROKEN);
  });
});

describe('debt: payment that never covers the interest', () => {
  it('shows the message and "—"', () => {
    window.history.replaceState(null, '', '/?rows=1&b1=10000&r1=24&m1=150&extra=0');
    const { container } = render(<Debt />);
    expect(dash(container)).toBe(true);
    expect(box(container).textContent).toContain('doesn’t cover the interest');
  });
});

describe('margin: price 0 in "Cost and price" (Puru, 2026-11-20)', () => {
  it.each(['/?price=0', '/?cost=0&price=0'])('%s → field error "Enter a price above 0" and a plain "—"', (q) => {
    window.history.replaceState(null, '', q);
    const { container } = render(<Margin />);
    expect(dash(container)).toBe(true);
    expect(container.textContent).toContain('Enter a price above 0');
    expect(box(container).textContent).not.toContain('— margin');
    expect(container.querySelector('[aria-invalid="true"]')).not.toBeNull();
  });
});

describe('payback: a loss year (Puru, 2026-11-20)', () => {
  it('50,000 with −5,000 then 20,000 a year → 3.75 years, 3 years and 9 months', () => {
    window.history.replaceState(null, '', '/?mode=uneven&years=5&y1=-5000&y2=20000&y3=20000&y4=20000&y5=20000');
    const { container } = render(<Payback />);
    expect(valid(container)).toBe(true);
    expect(box(container).textContent).toContain('3.75 years');
    expect(box(container).textContent).toContain('3 years and 9 months');
  });

  it('whole years read "4 years", not "4 years and 0 months"', () => {
    window.history.replaceState(null, '', '/');
    const { container } = render(<Payback />);
    expect(box(container).textContent).toContain('4 years');
    expect(box(container).textContent).not.toContain('0 months');
  });
});

describe('batch 7 states (Puru, 2026-11-20)', () => {
  it('conversion rate, INR defaults: 150 ÷ 5,000 at ₹2,000 → 3%, ₹3,00,000.00', () => {
    window.history.replaceState(null, '', '/?currency=INR');
    const { container } = render(<ConversionRate />);
    expect(box(container).textContent).toContain('3%');
    expect(box(container).textContent).toContain('₹3,00,000.00');
  });

  it('conversion rate: conversions above visitors → field error and "—"', () => {
    window.history.replaceState(null, '', '/?conv=6000');
    const { container } = render(<ConversionRate />);
    expect(dash(container)).toBe(true);
    expect(container.textContent).toContain('Conversions can’t be more than visitors');
  });

  it('food cost, period: closing above opening + purchases → field error and "—"', () => {
    window.history.replaceState(null, '', '/?mode=period&close=20000');
    const { container } = render(<FoodCost />);
    expect(dash(container)).toBe(true);
    expect(container.textContent).toContain('Closing inventory can’t be more than opening inventory plus purchases');
  });

  it('food cost, menu price: target 100% → "Enter a target below 100%" and "—"', () => {
    window.history.replaceState(null, '', '/?mode=price&target=100');
    const { container } = render(<FoodCost />);
    expect(dash(container)).toBe(true);
    expect(container.textContent).toContain('Enter a target below 100%');
  });

  it('50/30/20: percentages that total 105 → the total message, "—", and a reset back to 50/30/20', () => {
    window.history.replaceState(null, '', '/?save=25');
    const { container, getByText } = render(<Budget />);
    expect(dash(container)).toBe(true);
    expect(container.textContent).toContain('Your percentages add up to 105%. They need to total 100%.');
    fireEvent.click(getByText('Reset to 50/30/20'));
    expect(valid(container)).toBe(true);
    expect(box(container).textContent).toContain('$800.00');
  });

  it('50/30/20: actual spending shows over / under rows', () => {
    window.history.replaceState(null, '', '/?aNeeds=2300&aWants=1000&aSave=700');
    const { container } = render(<Budget />);
    const t = box(container).textContent!;
    expect(t).toContain('$300.00 over plan');
    expect(t).toContain('$200.00 under plan');
    expect(t).toContain('$100.00 less saved than planned');
    expect(t).toContain('Everything is assigned');
  });

  it('compa ratio: max not above min → field error and "—"; own midpoint without a range asks for it', () => {
    window.history.replaceState(null, '', '/?min=90000&max=60000');
    const a = render(<Compa />);
    expect(dash(a.container)).toBe(true);
    expect(a.container.textContent).toContain('Maximum must be above the minimum');
    cleanup();
    window.history.replaceState(null, '', '/?mid=own&min=0&max=0');
    const { container } = render(<Compa />);
    expect(valid(container)).toBe(true);
    expect(box(container).textContent).toContain('Add the range minimum and maximum to see range penetration');
  });

  it('rent split: 25% shared space → 950 / 800 / 650 (Puru, 2026-11-21)', () => {
    window.history.replaceState(null, '', '/?mode=room&shared=25&bills=0');
    const { container } = render(<RentSplit />);
    const t = box(container).textContent!;
    for (const v of ['$950.00', '$800.00', '$650.00', '$600.00', '$1,800.00']) expect(t).toContain(v);
  });

  it('rent split: 1,000 ÷ 3 → 333.34 / 333.33 / 333.33 with the rounding note', () => {
    window.history.replaceState(null, '', '/?rent=1000&bills=0');
    const { container } = render(<RentSplit />);
    const t = box(container).textContent!;
    expect(t).toContain('$333.34');
    // Each person's row shows the rent in its note and the total as its value (no bills, so the same figure).
    expect(t.split('$333.34').length - 1).toBe(2);
    expect(t.split('$333.33').length - 1).toBe(4);
    expect(t).toContain('$1,000.00');
    expect(t).toContain('leftover cents go to Person 1, Person 2');
  });

  it('rent split, by income: each row says "of combined income" (Puru, 2026-11-21)', () => {
    window.history.replaceState(null, '', '/?mode=income');
    const { container } = render(<RentSplit />);
    const t = box(container).textContent!;
    expect(t).toContain('40% of combined income');
    expect(t.split('30% of combined income').length - 1).toBe(2);
    expect(t).not.toMatch(/% of income/);
  });

  it('rent split: removing Person 2 of 4 moves the others up and leaves no leftover keys in the URL', async () => {
    window.history.replaceState(null, '', '/?mode=income&rows=4&i2=1000&i4=7000');
    const { getByLabelText } = render(<RentSplit />);
    fireEvent.click(getByLabelText('Remove person 2'));
    // URL writes are debounced (lib/url-state.ts). 3 people is the default, so "rows" drops out of the link.
    await waitFor(() => expect(window.location.search).toContain('i3=7000'));
    expect(window.location.search).not.toContain('rows=');
    expect(window.location.search).not.toMatch(/[si]4=/);
  });

  it('current ratio: below 1 says how much larger the liabilities are, with no judgment words', () => {
    window.history.replaceState(null, '', '/?assets=90000&liab=120000&inv=30000&prepaid=0');
    const { container } = render(<CurrentRatio />);
    const t = box(container).textContent!;
    expect(t).toContain('0.75');
    expect(t).toContain('0.50');
    expect(t).toContain('Current liabilities are $30,000.00 more than current assets.');
    expect(t).not.toMatch(/good|healthy|safe|risky|weak|strong/i);
  });

  it('current ratio: inventory + prepaid above assets → field error, quick ratio "—", current ratio still shown', () => {
    window.history.replaceState(null, '', '/?inv=300000');
    const { container } = render(<CurrentRatio />);
    expect(valid(container)).toBe(true);
    expect(container.textContent).toContain('Inventory and prepaid expenses can’t be more than current assets');
    expect(box(container).textContent).toContain('2.00');
    expect(box(container).textContent).toContain('Fix inventory and prepaid expenses to see the quick ratio');
  });

  it('unit price: 1 l vs 33.814 fl oz (US) at the same price → a tie (Puru, 2026-11-21)', () => {
    window.history.replaceState(null, '', '/?p1=2&q1=1&u1=l&p2=2&q2=33.814&u2=flozUS&per=perL');
    const { container } = render(<UnitPrice />);
    const t = box(container).textContent!;
    expect(t).toContain('Items 1 and 2');
    expect(t).toContain('cost the same per unit');
    expect(container.textContent).toContain('fl oz (US)');
    expect(container.textContent).toContain('fl oz (UK)');
  });

  it('unit price: a weight next to a volume → error on that item and "—"', () => {
    window.history.replaceState(null, '', '/?u1=g&u2=ml');
    const { container } = render(<UnitPrice />);
    expect(dash(container)).toBe(true);
    expect(container.textContent).toContain('Item 1 is a weight: use g, kg, oz or lb');
  });

  it('wedding budget: percentages that total 105 → the total message, "—", and a reset to the example split', () => {
    window.history.replaceState(null, '', '/?venue=50');
    const { container, getByText } = render(<Wedding />);
    expect(dash(container)).toBe(true);
    expect(container.textContent).toContain('Your percentages add up to 105%. They need to total 100%.');
    fireEvent.click(getByText('Reset to the example split'));
    expect(valid(container)).toBe(true);
    expect(box(container).textContent).toContain('$11,250.00');
  });

  it('wedding budget: decimal percentages add up exactly (exact-cent rule)', () => {
    window.history.replaceState(null, '', '/?budget=1234.56&venue=45.5&photo=11.5');
    const { container } = render(<Wedding />);
    const t = box(container).textContent!;
    for (const v of ['$561.73', '$141.98', '$61.72', '$123.45']) expect(t).toContain(v);
    expect(t).toContain('leftover cents go to the first categories');
  });

  it('back pay: salary raise 50,000 → 55,000 over 10 weeks → $961.54 (Puru, 2026-11-21)', () => {
    window.history.replaceState(null, '', '/?mode=salary&weeks=10');
    const { container } = render(<BackPay />);
    expect(box(container).textContent).toContain('$961.54');
    expect(container.textContent).not.toMatch(/interest|deadline|tribunal|entitle|claim/i);
  });

  it('savings rate: no target by default, and the gap reads in words with one', () => {
    const a = render(<SavingsRate />);
    expect(box(a.container).textContent).not.toMatch(/target/i);
    cleanup();
    window.history.replaceState(null, '', '/?target=20');
    const { container } = render(<SavingsRate />);
    expect(box(container).textContent).toContain('$200.00 more a month to reach 20%');
  });

  it('contribution margin: negative margin → no break-even message', () => {
    window.history.replaceState(null, '', '/?vc=55');
    const { container } = render(<Margin2 />);
    const t = box(container).textContent!;
    expect(t).toContain('−$5.00');
    expect(t).toContain('there is no break-even point');
    expect(t).toContain('Loss of $17,000.00');
  });

  it('weekly pay: overtime row reads per week', () => {
    window.history.replaceState(null, '', '/?mode=hourly&otH=5&otRate=37.5');
    const { container } = render(<WeeklyPay />);
    expect(box(container).textContent).toContain('$1,187.50');
    expect(box(container).textContent).toContain('$187.50');
  });
});
