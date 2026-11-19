// zod/mini keeps the client bundle small (same validation, tree-shakable API).
import * as z from 'zod/mini';
import { CURRENCIES, type CurrencyCode } from '@/lib/format';
import { currencyVariant, defaultsForCurrency, switchCurrency, type CurrencyPresets } from '@/lib/currency-defaults';
import { fieldErrors } from '@/lib/field-errors';
import { APP_FEATURES, PLATFORMS, SHARED_FEATURES, type AppCostInput, type AppFeature, type SharedFeature } from './calc';

const num = () => z.number({ error: 'Enter a number' });
const hours = (min: number, max: number) =>
  num().check(z.minimum(min, `Minimum is ${min} hours`), z.maximum(max, `Maximum is ${max} hours`));
/** On/off flags are 0/1 numbers so they fit the flat URL state. */
const flag = () => num().check(z.refine((v) => v === 0 || v === 1, 'Use 0 or 1'));

export const appCostSchema = z.object({
  currency: z.enum(CURRENCIES),
  rate: num().check(z.minimum(0, 'Rate can’t be negative'), z.maximum(1_000_000, 'Maximum is 1,000,000')),
  ios: flag(),
  android: flag(),
  web: flag(),
  extra: num().check(z.minimum(0, 'Minimum is 0%'), z.maximum(100, 'Maximum is 100%')),
  screens: num().check(
    z.refine((v) => Number.isInteger(v), 'Use a whole number of screens'),
    z.minimum(1, 'Minimum is 1 screen'),
    z.maximum(200, 'Maximum is 200 screens'),
  ),
  hps: hours(0.5, 200),
  setup: hours(0, 1_000),
  login: flag(),
  loginH: hours(0, 1_000),
  pay: flag(),
  payH: hours(0, 1_000),
  push: flag(),
  pushH: hours(0, 1_000),
  chat: flag(),
  chatH: hours(0, 1_000),
  device: flag(),
  deviceH: hours(0, 1_000),
  offline: flag(),
  offlineH: hours(0, 1_000),
  api: flag(),
  apiH: hours(0, 1_000),
  admin: flag(),
  adminH: hours(0, 1_000),
  qa: flag(),
  qaH: hours(0, 1_000),
  buffer: num().check(z.minimum(0, 'Minimum is 0%'), z.maximum(50, 'Maximum is 50%')),
  maint: hours(0, 500),
});

export type AppCostState = z.infer<typeof appCostSchema>;

/** Currency-dependent defaults (same example rates as the website tool): only the hourly rate changes. */
export const appCostCurrencyPresets: CurrencyPresets<AppCostState> = {
  USD: { rate: 75 },
  CAD: { rate: 85 },
  AUD: { rate: 90 },
  GBP: { rate: 60 },
  EUR: { rate: 60 },
  INR: { rate: 1_500 },
};

const base: AppCostState = {
  currency: 'USD',
  rate: 75,
  ios: 1,
  android: 1,
  web: 0,
  extra: 60,
  screens: 8,
  hps: 6,
  setup: 20,
  login: 1,
  loginH: 16,
  pay: 0,
  payH: 24,
  push: 0,
  pushH: 8,
  chat: 0,
  chatH: 30,
  device: 0,
  deviceH: 12,
  offline: 0,
  offlineH: 20,
  api: 1,
  apiH: 40,
  admin: 0,
  adminH: 40,
  qa: 1,
  qaH: 20,
  buffer: 15,
  maint: 6,
};

export const appCostDefaults = defaultsForCurrency(base, appCostCurrencyPresets, 'USD');
export const appCostVariant = currencyVariant(appCostDefaults, appCostCurrencyPresets);

export function switchAppCostCurrency(state: AppCostState, next: CurrencyCode, touched?: ReadonlySet<string>): AppCostState {
  return switchCurrency(state, next, appCostDefaults, appCostCurrencyPresets, touched);
}

/** State key holding a feature's hours, e.g. 'login' → 'loginH'. */
export const hoursKey = <F extends AppFeature | SharedFeature>(f: F): `${F}H` => `${f}H`;

export const platformCount = (s: AppCostState) => PLATFORMS.filter((p) => s[p] === 1).length;

/**
 * Schema errors for the fields in use (hours of features that are off are ignored, the
 * extra-platform % only counts with 2+ platforms), plus "Choose at least one platform".
 */
export function appCostErrors(s: AppCostState): Partial<Record<keyof AppCostState | 'platforms', string>> {
  const all: Partial<Record<keyof AppCostState | 'platforms', string>> = fieldErrors(appCostSchema, s);
  for (const f of [...APP_FEATURES, ...SHARED_FEATURES]) if (s[f] !== 1) delete all[hoursKey(f)];
  const count = platformCount(s);
  if (count < 2) delete all.extra;
  if (count === 0) all.platforms = 'Choose at least one platform';
  return all;
}

export function toCalcInput(s: AppCostState): AppCostInput {
  const appFeatures: AppCostInput['appFeatures'] = {};
  for (const f of APP_FEATURES) if (s[f] === 1) appFeatures[f] = s[hoursKey(f)];
  const sharedFeatures: AppCostInput['sharedFeatures'] = {};
  for (const f of SHARED_FEATURES) if (s[f] === 1) sharedFeatures[f] = s[hoursKey(f)];
  return {
    rate: s.rate,
    platforms: platformCount(s),
    extraPlatform: s.extra / 100,
    screens: s.screens,
    hoursPerScreen: s.hps,
    setupHours: s.setup,
    appFeatures,
    sharedFeatures,
    buffer: s.buffer / 100,
    maintenanceHours: s.maint,
  };
}

export { fieldErrors };
