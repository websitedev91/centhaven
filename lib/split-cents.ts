/**
 * Exact-cent split (CLAUDE.md rule 3 exceptions: Rent Split and Wedding Budget, Puru 2026-11-21).
 * Split `totalCents` by `fractions` (they sum to 1): round each share DOWN to the cent, then hand
 * the leftover cents one by one to shares 1, 2, … in order, skipping any whose fraction is 0.
 * The shares always add up to the total exactly: 1,000 ÷ 3 → 333.34 / 333.33 / 333.33.
 */
export function splitCents(totalCents: number, fractions: readonly number[]): { cents: number[]; leftover: number } {
  const cents = fractions.map((f) => Math.floor(Number((totalCents * f).toPrecision(12))));
  const leftover = totalCents - cents.reduce((a, b) => a + b, 0);
  const takers = fractions.map((f, i) => (f > 0 ? i : -1)).filter((i) => i >= 0);
  const add = (index: number, delta: number) => {
    cents[index] = (cents[index] ?? 0) + delta;
  };
  let left = leftover;
  for (let k = 0; left > 0 && takers.length > 0; k++, left--) add(takers[k % takers.length] ?? 0, 1);
  // Floating-point safety: never hand out more than the total.
  for (let k = takers.length - 1; left < 0 && k >= 0; k--, left++) add(takers[k] ?? 0, -1);
  return { cents, leftover: Math.max(0, leftover) };
}

/** Money to whole cents, float-safe (19.99 → 1999). */
export function toCents(amount: number): number {
  return Math.round(Number((amount * 100).toPrecision(15)));
}
