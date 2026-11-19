// zod/mini keeps the client bundle small (same validation, tree-shakable API).
import * as z from 'zod/mini';
import { CURRENCIES, type CurrencyCode } from '@/lib/format';
import { currencyVariant, defaultsForCurrency, switchCurrency, type CurrencyPresets } from '@/lib/currency-defaults';
import type { OfferInput } from './calc';

const num = () => z.number({ error: 'Enter a number' });
const money = (max: number) =>
  num().check(z.minimum(0, 'Can’t be negative'), z.maximum(max, `Maximum is ${max.toLocaleString('en-US')}`));
const range = (min: number, max: number, unit = '') =>
  num().check(z.minimum(min, `Minimum is ${min}${unit}`), z.maximum(max, `Maximum is ${max}${unit}`));
const whole = (min: number, max: number, unit = '') =>
  num().check(z.refine((v) => Number.isInteger(v), 'Use a whole number'), z.minimum(min, `Minimum is ${min}${unit}`), z.maximum(max, `Maximum is ${max}${unit}`));

/**
 * Flat state so one URL holds both offers: `a…` = Offer A, `b…` = Offer B.
 * Percentages are whole numbers in the UI/URL (5 = 5%); toOfferInput converts them.
 */
export const jobOfferSchema = z.object({
  currency: z.enum(CURRENCIES),
  timeValue: money(100_000),
  aSalary: money(100_000_000),
  aBonus: range(0, 200, '%'),
  aMatch: range(0, 50, '%'),
  aBenefits: money(10_000_000),
  aLeave: range(0, 259, ' days'),
  aHours: range(1, 100, ' hours'),
  aOffice: whole(0, 5, ' days'),
  aMins: range(0, 300, ' minutes'),
  aCost: money(100_000),
  bSalary: money(100_000_000),
  bBonus: range(0, 200, '%'),
  bMatch: range(0, 50, '%'),
  bBenefits: money(10_000_000),
  bLeave: range(0, 259, ' days'),
  bHours: range(1, 100, ' hours'),
  bOffice: whole(0, 5, ' days'),
  bMins: range(0, 300, ' minutes'),
  bCost: money(100_000),
});

export type JobOfferState = z.infer<typeof jobOfferSchema>;
export type OfferKey = 'a' | 'b';

/** Currency-dependent defaults (spec, approved): example inputs, not market data. */
export const jobOfferCurrencyPresets: CurrencyPresets<JobOfferState> = {
  USD: { aSalary: 85_000, bSalary: 92_000, aBenefits: 6_000, bBenefits: 3_000, aCost: 15, bCost: 15 },
  CAD: { aSalary: 80_000, bSalary: 86_000, aBenefits: 5_000, bBenefits: 2_500, aCost: 15, bCost: 15 },
  AUD: { aSalary: 95_000, bSalary: 102_000, aBenefits: 5_000, bBenefits: 2_500, aCost: 15, bCost: 15 },
  GBP: { aSalary: 45_000, bSalary: 49_000, aBenefits: 3_000, bBenefits: 1_500, aCost: 12, bCost: 12 },
  EUR: { aSalary: 50_000, bSalary: 54_000, aBenefits: 3_000, bBenefits: 1_500, aCost: 10, bCost: 10 },
  INR: { aSalary: 1_200_000, bSalary: 1_300_000, aBenefits: 50_000, bBenefits: 25_000, aCost: 150, bCost: 150 },
};

const base: JobOfferState = {
  currency: 'USD',
  timeValue: 0,
  aSalary: 85_000,
  aBonus: 5,
  aMatch: 4,
  aBenefits: 6_000,
  aLeave: 25,
  aHours: 40,
  aOffice: 1,
  aMins: 30,
  aCost: 15,
  bSalary: 92_000,
  bBonus: 0,
  bMatch: 3,
  bBenefits: 3_000,
  bLeave: 20,
  bHours: 40,
  bOffice: 5,
  bMins: 50,
  bCost: 15,
};

export const jobOfferDefaults = defaultsForCurrency(base, jobOfferCurrencyPresets, 'USD');
export const jobOfferVariant = currencyVariant(jobOfferDefaults, jobOfferCurrencyPresets);

export function switchJobOfferCurrency(state: JobOfferState, next: CurrencyCode, touched?: ReadonlySet<string>): JobOfferState {
  return switchCurrency(state, next, jobOfferDefaults, jobOfferCurrencyPresets, touched);
}

/** The per-offer state keys, e.g. offerKey('a', 'Salary') → 'aSalary'. */
export type OfferField = 'Salary' | 'Bonus' | 'Match' | 'Benefits' | 'Leave' | 'Hours' | 'Office' | 'Mins' | 'Cost';
export function offerKey<P extends OfferKey, F extends OfferField>(p: P, f: F): `${P}${F}` {
  return `${p}${f}`;
}

export function toOfferInput(s: JobOfferState, p: OfferKey): OfferInput {
  const v = (f: OfferField) => s[offerKey(p, f)];
  return {
    salary: v('Salary'),
    bonus: v('Bonus') / 100,
    match: v('Match') / 100,
    benefits: v('Benefits'),
    leaveDays: v('Leave'),
    hoursPerWeek: v('Hours'),
    officeDays: v('Office'),
    commuteMins: v('Mins'),
    commuteCost: v('Cost'),
  };
}

export { fieldErrors } from '@/lib/field-errors';
