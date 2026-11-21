// zod/mini keeps the client bundle small (same validation, tree-shakable API).
import * as z from 'zod/mini';
import { CURRENCIES, type CurrencyCode } from '@/lib/format';
import { currencyVariant, defaultsForCurrency, switchCurrency, type CurrencyPresets } from '@/lib/currency-defaults';
import { fieldErrors } from '@/lib/field-errors';
import type { BonusInput, BonusMode } from './calc';

const num = () => z.number({ error: 'Enter a number' });
const money = () => num().check(z.minimum(0, 'Can’t be negative'), z.maximum(1_000_000_000, 'Maximum is 1,000,000,000'));
const pct = () => num().check(z.minimum(0, 'Can’t be negative'), z.maximum(1_000, 'Maximum is 1,000%'));

export const MODES = ['percent', 'fixed', 'target'] as const satisfies readonly BonusMode[];

export const bonusSchema = z.object({
  mode: z.enum(MODES),
  currency: z.enum(CURRENCIES),
  salary: money(),
  pct: pct(),
  amount: money(),
  target: pct(),
  ach: pct(),
  checks: num().check(
    z.minimum(0, 'Can’t be negative'),
    z.refine((v) => Number.isInteger(v), 'Enter a whole number'),
    z.maximum(365, 'Maximum is 365'),
  ),
});

export type BonusState = z.infer<typeof bonusSchema>;

/** Example values only (CurrencyPresets pattern). Percentages and paychecks never change with currency. */
export const bonusCurrencyPresets: CurrencyPresets<BonusState> = {
  USD: { salary: 60_000, amount: 5_000 },
  CAD: { salary: 60_000, amount: 5_000 },
  AUD: { salary: 60_000, amount: 5_000 },
  GBP: { salary: 40_000, amount: 3_000 },
  EUR: { salary: 40_000, amount: 3_000 },
  INR: { salary: 1_200_000, amount: 100_000 },
};

/** Lump sum by default (Puru, 2026-11-21): the paychecks box starts empty (0 = off). */
const base: BonusState = { mode: 'percent', currency: 'USD', salary: 60_000, pct: 10, amount: 5_000, target: 10, ach: 120, checks: 0 };

export const bonusDefaults = defaultsForCurrency(base, bonusCurrencyPresets, 'USD');
export const bonusVariant = currencyVariant(bonusDefaults, bonusCurrencyPresets);

export function switchBonusCurrency(state: BonusState, next: CurrencyCode, touched?: ReadonlySet<string>): BonusState {
  return switchCurrency(state, next, bonusDefaults, bonusCurrencyPresets, touched);
}

/** Optional: empty = 0 = paid as one lump sum. */
export const OPTIONAL = ['checks'] as const;

/** Errors for the fields the current mode uses. */
export function bonusErrors(s: BonusState): Partial<Record<keyof BonusState, string>> {
  const all = fieldErrors(bonusSchema, s);
  const used: (keyof BonusState)[] = ['salary', 'checks', ...((s.mode === 'percent' ? ['pct'] : s.mode === 'fixed' ? ['amount'] : ['target', 'ach']) as (keyof BonusState)[])];
  const out: Partial<Record<keyof BonusState, string>> = {};
  for (const k of used) if (all[k]) out[k] = all[k];
  return out;
}

export function toCalcInput(s: BonusState): BonusInput {
  return { mode: s.mode, salary: s.salary, pct: s.pct, amount: s.amount, target: s.target, achievement: s.ach, checks: s.checks };
}

/** Plan B for "Compare two bonuses": another bonus % (percent mode) or achievement % (target mode). */
export const planBSchema = z.object({ pct: pct(), ach: pct() });
export type PlanBState = z.infer<typeof planBSchema>;
export const planBDefaults: PlanBState = { pct: 15, ach: 100 };

export { fieldErrors };
