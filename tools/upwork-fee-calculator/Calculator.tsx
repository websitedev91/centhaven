'use client';

import { useRef } from 'react';
import { CalculatorGrid, InputsPanel } from '@/components/CalculatorGrid';
import { InputCurrency } from '@/components/InputCurrency';
import { InputNumber } from '@/components/InputNumber';
import { ResetIcon } from '@/components/icons';
import { ResultCard } from '@/components/ResultCard';
import { ScenarioCompare } from '@/components/ScenarioCompare';
import { SegmentedControl } from '@/components/SegmentedControl';
import { SplitBar } from '@/components/SplitBar';
import { track } from '@/lib/analytics';
import { CATEGORICAL, MUTED_FILL } from '@/lib/chart-palette';
import { formatMoney } from '@/lib/format';
import { useUrlState } from '@/lib/url-state';
import { upworkFee, type FeeMode, type PercentFeeError, type PercentFeeResult } from './calc';
import {
  fieldErrors,
  planBDefaults,
  planBSchema,
  FEE_HELP,
  FEE_RANGE,
  toCalcInput,
  upworkFeeDefaults,
  upworkFeeSchema,
  type UpworkFeeState,
} from './schema';

const SLUG = 'upwork-fee-calculator';
const FIX_FIELDS = 'Check the highlighted fields to see your result.';
const USD = 'USD' as const;

export default function UpworkFeeCalculator() {
  const { state: s, setField, reset } = useUrlState(upworkFeeSchema, upworkFeeDefaults);
  const { state: b, setField: setB } = useUrlState(planBSchema, planBDefaults, { prefix: 'b_' });
  const tracked = useRef(false);

  function update<K extends keyof UpworkFeeState>(key: K, value: UpworkFeeState[K]) {
    setField(key, value);
    if (!tracked.current) {
      tracked.current = true;
      track('calculate', { tool: SLUG });
    }
  }

  const money = (n: number) => formatMoney(n, USD);
  const charging = s.mode === 'gross';

  const errors = fieldErrors(upworkFeeSchema, s);
  const result: PercentFeeResult | PercentFeeError =
    Object.keys(errors).length > 0 ? { ok: false, error: FIX_FIELDS } : upworkFee(toCalcInput(s));

  const bErrors = fieldErrors(planBSchema, b);
  const resultB: PercentFeeResult | PercentFeeError =
    result.ok && Object.keys(bErrors).length === 0 ? upworkFee(toCalcInput({ ...s, fee: b.fee })) : { ok: false, error: FIX_FIELDS };

  const label = charging ? 'You take home' : 'Amount to charge';

  return (
    <div className="flex flex-col gap-6">
      <CalculatorGrid
        inputs={
          <InputsPanel
            label="Your contract"
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
              <div className="sm:col-span-2">
                <SegmentedControl<FeeMode>
                  label="I know"
                  value={s.mode}
                  onChange={(v) => update('mode', v)}
                  options={[
                    { value: 'gross', label: "I'm charging" },
                    { value: 'net', label: 'I want to take home' },
                  ]}
                />
              </div>
              <InputCurrency
                label={charging ? 'Contract amount' : 'Amount you want to take home'}
                help="Enter the amount in US dollars."
                currency={USD}
                value={s.amount}
                onChange={(v) => update('amount', v)}
                error={errors.amount}
              />
              <InputNumber
                label="Your service fee % (shown on your proposal/offer)"
                help={FEE_HELP}
                value={s.fee}
                onChange={(v) => update('fee', v)}
                min={FEE_RANGE.min}
                max={FEE_RANGE.max}
                step={0.1}
                suffix="%"
                error={errors.fee}
              />
            </div>
          </InputsPanel>
        }
        result={
          result.ok ? (
            <ResultCard
              label={label}
              value={money(charging ? result.takeHome : result.price)}
              unit={`USD · at a ${s.fee}% fee`}
              rows={[
                { label: 'Contract amount', note: 'What the client pays', value: money(result.price) },
                { label: 'Upwork service fee', note: `${s.fee}% of the contract`, value: money(result.feeAmount) },
                { label: 'You take home', value: money(result.takeHome) },
              ]}
            />
          ) : (
            <ResultCard label={label} value="" unit="" rows={[]} error={result.error} />
          )
        }
      />

      {result.ok && result.price > 0 ? (
        <SplitBar
          title="Where the contract goes"
          description={`${money(result.price)} contract at a ${s.fee}% service fee.`}
          total={result.price}
          parts={[
            { key: 'keep', label: 'You take home', value: result.takeHome, display: money(result.takeHome), color: CATEGORICAL[0] },
            { key: 'fee', label: 'Upwork fee', value: result.feeAmount, display: money(result.feeAmount), color: MUTED_FILL },
          ]}
        />
      ) : null}

      <ScenarioCompare
        title="Compare two fees"
        aName="Fee A (your inputs)"
        bName="Fee B"
        toolSlug={SLUG}
        error={!result.ok || !resultB.ok ? FIX_FIELDS : undefined}
        planA={
          <dl className="type-small grid grid-cols-2 gap-y-2">
            <dt className="text-ink-muted">Service fee</dt>
            <dd className="text-right font-[550] tabular-nums">{s.fee}%</dd>
            <dd className="col-span-2 mt-2 text-ink-muted">Change this in the calculator above.</dd>
          </dl>
        }
        planB={
          <InputNumber
            label="Service fee %"
            value={b.fee}
            onChange={(v) => setB('fee', v)}
            min={FEE_RANGE.min}
            max={FEE_RANGE.max}
            step={0.1}
            suffix="%"
            error={bErrors.fee}
          />
        }
        rows={
          result.ok && resultB.ok
            ? [
                { label: 'Contract amount', a: money(result.price), b: money(resultB.price) },
                {
                  label: 'Upwork service fee',
                  a: money(result.feeAmount),
                  b: money(resultB.feeAmount),
                  better: result.feeAmount < resultB.feeAmount ? 'a' : resultB.feeAmount < result.feeAmount ? 'b' : undefined,
                },
                { label: 'You take home', a: money(result.takeHome), b: money(resultB.takeHome) },
              ]
            : []
        }
      />
    </div>
  );
}
