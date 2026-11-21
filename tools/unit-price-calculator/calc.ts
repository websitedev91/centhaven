/**
 * Unit Price Calculator: pure maths (spec: docs/specs/unit-price-calculator.md).
 * Every price and size comes from the user. The only fixed numbers are unit definitions
 * (measurement, not finance). No React, no dates, no fetch. Round at display time only.
 */

export type Kind = 'weight' | 'volume' | 'count';

/** Unit definitions: size of one unit in the kind's base unit (g, ml or 1 item). */
export const UNITS = {
  g: { kind: 'weight', factor: 1, label: 'g' },
  kg: { kind: 'weight', factor: 1000, label: 'kg' },
  oz: { kind: 'weight', factor: 28.349523125, label: 'oz' },
  lb: { kind: 'weight', factor: 453.59237, label: 'lb' },
  ml: { kind: 'volume', factor: 1, label: 'ml' },
  l: { kind: 'volume', factor: 1000, label: 'l' },
  flozUS: { kind: 'volume', factor: 29.5735295625, label: 'fl oz (US)' },
  flozUK: { kind: 'volume', factor: 28.4130625, label: 'fl oz (UK)' },
  count: { kind: 'count', factor: 1, label: 'items' },
} as const satisfies Record<string, { kind: Kind; factor: number; label: string }>;
export type Unit = keyof typeof UNITS;

/** "Show price per" options, by kind; the first is the fallback. */
export const PER = {
  per100g: { kind: 'weight', factor: 100, label: 'per 100 g' },
  perKg: { kind: 'weight', factor: 1000, label: 'per kg' },
  perOz: { kind: 'weight', factor: UNITS.oz.factor, label: 'per oz' },
  perLb: { kind: 'weight', factor: UNITS.lb.factor, label: 'per lb' },
  per100ml: { kind: 'volume', factor: 100, label: 'per 100 ml' },
  perL: { kind: 'volume', factor: 1000, label: 'per l' },
  perFlozUS: { kind: 'volume', factor: UNITS.flozUS.factor, label: 'per fl oz (US)' },
  perFlozUK: { kind: 'volume', factor: UNITS.flozUK.factor, label: 'per fl oz (UK)' },
  perItem: { kind: 'count', factor: 1, label: 'per item' },
} as const satisfies Record<string, { kind: Kind; factor: number; label: string }>;
export type Per = keyof typeof PER;

export const kindOf = (u: Unit): Kind => UNITS[u].kind;

/** The "per" to use: the chosen one if it fits the kind, otherwise the kind's first option. */
export function perFor(kind: Kind, chosen: Per): Per {
  if (PER[chosen].kind === kind) return chosen;
  return (Object.keys(PER) as Per[]).find((p) => PER[p].kind === kind)!;
}

export interface Item {
  price: number;
  quantity: number;
  unit: Unit;
}

export interface UnitPriceResult {
  /** Price per base unit (g, ml or item) for each item. */
  perBase: number[];
  /** Price per the chosen "per" unit, for display. */
  shown: number[];
  /** Indexes of the cheapest item(s): more than one when they tie. */
  cheapest: number[];
  /** (item − cheapest) ÷ cheapest, as a fraction; 0 for the cheapest and ties. */
  more: number[];
  /** Dearest item vs the cheapest: (1 − cheapest ÷ dearest) as a fraction, null when all tie. */
  saving: { from: number; to: number; fraction: number } | null;
}

/** Same price per unit to 6 significant digits, so float noise never breaks a tie. */
const same = (a: number, b: number) => Number(a.toPrecision(6)) === Number(b.toPrecision(6));

export function unitPrices(items: readonly Item[], per: Per): UnitPriceResult {
  const perBase = items.map((i) => i.price / (i.quantity * UNITS[i.unit].factor));
  const shown = perBase.map((p) => p * PER[per].factor);
  const min = Math.min(...perBase);
  const cheapest = perBase.map((p, i) => (same(p, min) ? i : -1)).filter((i) => i >= 0);
  const more = perBase.map((p) => (same(p, min) ? 0 : (p - min) / min));
  const max = Math.max(...perBase);
  const dearest = perBase.findIndex((p) => p === max);
  const saving = same(max, min) ? null : { from: dearest, to: cheapest[0]!, fraction: 1 - min / max };
  return { perBase, shown, cheapest, more, saving };
}

/** "Item 2", "Items 1 and 3", "Items 1, 2 and 4". */
export function itemNames(indexes: readonly number[]): string {
  const n = indexes.map((i) => String(i + 1));
  if (n.length === 1) return `Item ${n[0]}`;
  return `Items ${n.slice(0, -1).join(', ')} and ${n.at(-1)}`;
}
