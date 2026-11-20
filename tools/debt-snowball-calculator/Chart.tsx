'use client';

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CATEGORICAL } from '@/lib/chart-palette';
import { formatMoney, type CurrencyCode } from '@/lib/format';

const INK_MUTED = '#4F6661';
const LINE = '#D7E2DE';

export interface DebtChartPoint {
  month: number;
  snowball: number;
  avalanche: number;
}

/**
 * Total debt left at the end of each month, one line per method. The legend with names and
 * values is HTML under the chart (never colour alone; avalanche is also dashed).
 * Loaded lazily (recharts is heavy).
 */
export default function DebtBalanceChart(props: { points: readonly DebtChartPoint[]; currency: CurrencyCode }) {
  const { points, currency } = props;
  const compact = (v: number) => formatMoney(v, currency, 0);
  const last = points.at(-1)?.month ?? 0;
  const top = Math.max(...points.map((p) => Math.max(p.snowball, p.avalanche)), 1);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={[...points]} margin={{ top: 16, right: 16, bottom: 8, left: 8 }}>
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
          formatter={(v, name) => [formatMoney(Number(v), currency), name === 'snowball' ? 'Snowball' : 'Avalanche']}
          labelFormatter={(l) => (Number(l) === 0 ? 'Now' : `Month ${l}`)}
          contentStyle={{ border: '1px solid #D7E2DE', borderRadius: 6, boxShadow: 'none', fontSize: 14, color: '#12302B' }}
        />
        <Line type="linear" dataKey="snowball" stroke={CATEGORICAL[0]} strokeWidth={2} dot={false} isAnimationActive={false} />
        <Line
          type="linear"
          dataKey="avalanche"
          stroke={CATEGORICAL[1]}
          strokeWidth={2}
          strokeDasharray="6 4"
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
