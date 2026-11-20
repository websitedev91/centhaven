/**
 * Durations in words, the same on every tool (Puru, 2026-11-20):
 * "4 years" (not "4 years and 0 months"), "3 years and 9 months", "1 year", "1 month",
 * "2 years, 6 months and 3 days". Zero parts are left out; all zero → "0 months".
 */

/** "1 month", "2 months", "1,200 months". */
export function plural(n: number, unit: 'year' | 'month' | 'day' | 'week'): string {
  return `${n.toLocaleString('en-US')} ${n === 1 ? unit : `${unit}s`}`;
}

/** "a", "a and b", "a, b and c". */
function joinParts(parts: string[]): string {
  if (parts.length <= 1) return parts[0] ?? '';
  return `${parts.slice(0, -1).join(', ')} and ${parts.at(-1)}`;
}

export function formatDuration(d: { years?: number; months?: number; days?: number }): string {
  const parts: string[] = [];
  if (d.years) parts.push(plural(d.years, 'year'));
  if (d.months) parts.push(plural(d.months, 'month'));
  if (d.days) parts.push(plural(d.days, 'day'));
  return parts.length > 0 ? joinParts(parts) : plural(0, 'month');
}

/** Whole months as years and months: 31 → "2 years and 7 months", 24 → "2 years", 1 → "1 month". */
export function monthsToDuration(totalMonths: number, days = 0): string {
  const m = Math.max(0, Math.round(totalMonths));
  return formatDuration({ years: Math.floor(m / 12), months: m % 12, days });
}

/**
 * Fractional years as years and whole months, months rounded; 12 months roll into the next year:
 * 3.75 → "3 years and 9 months", 4 → "4 years", 3.997 → "4 years", 0.5 → "6 months".
 */
export function yearsToDuration(years: number): string {
  let y = Math.floor(years);
  let m = Math.round(Number(((years - y) * 12).toPrecision(12)));
  if (m === 12) {
    y += 1;
    m = 0;
  }
  return formatDuration({ years: y, months: m });
}
