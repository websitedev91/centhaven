/** Chart slices, kept separate from Chart.tsx so the calculator can show the legend without loading recharts. */
export interface HourSplit {
  takeHome: number;
  tax: number;
  expenses: number;
}

export const SLICES = [
  { key: 'takeHome', label: 'Take-home pay', color: '#0F766E' },
  { key: 'tax', label: 'Tax', color: '#F59E0B' },
  { key: 'expenses', label: 'Business expenses', color: '#64748B' },
] as const;
