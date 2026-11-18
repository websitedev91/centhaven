// zod/mini keeps the client bundle small (same validation, tree-shakable API).
import * as z from 'zod/mini';
import { CURRENCIES, type CurrencyCode } from '@/lib/format';
import type { DefaultsVariant } from '@/lib/url-state';
import { PERIODS, periodsPerYear, type PayRaiseInput, type Period } from './calc';

const num = () => z.number({ error: 'Enter a number' });
const pay = () => num().check(z.minimum(0, 'Pay can’t be negative'), z.maximum(100_000_000, 'Maximum is 100,000,000'));

export const MODES = ['percent', 'newpay'] as const;

/** Percentages are whole numbers in the UI/URL (5 = 5%); toCalcInput converts them. */
export const payRaiseSchema = z.object({
  mode: z.enum(MODES),
  currency: z.enum(CURRENCIES),
  period: z.enum(PERIODS),
  hours: num().check(z.minimum(1, 'Minimum is 1 hour'), z.maximum(100, 'Maximum is 100 hours')),
  current: pay(),
  raise: num().check(z.minimum(-50, 'Minimum is −50%'), z.maximum(200, 'Maximum is 200%')),
  newPay: pay(),
  inflation: num().check(z.minimum(0, 'Minimum is 0%'), z.maximum(50, 'Maximum is 50%')),
});

export type PayRaiseState = z.infer<typeof payRaiseSchema>;

/**
 * Example pay per currency and period (Puru, 2026-11-18): USD year 60,000 / month 5,000 /
 * week 1,150 / hour 29, and every currency scaled the same way from its yearly example
 * (month = year ÷ 12 to the nearest 50, week = year ÷ 52 to the nearest 10, hour = year ÷ 2,080
 * to the nearest 1). New pay is the example plus 5%. Examples, not market data.
 */
const YEARLY_EXAMPLE: Record<CurrencyCode, number> = {
  USD: 60_000,
  CAD: 60_000,
  AUD: 60_000,
  GBP: 40_000,
  EUR: 40_000,
  INR: 1_200_000,
};

const roundTo = (n: number, step: number) => Math.round(n / step) * step;

export function examplePay(currency: CurrencyCode, period: Period): { current: number; newPay: number } {
  const year = YEARLY_EXAMPLE[currency];
  const current =
    period === 'year' ? year : period === 'month' ? roundTo(year / 12, 50) : period === 'week' ? roundTo(year / 52, 10) : roundTo(year / 2_080, 1);
  return { current, newPay: Math.round(current * 1.05 * 100) / 100 };
}

const base: PayRaiseState = {
  mode: 'percent',
  currency: 'USD',
  period: 'year',
  hours: 40,
  current: 60_000,
  raise: 5,
  newPay: 63_000,
  inflation: 0,
};

export function defaultsFor(state: Pick<PayRaiseState, 'currency' | 'period'>): PayRaiseState {
  return { ...base, currency: state.currency, period: state.period, ...examplePay(state.currency, state.period) };
}

export const payRaiseDefaults = defaultsFor(base);

/** Shared links: missing fields take the example for the link's currency AND period. */
export const payRaiseVariant: DefaultsVariant<PayRaiseState> = {
  key: 'currency',
  alsoKeys: ['period'],
  defaultsFor: (state) => defaultsFor(state),
};

/**
 * Switch currency and/or period. Pay fields still at the old example move to the new example;
 * anything the user typed is kept (the currency-defaults pattern, with period as a second key).
 */
export function switchPayContext(state: PayRaiseState, next: Partial<Pick<PayRaiseState, 'currency' | 'period'>>): PayRaiseState {
  const target = { ...state, ...next };
  const from = defaultsFor(state);
  const to = defaultsFor(target);
  const out: PayRaiseState = { ...target };
  for (const key of ['current', 'newPay'] as const) {
    if (state[key] === from[key]) out[key] = to[key];
  }
  return out;
}

export function toCalcInput(s: PayRaiseState): PayRaiseInput {
  return {
    mode: s.mode,
    current: s.current,
    raise: s.raise / 100,
    newPay: s.newPay,
    inflation: s.inflation / 100,
    perYear: periodsPerYear(s.period, s.hours),
  };
}

/** Plan B for "Compare two raises": a different raise %. */
export const planBSchema = z.pick(payRaiseSchema, { raise: true });
export type PlanBState = z.infer<typeof planBSchema>;
export const planBDefaults: PlanBState = { raise: 3 };

export { fieldErrors } from '@/lib/field-errors';
