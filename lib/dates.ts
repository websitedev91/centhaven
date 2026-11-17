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
