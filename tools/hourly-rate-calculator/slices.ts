/** Chart slices (palette validated with the dataviz checker, 2026-11-16), kept separate from Chart.tsx so the calculator can show the legend without loading recharts. */
export interface HourSplit {
  takeHome: number;
  tax: number;
  expenses: number;
}

export const SLICES = [
  { key: 'takeHome', label: 'Take-home pay', color: '#008C7E' },
  { key: 'tax', label: 'Tax', color: '#B8862B' },
  { key: 'expenses', label: 'Business expenses', color: '#5A74CC' },
] as const;
