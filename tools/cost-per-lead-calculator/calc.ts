/**
 * Cost Per Lead Calculator: pure maths (spec: docs/specs/cost-per-lead-calculator.md).
 * Every number comes from the user. No React, no dates, no fetch. Round at display time only.
 */

export interface CplInput {
  spend: number;
  /** Leads from this spend (≥ 1). */
  leads: number;
  /** Lead-to-customer rate as a fraction (0.1 = 10%). 0 = off. */
  rate: number;
}

export interface CplResult {
  cpl: number;
  /** leads × rate, or null when the rate is off. Can be fractional (7.5). */
  customers: number | null;
  /** spend ÷ customers, or null when the rate is off. */
  costPerCustomer: number | null;
  /** 1 ÷ rate, or null when the rate is off. */
  leadsPerCustomer: number | null;
}

export function costPerLead(input: CplInput): CplResult {
  const { spend, leads, rate } = input;
  const on = rate > 0;
  const customers = on ? leads * rate : null;
  return {
    cpl: spend / leads,
    customers,
    costPerCustomer: customers === null ? null : spend / customers,
    leadsPerCustomer: on ? 1 / rate : null,
  };
}

/**
 * Customers as shown (Puru, 2026-11-19): whole → "8 customers"; fractional →
 * "about 7.5 customers (on average)", up to 2 decimals.
 */
export function formatCustomers(n: number): string {
  const rounded = Math.round(Number((n * 100).toPrecision(15))) / 100;
  const text = rounded.toLocaleString('en-US', { maximumFractionDigits: 2 });
  if (Number.isInteger(rounded)) return `${text} ${rounded === 1 ? 'customer' : 'customers'}`;
  return `about ${text} customers (on average)`;
}
