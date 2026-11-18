'use client';

import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CATEGORICAL } from '@/lib/chart-palette';
import { formatMoney, type CurrencyCode } from '@/lib/format';

const INK_MUTED = '#4F6661';
const LINE = '#D7E2DE';

export interface BalancePoint {
  month: number;
  value: number;
}

/**
 * One money balance month by month (savings growing to a goal, cash running down to zero).
 * Single series, so no legend: the chart title names it. Import lazily with next/dynamic
 * (ssr: false), because recharts is heavy.
 */
export default function BalanceChart(props: {
  points: readonly BalancePoint[];
  currency: CurrencyCode;
  /** Tooltip name for the value, e.g. "Saved" or "Cash left". */
  valueLabel: string;
  reference?: { y: number; label: string };
}) {
  const { points, currency, valueLabel, reference } = props;
  const compact = (v: number) => formatMoney(v, currency, 0);
  const last = points.at(-1)?.month ?? 0;
  const top = Math.max(reference?.y ?? 0, ...points.map((p) => p.value), 1);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={[...points]} margin={{ top: 24, right: 16, bottom: 8, left: 8 }}>
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
          domain={[0, top]}
          ticks={[0, top / 4, top / 2, (top * 3) / 4, top]}
        />
        <Tooltip
          formatter={(v) => [formatMoney(Number(v), currency), valueLabel]}
          labelFormatter={(l) => (Number(l) === 0 ? 'Now' : `Month ${l}`)}
          contentStyle={{ border: '1px solid #D7E2DE', borderRadius: 6, boxShadow: 'none', fontSize: 14, color: '#12302B' }}
        />
        {reference ? (
          <ReferenceLine
            y={reference.y}
            stroke={INK_MUTED}
            strokeDasharray="4 4"
            label={{ value: reference.label, position: 'insideTopLeft', fill: INK_MUTED, fontSize: 13, dy: -18 }}
          />
        ) : null}
        <Line type="linear" dataKey="value" stroke={CATEGORICAL[0]} strokeWidth={2} dot={false} activeDot={{ r: 5, stroke: '#FFFFFF', strokeWidth: 2 }} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
