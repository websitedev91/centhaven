'use client';

import { Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { formatMoney, type CurrencyCode } from '@/lib/format';
import { SLICES, type HourSplit } from './slices';

/** Donut showing where each billed hour's rate goes. Loaded lazily (recharts is heavy). */
export default function HourSplitChart({ split, currency }: { split: HourSplit; currency: CurrencyCode }) {
  const data = SLICES.map((s) => ({ name: s.label, value: split[s.key], fill: s.color })).filter((d) => d.value > 0);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius="58%"
          outerRadius="92%"
          paddingAngle={data.length > 1 ? 2 : 0}
          stroke="#FFFFFF"
          strokeWidth={2}
          isAnimationActive={false}
        />
        <Tooltip formatter={(v) => formatMoney(Number(v), currency)} />
      </PieChart>
    </ResponsiveContainer>
  );
}
