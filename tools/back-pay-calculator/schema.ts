// zod/mini keeps the client bundle small (same validation, tree-shakable API).
import * as z from 'zod/mini';
import { CURRENCIES, type CurrencyCode } from '@/lib/format';
import { currencyVariant, defaultsForCurrency, switchCurrency, type CurrencyPresets } from '@/lib/currency-defaults';
import { fieldErrors } from '@/lib/field-errors';
import type { BackPayInput, BackPayMode } from './calc';

const num = () => z.number({ error: 'Enter a number' });
const money = (max: number) => num().check(z.minimum(0, 'Can’t be negative'), z.maximum(max, `Maximum is ${max.toLocaleString('en-US')}`));
const upTo = (max: number, unit: string) => num().check(z.minimum(0, 'Can’t be negative'), z.maximum(max, `Maximum is ${max.toLocaleString('en-US')} ${unit}`));

export const MODES = ['rate', 'salary', 'missed'] as const satisfies readonly BackPayMode[];
export const PERIODS = ['week', 'twoWeeks', 'halfMonth', 'month'] as const;
export type PayPeriod = (typeof PERIODS)[number];

/** Words only: the pay period never changes the maths. */
export const PERIOD_WORDS: Record<PayPeriod, { label: string; one: string }> = {
  week: { label: 'Every week', one: '1 week' },
  twoWeeks: { label: 'Every 2 weeks', one: '2 weeks' },
  halfMonth: { label: 'Twice a month', one: 'half a month' },
  month: { label: 'Every month', one: '1 month' },
};

export const backPaySchema = z.object({
  mode: z.enum(MODES),
  currency: z.enum(CURRENCIES),
  oldRate: money(1_000_000),
  newRate: money(1_000_000),
  hours: upTo(168, 'hours'),
  weeks: upTo(520, 'weeks'),
  oldSalary: money(1_000_000_000),
  newSalary: money(1_000_000_000),
  period: z.enum(PERIODS),
  amount: money(1_000_000_000),
  periods: upTo(1_000, 'periods'),
});

export type BackPayState = z.infer<typeof backPaySchema>;

/** Example values only (CurrencyPresets pattern). Hours, weeks and periods never change with currency. */
export const backPayCurrencyPresets: CurrencyPresets<BackPayState> = {
  USD: { oldRate: 20, newRate: 22, oldSalary: 50_000, newSalary: 55_000, amount: 1_500 },
  CAD: { oldRate: 20, newRate: 22, oldSalary: 50_000, newSalary: 55_000, amount: 1_500 },
  AUD: { oldRate: 20, newRate: 22, oldSalary: 50_000, newSalary: 55_000, amount: 1_500 },
  GBP: { oldRate: 15, newRate: 16.5, oldSalary: 35_000, newSalary: 38_500, amount: 1_200 },
  EUR: { oldRate: 15, newRate: 16.5, oldSalary: 35_000, newSalary: 38_500, amount: 1_200 },
  INR: { oldRate: 300, newRate: 330, oldSalary: 600_000, newSalary: 660_000, amount: 25_000 },
};

const base: BackPayState = {
  mode: 'rate',
  currency: 'USD',
  oldRate: 20,
  newRate: 22,
  hours: 40,
  weeks: 12,
  oldSalary: 50_000,
  newSalary: 55_000,
  period: 'twoWeeks',
  amount: 1_500,
  periods: 3,
};

export const backPayDefaults = defaultsForCurrency(base, backPayCurrencyPresets, 'USD');
export const backPayVariant = currencyVariant(backPayDefaults, backPayCurrencyPresets);

export function switchBackPayCurrency(state: BackPayState, next: CurrencyCode, touched?: ReadonlySet<string>): BackPayState {
  return switchCurrency(state, next, backPayDefaults, backPayCurrencyPresets, touched);
}

export const RATE_BELOW_OLD = 'New rate must be at least the old rate';
export const SALARY_BELOW_OLD = 'New salary must be at least the old salary';

const USED: Record<BackPayMode, (keyof BackPayState)[]> = {
  rate: ['oldRate', 'newRate', 'hours', 'weeks'],
  salary: ['oldSalary', 'newSalary', 'weeks'],
  missed: ['amount', 'periods'],
};

/** Errors for the fields the current mode uses, plus "new must be at least old". */
export function backPayErrors(s: BackPayState): Partial<Record<keyof BackPayState, string>> {
  const all = fieldErrors(backPaySchema, s);
  const out: Partial<Record<keyof BackPayState, string>> = {};
  for (const k of USED[s.mode]) if (all[k]) out[k] = all[k];
  if (s.mode === 'rate' && !out.oldRate && !out.newRate && s.newRate < s.oldRate) out.newRate = RATE_BELOW_OLD;
  if (s.mode === 'salary' && !out.oldSalary && !out.newSalary && s.newSalary < s.oldSalary) out.newSalary = SALARY_BELOW_OLD;
  return out;
}

export function toCalcInput(s: BackPayState): BackPayInput {
  const { oldRate, newRate, hours, weeks, oldSalary, newSalary, amount, periods } = s;
  return { mode: s.mode, oldRate, newRate, hours, weeks, oldSalary, newSalary, amount, periods };
}

export { fieldErrors };
