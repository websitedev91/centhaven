const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** "2026-11-14" → "14 November 2026". Parses the string directly, so no timezone shift. */
export function formatIsoDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const [, y, mo, d] = m;
  const month = MONTHS[Number(mo) - 1];
  return month ? `${Number(d)} ${month} ${y}` : iso;
}

/**
 * Month name and year `add` months after a given month: (2026, 10, 14) → "January 2028".
 * `month0` is 0-based (January = 0), like Date#getMonth. Pure: the caller supplies "today".
 */
export function monthYearAfter(year: number, month0: number, add: number): string {
  const total = year * 12 + month0 + add;
  return `${MONTHS[((total % 12) + 12) % 12]} ${Math.floor(total / 12)}`;
}

/**
 * Month of the last of `payments` monthly payments when the first is made this month:
 * 14 payments from November 2026 → "December 2027" (this month counts as payment 1).
 */
export function lastPaymentMonth(year: number, month0: number, payments: number): string {
  return monthYearAfter(year, month0, Math.max(payments, 1) - 1);
}

/**
 * Calendar date `days` after an ISO date: ("2026-01-31", 30) → "2026-03-02".
 * UTC maths, so no daylight-saving or timezone shift. Invalid input is returned unchanged.
 */
export function addDays(iso: string, days: number): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m || !Number.isFinite(days)) return iso;
  const t = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])) + Math.trunc(days) * 86_400_000;
  return new Date(t).toISOString().slice(0, 10);
}

/** ISO date ("2026-11-18") for a Date in the user's own timezone. The caller supplies the Date. */
export function isoDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
