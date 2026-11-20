/**
 * CPC Calculator: pure maths (spec: docs/specs/cpc-calculator.md).
 * Every number comes from the user. No React, no dates, no fetch. Round at display time only.
 */

export type CpcMode = 'find' | 'clicks';

export interface CpcInput {
  mode: CpcMode;
  /** find: ad spend · clicks: budget. */
  money: number;
  /** find mode: clicks from the spend (≥ 1). */
  clicks: number;
  /** clicks mode: cost per click (> 0). */
  cpc: number;
  /** Conversion rate as a fraction (0.04 = 4%). 0 = off. */
  rate: number;
}

export interface CpcResult {
  cpc: number;
  /** Clicks used (unrounded in clicks mode, e.g. 333.33). */
  clicks: number;
  conversions: number | null;
  costPerConversion: number | null;
  clicksPerConversion: number | null;
}

export function cpc(input: CpcInput): CpcResult {
  const { mode, money, rate } = input;
  const clicks = mode === 'find' ? input.clicks : money / input.cpc;
  const cost = mode === 'find' ? money / input.clicks : input.cpc;
  const on = rate > 0;
  const conversions = on ? clicks * rate : null;
  return {
    cpc: cost,
    clicks,
    conversions,
    // 0 conversions (a budget of 0) → cost per conversion 0, never 0 ÷ 0.
    costPerConversion: conversions === null ? null : conversions === 0 ? 0 : money / conversions,
    clicksPerConversion: on ? 1 / rate : null,
  };
}

/** 12 significant digits, so 1,000 ÷ 1.25 or 800 × 0.03 count as whole numbers. */
const clean = (n: number) => Number(n.toPrecision(12));

/** "800 clicks"; fractional → "about 333 clicks" (rounded down: you can't buy part of a click). */
export function formatClicks(n: number): string {
  const c = clean(n);
  const whole = Math.floor(c);
  const text = `${whole.toLocaleString('en-US')} ${whole === 1 ? 'click' : 'clicks'}`;
  return Number.isInteger(c) ? text : `about ${text}`;
}

/** "10 conversions"; fractional → "about 13.5 conversions (on average)", up to 2 decimals. */
export function formatConversions(n: number): string {
  const rounded = Math.round(clean(n) * 100) / 100;
  const text = rounded.toLocaleString('en-US', { maximumFractionDigits: 2 });
  if (Number.isInteger(rounded)) return `${text} ${rounded === 1 ? 'conversion' : 'conversions'}`;
  return `about ${text} conversions (on average)`;
}

/** "About 25 clicks for each conversion" (1 decimal at most). */
export function formatClicksPerConversion(n: number): string {
  const text = clean(n).toLocaleString('en-US', { maximumFractionDigits: 1 });
  return `About ${text} ${text === '1' ? 'click' : 'clicks'} for each conversion`;
}
