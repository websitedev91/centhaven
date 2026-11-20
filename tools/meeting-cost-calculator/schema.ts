// zod/mini keeps the client bundle small (same validation, tree-shakable API).
import * as z from 'zod/mini';
import { CURRENCIES, type CurrencyCode } from '@/lib/format';
import { currencyVariant, defaultsForCurrency, switchCurrency, type CurrencyPresets } from '@/lib/currency-defaults';
import { fieldErrors } from '@/lib/field-errors';
import { sameRates, type MeetingInput } from './calc';

const num = () => z.number({ error: 'Enter a number' });
const whole = (min: number, max: number, unit: string) =>
  num().check(
    z.refine((v) => Number.isInteger(v), 'Enter a whole number'),
    z.minimum(min, `Enter at least ${min} ${unit}`),
    z.maximum(max, `Maximum is ${max.toLocaleString('en-US')}`),
  );
const rate = () => num().check(z.minimum(0, 'Can’t be negative'), z.maximum(1_000_000, 'Maximum is 1,000,000'));

/** Up to 20 per-person rows, kept as flat r1…r20 so the state fits the URL. No names (they would end up in URLs). */
export const MAX_ROWS = 20;
export const ROW_KEYS = Array.from({ length: MAX_ROWS }, (_, i) => `r${i + 1}` as RowKey);
export type RowKey = `r${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20}`;

const rowShape = Object.fromEntries(ROW_KEYS.map((k) => [k, rate()])) as Record<RowKey, ReturnType<typeof rate>>;

export const MODES = ['same', 'each'] as const;
export const REPEATS = ['once', 'repeats'] as const;

export const meetingSchema = z.object({
  mode: z.enum(MODES),
  currency: z.enum(CURRENCIES),
  people: whole(1, 10_000, 'person'),
  rate: rate(),
  rows: whole(1, MAX_ROWS, 'person'),
  ...rowShape,
  min: whole(1, 1_440, 'minute'),
  rep: z.enum(REPEATS),
  perWeek: num().check(z.minimum(0.25, 'Minimum is 0.25'), z.maximum(50, 'Maximum is 50')),
  weeks: whole(1, 52, 'week'),
});

export type MeetingState = z.infer<typeof meetingSchema>;

const zeroRows = Object.fromEntries(ROW_KEYS.map((k) => [k, 0])) as Record<RowKey, number>;

/** Example values only (CurrencyPresets pattern). Counts and times never change with currency. */
export const meetingCurrencyPresets: CurrencyPresets<MeetingState> = {
  USD: { rate: 50, r1: 80, r2: 60, r3: 45, r4: 45 },
  CAD: { rate: 50, r1: 80, r2: 60, r3: 45, r4: 45 },
  AUD: { rate: 50, r1: 80, r2: 60, r3: 45, r4: 45 },
  GBP: { rate: 40, r1: 65, r2: 50, r3: 35, r4: 35 },
  EUR: { rate: 40, r1: 65, r2: 50, r3: 35, r4: 35 },
  INR: { rate: 800, r1: 1_500, r2: 1_000, r3: 700, r4: 700 },
};

const base: MeetingState = {
  mode: 'same',
  currency: 'USD',
  people: 6,
  rate: 50,
  rows: 4,
  ...zeroRows,
  r1: 80,
  r2: 60,
  r3: 45,
  r4: 45,
  min: 60,
  rep: 'once',
  perWeek: 1,
  weeks: 48,
};

export const meetingDefaults = defaultsForCurrency(base, meetingCurrencyPresets, 'USD');
export const meetingVariant = currencyVariant(meetingDefaults, meetingCurrencyPresets);

export function switchMeetingCurrency(state: MeetingState, next: CurrencyCode, touched?: ReadonlySet<string>): MeetingState {
  return resetHiddenRows(switchCurrency(state, next, meetingDefaults, meetingCurrencyPresets, touched));
}

/**
 * Rows past `rows` go back to the current currency's defaults, so a removed person leaves nothing
 * in the share URL (only non-default values are written). Same rule as the debt tool (2026-11-20).
 */
export function resetHiddenRows(s: MeetingState): MeetingState {
  const n = Number.isInteger(s.rows) ? Math.min(MAX_ROWS, Math.max(1, s.rows)) : MAX_ROWS;
  const d = defaultsForCurrency(meetingDefaults, meetingCurrencyPresets, s.currency);
  const next = { ...s };
  for (const k of ROW_KEYS.slice(n)) next[k] = d[k];
  return next;
}

/** The per-person rates in use (rows 1…rows). */
export function activeRates(s: MeetingState): number[] {
  return ROW_KEYS.slice(0, Math.min(MAX_ROWS, Math.max(1, s.rows))).map((k) => s[k]);
}

/** Errors for the fields the current modes use (hidden rows and repeat fields are ignored). */
export function meetingErrors(s: MeetingState): Partial<Record<keyof MeetingState, string>> {
  const all = fieldErrors(meetingSchema, s);
  const used = new Set<keyof MeetingState>(['min']);
  if (s.mode === 'same') {
    used.add('people');
    used.add('rate');
  } else {
    used.add('rows');
    for (const k of ROW_KEYS.slice(0, Number.isInteger(s.rows) ? Math.min(MAX_ROWS, Math.max(1, s.rows)) : 1)) used.add(k);
  }
  if (s.rep === 'repeats') {
    used.add('perWeek');
    used.add('weeks');
  }
  const out: Partial<Record<keyof MeetingState, string>> = {};
  for (const k of used) if (all[k]) out[k] = all[k];
  return out;
}

export function toCalcInput(s: MeetingState): MeetingInput {
  return {
    rates: s.mode === 'same' ? sameRates(s.people, s.rate) : activeRates(s),
    minutes: s.min,
    perWeek: s.rep === 'repeats' ? s.perWeek : 0,
    weeksPerYear: s.weeks,
  };
}

/** Add a row (copies the last row's rate). */
export function addRow(s: MeetingState): MeetingState {
  if (s.rows >= MAX_ROWS) return s;
  const last = s[ROW_KEYS[s.rows - 1]!];
  return { ...s, rows: s.rows + 1, [ROW_KEYS[s.rows]!]: Number.isFinite(last) ? last : 0 };
}

/** Remove row `index` (0-based); later rows move up. The last row can't be removed. */
export function removeRow(s: MeetingState, index: number): MeetingState {
  if (s.rows <= 1) return s;
  const next: MeetingState = { ...s, rows: s.rows - 1 };
  for (let i = index; i < MAX_ROWS - 1; i++) next[ROW_KEYS[i]!] = s[ROW_KEYS[i + 1]!];
  // Rows past the new end are hidden: back to their defaults (valid, and never in the share URL).
  return resetHiddenRows(next);
}

/**
 * Plan B for "Compare two plans": a different number of people and length, at plan A's
 * average hourly cost per person (so it works in both rate modes).
 */
export const planBSchema = z.object({ people: whole(1, 10_000, 'person'), min: whole(1, 1_440, 'minute') });
export type PlanBState = z.infer<typeof planBSchema>;
export const planBDefaults: PlanBState = { people: 4, min: 30 };

export function planBInput(a: MeetingInput, b: PlanBState): MeetingInput {
  const average = a.rates.length > 0 ? a.rates.reduce((x, y) => x + y, 0) / a.rates.length : 0;
  return { ...a, rates: sameRates(b.people, average), minutes: b.min };
}

export { fieldErrors };
