/**
 * Tiny CSV builder for schedule downloads (RFC 4180 quoting). Numbers are written plain,
 * rounded to 2 decimals, with no currency symbol or grouping, so spreadsheets read them as numbers.
 */
import { roundTo } from './format';

export type CsvCell = string | number;

function cell(v: CsvCell): string {
  if (typeof v === 'number') return Number.isFinite(v) ? String(roundTo(v, 2)) : '';
  return /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

export function toCsv(header: readonly string[], rows: readonly (readonly CsvCell[])[]): string {
  return [header, ...rows].map((r) => r.map(cell).join(',')).join('\r\n') + '\r\n';
}

/** Browser only: save a CSV string as a file. */
export function downloadCsv(filename: string, csv: string): void {
  const url = URL.createObjectURL(new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
