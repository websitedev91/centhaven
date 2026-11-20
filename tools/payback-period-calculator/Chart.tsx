'use client';

import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CATEGORICAL } from '@/lib/chart-palette';
import { formatMoney, type CurrencyCode } from '@/lib/format';
import type { YearRow } from './calc';

const INK_MUTED = '#4F6661';
const LINE = '#D7E2DE';

/**
 * Running total of the cash flows by year (y), with the investment as a dashed line.
 * Where they meet is the payback. Single series, so no legend. Loaded lazily (recharts is heavy).
 */
export default function RunningTotalChart(props: { rows: readonly YearRow[]; investment: number; currency: CurrencyCode }) {
  const { rows, investment, currency } = props;
  const compact = (v: number) => formatMoney(v, currency, 0);
  const data = [{ year: 0, total: 0 }, ...rows.map((r) => ({ year: r.year, total: r.total }))];
  const top = Math.max(investment, ...data.map((d) => d.total), 1);
  // A loss year can take the running total below 0: round ticks (1, 2, 2.5 or 5 × 10ⁿ) that always include 0.
  const low = Math.min(0, ...data.map((d) => d.total));
  const raw = (top - low) / 4;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = ([1, 2, 2.5, 5, 10].find((f) => f * mag >= raw) ?? 10) * mag;
  const bottom = Math.floor(low / step) * step;
  const ticks: number[] = [];
  for (let t = bottom; t < top + step - 1e-9; t += step) ticks.push(t);
  const ceiling = ticks.at(-1) ?? top;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 24, right: 16, bottom: 8, left: 8 }}>
        <CartesianGrid stroke={LINE} vertical={false} />
        <XAxis
          dataKey="year"
          type="number"
          domain={[0, rows.length]}
          ticks={data.map((d) => d.year)}
          interval={0}
          allowDecimals={false}
          tickFormatter={(v: number) => (v === 0 ? 'Start' : String(v))}
          tick={{ fill: INK_MUTED, fontSize: 13 }}
          axisLine={{ stroke: LINE }}
          tickLine={false}
          label={{ value: 'Year', position: 'insideBottomRight', offset: -4, fill: INK_MUTED, fontSize: 13 }}
          height={40}
        />
        <YAxis
          tickFormatter={compact}
          tick={{ fill: INK_MUTED, fontSize: 13 }}
          axisLine={false}
          tickLine={false}
          width={88}
          domain={[bottom, ceiling]}
          ticks={ticks}
        />
        <Tooltip
          formatter={(v) => [formatMoney(Number(v), currency), 'Recovered']}
          labelFormatter={(l) => (Number(l) === 0 ? 'Start' : `End of year ${l}`)}
          contentStyle={{ border: '1px solid #D7E2DE', borderRadius: 6, boxShadow: 'none', fontSize: 14, color: '#12302B' }}
        />
        <ReferenceLine
          y={investment}
          stroke={INK_MUTED}
          strokeDasharray="4 4"
          label={{ value: `Investment ${compact(investment)}`, position: 'insideTopLeft', fill: INK_MUTED, fontSize: 13, dy: -18 }}
        />
        {bottom < 0 ? <ReferenceLine y={0} stroke={LINE} /> : null}
        <Line type="linear" dataKey="total" stroke={CATEGORICAL[0]} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5, stroke: '#FFFFFF', strokeWidth: 2 }} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
