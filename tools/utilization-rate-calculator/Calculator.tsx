'use client';

import { useRef } from 'react';
import { CalculatorGrid, InputsPanel } from '@/components/CalculatorGrid';
import { CurrencySelect } from '@/components/CurrencySelect';
import { InputCurrency } from '@/components/InputCurrency';
import { InputNumber } from '@/components/InputNumber';
import { ResetIcon } from '@/components/icons';
import { ResultCard } from '@/components/ResultCard';
import { SelectField } from '@/components/SelectField';
import { Slider } from '@/components/Slider';
import { SplitBar } from '@/components/SplitBar';
import { track } from '@/lib/analytics';
import { CATEGORICAL, MUTED_FILL } from '@/lib/chart-palette';
import { formatMoney, formatNumber, formatPercent, type CurrencyCode } from '@/lib/format';
import { useUrlState } from '@/lib/url-state';
import { utilizationRate, type UtilizationError, type UtilizationResult } from './calc';
import {
  fieldErrors,
  switchUtilizationCurrency,
  toCalcInput,
  utilizationDefaults,
  utilizationSchema,
  utilizationVariant,
  type Period,
  type UtilizationState,
} from './schema';

const SLUG = 'utilization-rate-calculator';
const FIX_FIELDS = 'Check the highlighted fields to see your utilization.';
const PERIOD_LABEL: Record<Period, string> = { week: 'this week', month: 'this month', year: 'this year' };

const hrs = (n: number) => `${formatNumber(n, 1)} ${n === 1 ? 'hour' : 'hours'}`;

export default function UtilizationRateCalculator() {
  const { state: s, setField, setAll, reset } = useUrlState(utilizationSchema, utilizationDefaults, {
    variant: utilizationVariant,
  });
  const tracked = useRef(false);

  function update<K extends keyof UtilizationState>(key: K, value: UtilizationState[K]) {
    setField(key, value);
    if (!tracked.current) {
      tracked.current = true;
      track('calculate', { tool: SLUG });
    }
  }

  const c = s.currency;
  const errors = fieldErrors(utilizationSchema, s);
  const result: UtilizationResult | UtilizationError =
    Object.keys(errors).length > 0 ? { ok: false, error: FIX_FIELDS } : utilizationRate(toCalcInput(s));
  const period = PERIOD_LABEL[s.period];
  const label = 'Utilization rate';

  return (
    <div className="flex flex-col gap-6">
      <CalculatorGrid
        inputs={
          <InputsPanel
            label="Your hours"
            footer={
              <button
                type="button"
                onClick={reset}
                className="no-print type-small inline-flex items-center gap-1.5 font-[550] text-ink-muted hover:text-ink"
              >
                <ResetIcon size={16} />
                Reset to defaults
              </button>
            }
          >
            <div className="grid gap-x-6 gap-y-7 sm:grid-cols-2">
              <SelectField<Period>
                label="Period"
                value={s.period}
                onChange={(v) => update('period', v)}
                options={[
                  { value: 'week', label: 'Week' },
                  { value: 'month', label: 'Month' },
                  { value: 'year', label: 'Year' },
                ]}
                help="Use the same period for every number."
              />
              <CurrencySelect value={c} onChange={(next: CurrencyCode) => setAll(switchUtilizationCurrency(s, next))} />
              <InputNumber
                label="Billable hours"
                value={s.billable}
                onChange={(v) => update('billable', v)}
                suffix="hours"
                help="Hours a client pays for."
                error={errors.billable}
              />
              <InputNumber
                label="Available hours"
                value={s.available}
                onChange={(v) => update('available', v)}
                suffix="hours"
                help="All the hours you (or the team) could work."
                error={errors.available}
              />
              <div className="sm:col-span-2">
                <InputNumber optional
                  label="Leave/holiday hours to exclude"
                  help="Optional. Holidays, sick leave or public holidays in this period. Leaves your net capacity."
                  value={s.leave}
                  onChange={(v) => update('leave', v)}
                  suffix="hours"
                  error={errors.leave}
                />
              </div>
              <div className="sm:col-span-2">
                <Slider
                  label="Target utilization"
                  value={s.target}
                  onChange={(v) => update('target', v)}
                  min={10}
                  max={100}
                  format={(v) => `${v}%`}
                  unit="%"
                  help="Many agencies aim for 70–80%. A common range, not a rule."
                  error={errors.target}
                />
              </div>
              <div className="sm:col-span-2">
                <InputCurrency optional
                  label="Hourly rate (optional)"
                  help="Used for the revenue gap. Leave at 0 to skip it."
                  currency={c}
                  value={s.rate}
                  onChange={(v) => update('rate', v)}
                  error={errors.rate}
                />
              </div>
            </div>
          </InputsPanel>
        }
        result={
          result.ok ? (
            <ResultCard
              label={label}
              value={formatPercent(result.utilization, 2)}
              unit={`${period} · target ${s.target}%`}
              tone={result.gapHours <= 0 ? 'positive' : undefined}
              rows={[
                ...(result.netAvailable < result.grossAvailable
                  ? [
                      {
                        label: 'Net available hours',
                        note: `${formatNumber(result.grossAvailable, 1)} available − ${formatNumber(result.grossAvailable - result.netAvailable, 1)} leave`,
                        value: formatNumber(result.netAvailable, 1),
                      },
                    ]
                  : []),
                { label: 'Billable hours at target', value: formatNumber(result.targetHours, 1) },
                result.gapHours > 0
                  ? { label: 'Below target by', value: hrs(result.gapHours) }
                  : { label: 'Above target by', note: result.gapHours === 0 ? 'Exactly on target' : undefined, value: hrs(-result.gapHours) },
                { label: 'Revenue gap', note: s.rate > 0 ? `At ${formatMoney(s.rate, c)} an hour` : 'Add a rate to see it', value: formatMoney(result.revenueGap, c) },
                { label: 'Non-billable hours', value: formatNumber(result.nonBillable, 1) },
              ]}
            />
          ) : (
            <ResultCard label={label} value="" unit="" rows={[]} error={result.error} />
          )
        }
      />

      {result.ok ? (
        <SplitBar
          title="Billable and non-billable hours"
          description={`${hrs(result.netAvailable)} available ${period}${result.netAvailable < result.grossAvailable ? " after leave" : ""}. The line marks your ${s.target}% target.`}
          total={result.netAvailable}
          marker={{ at: result.targetHours, label: `Target ${s.target}%` }}
          parts={[
            { key: 'billable', label: 'Billable', value: s.billable, display: hrs(s.billable), color: CATEGORICAL[0] },
            { key: 'non', label: 'Non-billable', value: result.nonBillable, display: hrs(result.nonBillable), color: MUTED_FILL },
          ]}
        />
      ) : null}
    </div>
  );
}
