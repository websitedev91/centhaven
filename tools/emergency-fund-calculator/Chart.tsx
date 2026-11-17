'use client';

import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CATEGORICAL } from '@/lib/chart-palette';
import { formatMoney, type CurrencyCode } from '@/lib/format';
import type { PathPoint } from './calc';

const INK_MUTED = '#4F6661';
const LINE = '#D7E2DE';

const monthLabel = (m: number) => (m === 0 ? 'Now' : `Month ${m}`);

/**
 * Savings balance month by month (y) until the target (dashed line) is reached.
 * Single series, so no legend: the title names it. Loaded lazily (recharts is heavy).
 */
export default function SavingsGrowthChart(props: { path: PathPoint[]; target: number; currency: CurrencyCode }) {
  const { path, target, currency } = props;
  const compact = (v: number) => formatMoney(v, currency, 0);
  const last = path.at(-1)?.month ?? 0;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={path} margin={{ top: 24, right: 16, bottom: 8, left: 8 }}>
        <CartesianGrid stroke={LINE} vertical={false} />
        <XAxis
          dataKey="month"
          type="number"
          domain={[0, last]}
          allowDecimals={false}
          tickFormatter={(v: number) => (v === 0 ? 'Now' : String(v))}
          tick={{ fill: INK_MUTED, fontSize: 13 }}
          axisLine={{ stroke: LINE }}
          tickLine={false}
          label={{ value: 'Months from now', position: 'insideBottomRight', offset: -4, fill: INK_MUTED, fontSize: 13 }}
          height={40}
        />
        <YAxis
          tickFormatter={compact}
          tick={{ fill: INK_MUTED, fontSize: 13 }}
          axisLine={false}
          tickLine={false}
          width={88}
          domain={[0, target]}
          ticks={[0, target / 4, target / 2, (target * 3) / 4, target]}
        />
        <Tooltip
          formatter={(v) => [formatMoney(Number(v), currency), 'Saved']}
          labelFormatter={(l) => monthLabel(Number(l))}
          contentStyle={{ border: '1px solid #D7E2DE', borderRadius: 6, boxShadow: 'none', fontSize: 14, color: '#12302B' }}
        />
        <ReferenceLine
          y={target}
          stroke={INK_MUTED}
          strokeDasharray="4 4"
          label={{ value: `Target ${compact(target)}`, position: 'insideTopLeft', fill: INK_MUTED, fontSize: 13, dy: -18 }}
        />
        <Line type="linear" dataKey="balance" stroke={CATEGORICAL[0]} strokeWidth={2} dot={false} activeDot={{ r: 5, stroke: '#FFFFFF', strokeWidth: 2 }} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
