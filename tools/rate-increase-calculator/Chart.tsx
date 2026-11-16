'use client';

import { CartesianGrid, Line, LineChart, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CATEGORICAL } from '@/lib/chart-palette';
import { formatMoney, formatPercent, type CurrencyCode } from '@/lib/format';

const INK_MUTED = '#4F6661';
const LINE = '#D7E2DE';

/**
 * Monthly income at the new rate (y) against work lost, 0–50% (x), with today's income as a
 * flat reference line. Where they cross is the break-even. Loaded lazily (recharts is heavy).
 */
export default function IncomeCurveChart(props: {
  curve: { loss: number; income: number }[];
  today: number;
  breakEvenLoss: number;
  currency: CurrencyCode;
}) {
  const { curve, today, breakEvenLoss, currency } = props;
  const data = curve.map((p) => ({ loss: p.loss * 100, income: p.income }));
  const compact = (v: number) => formatMoney(v, currency, 0);
  const crossing = breakEvenLoss <= 0.5 ? breakEvenLoss * 100 : undefined;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 16, right: 16, bottom: 8, left: 8 }}>
        <CartesianGrid stroke={LINE} vertical={false} />
        <XAxis
          dataKey="loss"
          type="number"
          domain={[0, 50]}
          ticks={[0, 10, 20, 30, 40, 50]}
          tickFormatter={(v: number) => `${v}%`}
          tick={{ fill: INK_MUTED, fontSize: 13 }}
          axisLine={{ stroke: LINE }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={compact}
          tick={{ fill: INK_MUTED, fontSize: 13 }}
          axisLine={false}
          tickLine={false}
          width={88}
          domain={[0, 'auto']}
        />
        <Tooltip
          formatter={(v) => [formatMoney(Number(v), currency), 'Income after the increase']}
          labelFormatter={(l) => `${formatPercent(Number(l) / 100)} of work lost`}
          contentStyle={{ border: '1px solid #D7E2DE', borderRadius: 6, boxShadow: 'none', fontSize: 14, color: '#12302B' }}
        />
        <ReferenceLine
          y={today}
          stroke={INK_MUTED}
          strokeDasharray="4 4"
          label={{ value: `Today ${compact(today)}`, position: 'insideTopRight', fill: INK_MUTED, fontSize: 13 }}
        />
        <Line type="linear" dataKey="income" stroke={CATEGORICAL[0]} strokeWidth={2} dot={false} isAnimationActive={false} />
        {crossing !== undefined ? (
          <ReferenceDot x={crossing} y={today} r={5} fill={CATEGORICAL[0]} stroke="#FFFFFF" strokeWidth={2} />
        ) : null}
      </LineChart>
    </ResponsiveContainer>
  );
}
