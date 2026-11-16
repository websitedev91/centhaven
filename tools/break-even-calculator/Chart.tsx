'use client';

import { CartesianGrid, Legend, Line, LineChart, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CATEGORICAL } from '@/lib/chart-palette';
import { formatMoney, formatNumber, type CurrencyCode } from '@/lib/format';

const INK = '#12302B';
const INK_MUTED = '#4F6661';
const LINE = '#D7E2DE';

/**
 * Classic break-even chart: revenue and total cost from 0 to about 2× break-even sales, with the
 * crossing point marked. Two series, so a legend (text in ink, not series colour). Loaded lazily.
 */
export default function BreakEvenChart(props: {
  lines: { units: number; revenue: number; totalCost: number }[];
  breakEven: { units: number; revenue: number };
  currency: CurrencyCode;
  noun: string;
}) {
  const { lines, breakEven, currency, noun } = props;
  const compact = (v: number) => formatMoney(v, currency, 0);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={lines} margin={{ top: 16, right: 16, bottom: 8, left: 8 }}>
        <CartesianGrid stroke={LINE} vertical={false} />
        <XAxis
          dataKey="units"
          type="number"
          domain={[0, 'dataMax']}
          tickFormatter={(v: number) => formatNumber(v)}
          tick={{ fill: INK_MUTED, fontSize: 13 }}
          axisLine={{ stroke: LINE }}
          tickLine={false}
        />
        <YAxis tickFormatter={compact} tick={{ fill: INK_MUTED, fontSize: 13 }} axisLine={false} tickLine={false} width={96} />
        <Tooltip
          formatter={(v, name) => [formatMoney(Number(v), currency), name]}
          labelFormatter={(l) => `${formatNumber(Number(l), 1)} ${noun}`}
          contentStyle={{ border: '1px solid #D7E2DE', borderRadius: 6, boxShadow: 'none', fontSize: 14, color: INK }}
        />
        <Legend
          verticalAlign="top"
          align="left"
          iconType="plainline"
          wrapperStyle={{ paddingBottom: 8, fontSize: 14 }}
          formatter={(value) => <span style={{ color: INK }}>{value}</span>}
        />
        <Line name="Revenue" type="linear" dataKey="revenue" stroke={CATEGORICAL[0]} strokeWidth={2} dot={false} isAnimationActive={false} />
        <Line name="Total cost" type="linear" dataKey="totalCost" stroke={CATEGORICAL[1]} strokeWidth={2} dot={false} isAnimationActive={false} />
        <ReferenceDot
          x={breakEven.units}
          y={breakEven.revenue}
          r={5}
          fill={INK}
          stroke="#FFFFFF"
          strokeWidth={2}
          label={{ value: 'Break-even', position: 'top', fill: INK, fontSize: 13 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
