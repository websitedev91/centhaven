/**
 * Display formatting. Money is rounded ONLY here, at display time (CLAUDE.md rule 3).
 */

export const CURRENCIES = ['USD', 'GBP', 'EUR', 'CAD', 'AUD', 'INR'] as const;
export type CurrencyCode = (typeof CURRENCIES)[number];

/** English locale per currency so grouping looks native (e.g. INR uses lakh grouping). */
const LOCALE: Record<CurrencyCode, string> = {
  USD: 'en-US',
  GBP: 'en-GB',
  EUR: 'en-IE',
  CAD: 'en-CA',
  AUD: 'en-AU',
  INR: 'en-IN',
};

export const CURRENCY_LABEL: Record<CurrencyCode, string> = {
  USD: 'US dollar (USD)',
  GBP: 'British pound (GBP)',
  EUR: 'Euro (EUR)',
  CAD: 'Canadian dollar (CAD)',
  AUD: 'Australian dollar (AUD)',
  INR: 'Indian rupee (INR)',
};

export function isCurrency(value: unknown): value is CurrencyCode {
  return typeof value === 'string' && (CURRENCIES as readonly string[]).includes(value);
}

export function localeFor(currency: CurrencyCode): string {
  return LOCALE[currency];
}

/** Round half away from zero to `decimals` places, avoiding binary float drift (1.005 → 1.01). */
export function roundTo(value: number, decimals = 2): number {
  if (!Number.isFinite(value)) return value;
  const factor = 10 ** decimals;
  const shifted = Math.abs(value) * factor;
  const rounded = Math.round(Number((shifted).toPrecision(15))) / factor;
  return Math.sign(value) * rounded || 0;
}

const cache = new Map<string, Intl.NumberFormat>();
function nf(locale: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = locale + JSON.stringify(options);
  let f = cache.get(key);
  if (!f) {
    f = new Intl.NumberFormat(locale, options);
    cache.set(key, f);
  }
  return f;
}

/**
 * Money for display. A value that isn't 0 but would round to 0 shows as "less than $0.01"
 * (or "loss of less than $0.01" when negative), in the right currency, never "$0.00"
 * (Puru, 2026-11-19).
 */
export function formatMoney(value: number, currency: CurrencyCode, decimals = 2): string {
  if (!Number.isFinite(value)) return '—';
  // Below 1e-9 is floating-point noise from the maths (e.g. 0.1 + 0.2 − 0.3), so it shows as 0.
  if (Math.abs(value) >= 1e-9 && roundTo(value, decimals) === 0) {
    const smallest = formatMoneyRaw(10 ** -decimals, currency, decimals);
    return value > 0 ? `less than ${smallest}` : `loss of less than ${smallest}`;
  }
  return formatMoneyRaw(Math.abs(value) < 1e-9 ? 0 : value, currency, decimals);
}

function formatMoneyRaw(value: number, currency: CurrencyCode, decimals: number): string {
  return nf(LOCALE[currency], {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(roundTo(value, decimals));
}

export function formatNumber(value: number, decimals = 0, locale = 'en-US'): string {
  if (!Number.isFinite(value)) return '—';
  return nf(locale, { minimumFractionDigits: 0, maximumFractionDigits: decimals }).format(roundTo(value, decimals));
}

/** `fraction` is 0–1 (0.25 → "25%"). */
export function formatPercent(fraction: number, decimals = 0, locale = 'en-US'): string {
  if (!Number.isFinite(fraction)) return '—';
  return nf(locale, { style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: decimals }).format(
    roundTo(fraction, decimals + 2),
  );
}

export function currencySymbol(currency: CurrencyCode): string {
  const part = nf(LOCALE[currency], { style: 'currency', currency, currencyDisplay: 'narrowSymbol' })
    .formatToParts(0)
    .find((p) => p.type === 'currency');
  return part?.value ?? currency;
}
