// zod/mini keeps the client bundle small (same validation, tree-shakable API).
import * as z from 'zod/mini';
import { CURRENCIES, type CurrencyCode } from '@/lib/format';
import { currencyVariant, defaultsForCurrency, switchCurrency, type CurrencyPresets } from '@/lib/currency-defaults';
import { FEATURES, type Feature, type WebsiteCostInput } from './calc';

const num = () => z.number({ error: 'Enter a number' });
const hours = (min: number, max: number) =>
  num().check(z.minimum(min, `Minimum is ${min} hours`), z.maximum(max, `Maximum is ${max} hours`));
/** On/off flags are 0/1 numbers so they fit the flat URL state. */
const flag = () => num().check(z.refine((v) => v === 0 || v === 1, 'Use 0 or 1'));

export const websiteCostSchema = z.object({
  currency: z.enum(CURRENCIES),
  rate: num().check(z.minimum(0, 'Rate can’t be negative'), z.maximum(1_000_000, 'Maximum is 1,000,000')),
  pages: num().check(
    z.refine((v) => Number.isInteger(v), 'Use a whole number of pages'),
    z.minimum(1, 'Minimum is 1 page'),
    z.maximum(100, 'Maximum is 100 pages'),
  ),
  hpp: hours(0.5, 100),
  level: z.enum(['template', 'custom', 'premium']),
  setup: hours(0, 500),
  contact: flag(),
  contactH: hours(0, 500),
  blog: flag(),
  blogH: hours(0, 500),
  shop: flag(),
  shopH: hours(0, 500),
  booking: flag(),
  bookingH: hours(0, 500),
  lang: flag(),
  langH: hours(0, 500),
  seo: flag(),
  seoH: hours(0, 500),
  copy: flag(),
  copyH: hours(0, 100),
  buffer: num().check(z.minimum(0, 'Minimum is 0%'), z.maximum(50, 'Maximum is 50%')),
  maint: hours(0, 200),
});

export type WebsiteCostState = z.infer<typeof websiteCostSchema>;

/** Currency-dependent defaults (spec, approved): only the example hourly rate changes. */
export const websiteCostCurrencyPresets: CurrencyPresets<WebsiteCostState> = {
  USD: { rate: 75 },
  CAD: { rate: 85 },
  AUD: { rate: 90 },
  GBP: { rate: 60 },
  EUR: { rate: 60 },
  INR: { rate: 1_500 },
};

const base: WebsiteCostState = {
  currency: 'USD',
  rate: 75,
  pages: 5,
  hpp: 4,
  level: 'custom',
  setup: 6,
  contact: 1,
  contactH: 2,
  blog: 0,
  blogH: 6,
  shop: 0,
  shopH: 25,
  booking: 0,
  bookingH: 8,
  lang: 0,
  langH: 10,
  seo: 1,
  seoH: 5,
  copy: 0,
  copyH: 2,
  buffer: 15,
  maint: 2,
};

export const websiteCostDefaults = defaultsForCurrency(base, websiteCostCurrencyPresets, 'USD');
export const websiteCostVariant = currencyVariant(websiteCostDefaults, websiteCostCurrencyPresets);

export function switchWebsiteCostCurrency(state: WebsiteCostState, next: CurrencyCode, touched?: ReadonlySet<string>): WebsiteCostState {
  return switchCurrency(state, next, websiteCostDefaults, websiteCostCurrencyPresets, touched);
}

/** State key holding a feature's hours, e.g. 'contact' → 'contactH'. */
export const hoursKey = <F extends Feature>(f: F): `${F}H` => `${f}H`;

export function toCalcInput(s: WebsiteCostState): WebsiteCostInput {
  const features: WebsiteCostInput['features'] = {};
  for (const f of FEATURES) if (s[f] === 1) features[f] = s[hoursKey(f)];
  return {
    rate: s.rate,
    pages: s.pages,
    hoursPerPage: s.hpp,
    level: s.level,
    setupHours: s.setup,
    features,
    copyHoursPerPage: s.copy === 1 ? s.copyH : 0,
    buffer: s.buffer / 100,
    maintenanceHours: s.maint,
  };
}

export { fieldErrors } from '@/lib/field-errors';
