import type { CurrencyCode } from './format';
import type { DefaultsVariant } from './url-state';

/**
 * Reusable pattern for tools with currency inputs.
 *
 * Each tool declares, in its schema.ts, the defaults that depend on currency (income,
 * expenses, typical tax…). `Record<CurrencyCode, …>` forces every supported currency to be
 * covered, so adding a currency later makes TypeScript flag every tool that needs presets.
 *
 * When the currency changes, a field the user has NOT touched moves to the NEW currency's
 * default; anything the user typed is kept, even if they retyped the exact example value
 * (Puru, 2026-11-19). "Touched" comes from useUrlState (typed in this visit, or present in
 * the shared link). Without a touched set (older callers, tests), a field still at the old
 * currency's default counts as untouched.
 */
export type CurrencyPresets<T> = Record<CurrencyCode, Partial<T>>;

export function defaultsForCurrency<T extends { currency: CurrencyCode }>(
  base: T,
  presets: CurrencyPresets<T>,
  currency: CurrencyCode,
): T {
  return { ...base, ...presets[currency], currency };
}

export function switchCurrency<T extends { currency: CurrencyCode }>(
  state: T,
  next: CurrencyCode,
  base: T,
  presets: CurrencyPresets<T>,
  touched?: ReadonlySet<string>,
): T {
  if (next === state.currency) return state;
  const from = defaultsForCurrency(base, presets, state.currency);
  const to = defaultsForCurrency(base, presets, next);
  const keys = new Set([...Object.keys(presets[state.currency]), ...Object.keys(presets[next])] as (keyof T)[]);
  const out: T = { ...state, currency: next };
  for (const key of keys) {
    if (key === 'currency') continue;
    if (touched?.has(key as string)) continue;
    if (state[key] === from[key]) out[key] = to[key];
  }
  return out;
}

/**
 * The `variant` option for useUrlState: shared links (e.g. `?currency=INR`) fill missing
 * fields with that currency's defaults, and only values that differ from them go in the URL.
 */
export function currencyVariant<T extends { currency: CurrencyCode } & Record<string, string | number>>(
  base: T,
  presets: CurrencyPresets<T>,
): DefaultsVariant<T> {
  return { key: 'currency', defaultsFor: (state) => defaultsForCurrency(base, presets, state.currency) };
}
