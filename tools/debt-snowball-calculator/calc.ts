/**
 * Debt Snowball Calculator: pure maths (spec: docs/specs/debt-snowball-calculator.md).
 * Every number comes from the user, including each interest rate. No React, no dates, no fetch.
 * No rounding during the simulation; money is rounded at display time only.
 */

export type DebtMethod = 'snowball' | 'avalanche';

export interface Debt {
  balance: number;
  /** APR as a percentage (12 = 12%). */
  apr: number;
  minimum: number;
}

export interface DebtInput {
  /** In row order. Rows with a balance of 0 are ignored. */
  debts: readonly Debt[];
  extra: number;
}

export interface Payoff {
  /** 0-based row index ("Debt 1" = 0). */
  row: number;
  /** Month the debt is cleared (1 = this month). */
  month: number;
}

export interface MethodResult {
  months: number;
  totalInterest: number;
  totalPaid: number;
  /** Ordered by the month each debt is cleared, then by the order they cleared within it. */
  order: Payoff[];
  /** Total balance at the end of each month; [0] is the starting total. */
  balances: number[];
}

export type DebtResult =
  | { ok: true; kind: 'none' }
  | {
      ok: true;
      kind: 'plan';
      payment: number;
      minimums: number;
      snowball: MethodResult;
      avalanche: MethodResult;
      /** Rows whose minimum is smaller than their first month's interest. */
      minBelowInterest: number[];
    }
  | { ok: false; kind: 'never'; payment: number; interest: number }
  | { ok: false; kind: 'cap' };

/** "This would take more than 50 years". */
export const MAX_MONTHS = 600;
/** Below this a balance counts as cleared (floating-point noise, far under one cent). */
const CLEARED = 1e-9;

interface Active extends Debt {
  row: number;
}

function targetOrder(debts: readonly Active[], method: DebtMethod): Active[] {
  return [...debts].sort((a, b) =>
    method === 'snowball'
      ? a.balance - b.balance || b.apr - a.apr || a.row - b.row
      : b.apr - a.apr || a.balance - b.balance || a.row - b.row,
  );
}

function simulate(debts: readonly Active[], payment: number, method: DebtMethod): MethodResult | null {
  const order = targetOrder(debts, method);
  const balance = new Map(order.map((d) => [d.row, d.balance]));
  const balances = [order.reduce((n, d) => n + d.balance, 0)];
  const cleared: Payoff[] = [];
  let totalInterest = 0;
  let month = 0;

  while (cleared.length < order.length) {
    month++;
    if (month > MAX_MONTHS) return null;
    // 1. Interest on every unpaid debt.
    for (const d of order) {
      const b = balance.get(d.row)!;
      if (b <= CLEARED) continue;
      const interest = (b * d.apr) / 100 / 12;
      totalInterest += interest;
      balance.set(d.row, b + interest);
    }
    // 2. Every unpaid debt gets its minimum (or what is left of it).
    let left = payment;
    for (const d of order) {
      const b = balance.get(d.row)!;
      if (b <= CLEARED) continue;
      const pay = Math.min(d.minimum, b);
      balance.set(d.row, b - pay);
      left -= pay;
    }
    // 3. The rest goes to the target; when it clears, on to the next target.
    for (const d of order) {
      if (left <= CLEARED) break;
      const b = balance.get(d.row)!;
      if (b <= CLEARED) continue;
      const pay = Math.min(left, b);
      balance.set(d.row, b - pay);
      left -= pay;
    }
    for (const d of order) {
      const b = balance.get(d.row)!;
      if (b <= CLEARED && !cleared.some((p) => p.row === d.row)) {
        balance.set(d.row, 0);
        cleared.push({ row: d.row, month });
      }
    }
    balances.push([...balance.values()].reduce((n, b) => n + Math.max(b, 0), 0));
  }

  const start = order.reduce((n, d) => n + d.balance, 0);
  return { months: month, totalInterest, totalPaid: start + totalInterest, order: cleared, balances };
}

export function debtPayoff(input: DebtInput): DebtResult {
  const active: Active[] = input.debts.map((d, row) => ({ ...d, row })).filter((d) => d.balance > 0);
  if (active.length === 0) return { ok: true, kind: 'none' };

  const minimums = active.reduce((n, d) => n + d.minimum, 0);
  const payment = minimums + input.extra;
  const interest = active.reduce((n, d) => n + (d.balance * d.apr) / 100 / 12, 0);
  // Compare at 10 significant digits so 200 vs 199.99999999 counts as equal.
  if (Number(payment.toPrecision(10)) <= Number(interest.toPrecision(10))) return { ok: false, kind: 'never', payment, interest };

  const snowball = simulate(active, payment, 'snowball');
  const avalanche = simulate(active, payment, 'avalanche');
  if (!snowball || !avalanche) return { ok: false, kind: 'cap' };

  const minBelowInterest = active.filter((d) => d.minimum < (d.balance * d.apr) / 100 / 12).map((d) => d.row);
  return { ok: true, kind: 'plan', payment, minimums, snowball, avalanche, minBelowInterest };
}

/** "31 months", "1 month". */
export function monthsText(n: number): string {
  return `${n.toLocaleString('en-US')} ${n === 1 ? 'month' : 'months'}`;
}

/** "about 2 years and 7 months" (whole years only when the months are 0). */
export function yearsAndMonths(n: number): string {
  const y = Math.floor(n / 12);
  const m = n % 12;
  const years = `${y} ${y === 1 ? 'year' : 'years'}`;
  const months = `${m} ${m === 1 ? 'month' : 'months'}`;
  if (y === 0) return months;
  return m === 0 ? years : `${years} and ${months}`;
}

/** "Debt 1 (month 10) → Debt 2 (month 26)"; debts cleared in the same month are joined with "and". */
export function formatOrder(order: readonly Payoff[]): string {
  const groups: Payoff[][] = [];
  for (const p of order) {
    const last = groups.at(-1);
    if (last && last[0]!.month === p.month) last.push(p);
    else groups.push([p]);
  }
  return groups.map((g) => g.map((p) => `Debt ${p.row + 1} (month ${p.month})`).join(' and ')).join(' → ');
}

/** Up to `max` chart points (always the first and last month). */
export function chartPoints(r: { snowball: MethodResult; avalanche: MethodResult }, max = 60) {
  const last = Math.max(r.snowball.months, r.avalanche.months);
  const step = Math.max(1, Math.ceil(last / (max - 1)));
  const months: number[] = [];
  for (let m = 0; m < last; m += step) months.push(m);
  months.push(last);
  const at = (b: number[], m: number) => b[Math.min(m, b.length - 1)] ?? 0;
  return months.map((month) => ({ month, snowball: at(r.snowball.balances, month), avalanche: at(r.avalanche.balances, month) }));
}
