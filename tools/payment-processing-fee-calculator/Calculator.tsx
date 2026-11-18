'use client';

import { useRef } from 'react';
import { CalculatorGrid, InputsPanel } from '@/components/CalculatorGrid';
import { CurrencySelect } from '@/components/CurrencySelect';
import { InputCurrency } from '@/components/InputCurrency';
import { InputNumber } from '@/components/InputNumber';
import { ResetIcon } from '@/components/icons';
import { ResultCard } from '@/components/ResultCard';
import { ScenarioCompare } from '@/components/ScenarioCompare';
import { SegmentedControl } from '@/components/SegmentedControl';
import { SplitBar } from '@/components/SplitBar';
import { track } from '@/lib/analytics';
import { CATEGORICAL, MUTED_FILL } from '@/lib/chart-palette';
import { formatMoney, formatNumber, formatPercent, type CurrencyCode } from '@/lib/format';
import { useUrlState } from '@/lib/url-state';
import { processingFee, type ProcessingError, type ProcessingMode, type ProcessingResult } from './calc';
import {
  fieldErrors,
  planBDefaults,
  planBSchema,
  processingDefaults,
  processingSchema,
  processingVariant,
  switchProcessingCurrency,
  toCalcInput,
  type ProcessingState,
} from './schema';

const SLUG = 'payment-processing-fee-calculator';
const FIX_FIELDS = 'Check the highlighted fields to see your result.';

export default function PaymentProcessingFeeCalculator() {
  const { state: s, setField, setAll, reset } = useUrlState(processingSchema, processingDefaults, {
    variant: processingVariant,
  });
  const { state: b, setField: setB } = useUrlState(planBSchema, planBDefaults, { prefix: 'b_' });
  const tracked = useRef(false);

  function update<K extends keyof ProcessingState>(key: K, value: ProcessingState[K]) {
    setField(key, value);
    if (!tracked.current) {
      tracked.current = true;
      track('calculate', { tool: SLUG });
    }
  }

  const c = s.currency;
  const money = (n: number) => formatMoney(n, c);
  const signedMoney = (n: number) => (n < 0 ? `−${money(-n)}` : money(n));
  const customerPays = s.mode === 'gross';
  const feeLabel = `${s.percent}%${s.extra > 0 ? ` + ${s.extra}%` : ''} + ${money(s.fixed)}`;

  const errors = fieldErrors(processingSchema, s);
  const result: ProcessingResult | ProcessingError =
    Object.keys(errors).length > 0 ? { ok: false, error: FIX_FIELDS } : processingFee(toCalcInput(s));

  const bErrors = fieldErrors(planBSchema, b);
  const resultB: ProcessingResult | ProcessingError =
    result.ok && Object.keys(bErrors).length === 0 ? processingFee(toCalcInput({ ...s, ...b })) : { ok: false, error: FIX_FIELDS };

  const label = customerPays ? 'You receive' : 'Price to charge';

  return (
    <div className="flex flex-col gap-6">
      <CalculatorGrid
        inputs={
          <InputsPanel
            label="Your payment"
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
                <SegmentedControl<ProcessingMode>
                  label="I know"
                  value={s.mode}
                  onChange={(v) => update('mode', v)}
                  options={[
                    { value: 'gross', label: 'Customer pays' },
                    { value: 'net', label: 'I want to receive' },
                  ]}
                />
              </div>
              <CurrencySelect value={c} onChange={(next: CurrencyCode) => setAll(switchProcessingCurrency(s, next))} />
              <InputCurrency
                label={customerPays ? 'Payment amount' : 'Amount you want to receive'}
                currency={c}
                value={s.amount}
                onChange={(v) => update('amount', v)}
                error={errors.amount}
              />
              <InputNumber
                label="Percentage fee"
                help="Example only. Use the % from your provider's pricing."
                value={s.percent}
                onChange={(v) => update('percent', v)}
                min={0}
                max={50}
                step={0.01}
                suffix="%"
                error={errors.percent}
              />
              <InputCurrency optional
                label="Fixed fee per payment"
                help="Example only. Enter 0 if there's no fixed fee."
                currency={c}
                value={s.fixed}
                onChange={(v) => update('fixed', v)}
                error={errors.fixed}
              />
              <div className="sm:col-span-2">
                <InputNumber optional
                  label="Extra % (optional)"
                  help="For example an international-card or currency-conversion surcharge, if your provider charges one."
                  value={s.extra}
                  onChange={(v) => update('extra', v)}
                  min={0}
                  max={50}
                  step={0.01}
                  suffix="%"
                  error={errors.extra}
                />
              </div>
            </div>
          </InputsPanel>
        }
        result={
          result.ok ? (
            <ResultCard
              label={label}
              value={customerPays ? signedMoney(result.receive) : money(result.price)}
              unit={`${c} · fee ${feeLabel}`}
              tone={result.feeExceedsPayment ? 'negative' : undefined}
              rows={[
                { label: 'Customer pays', value: money(result.price) },
                { label: 'Percentage part', note: `${formatNumber(s.percent + s.extra, 2)}% of the payment`, value: money(result.percentPart) },
                { label: 'Fixed part', value: money(result.fixedPart) },
                { label: 'Total fee', value: money(result.totalFee) },
                { label: 'You receive', value: signedMoney(result.receive) },
                { label: 'Effective rate', note: 'Total fee ÷ what the customer pays', value: formatPercent(result.effectiveRate, 2) },
              ]}
              footnote={
                result.feeExceedsPayment ? (
                  <p className="font-[550] text-danger">The fee is more than the payment.</p>
                ) : !customerPays ? (
                  <p>Amounts are rounded to the cent, so you may receive a cent less. Round your price up by a cent if you need the exact amount.</p>
                ) : undefined
              }
            />
          ) : (
            <ResultCard label={label} value="" unit="" rows={[]} error={result.error} />
          )
        }
      />

      {result.ok && result.price > 0 && !result.feeExceedsPayment ? (
        <SplitBar
          title="Where the payment goes"
          description={`${money(result.price)} payment at ${feeLabel}.`}
          total={result.price}
          parts={[
            { key: 'receive', label: 'You receive', value: result.receive, display: money(result.receive), color: CATEGORICAL[0] },
            { key: 'fee', label: 'Fees', value: result.totalFee, display: money(result.totalFee), color: MUTED_FILL },
          ]}
        />
      ) : null}

      <ScenarioCompare
        title="Compare two providers"
        aName="Provider A (your inputs)"
        bName="Provider B"
        toolSlug={SLUG}
        error={!result.ok || !resultB.ok ? (result.ok && !resultB.ok ? resultB.error : FIX_FIELDS) : undefined}
        planA={
          <dl className="type-small grid grid-cols-2 gap-y-2">
            <dt className="text-ink-muted">Percentage fee</dt>
            <dd className="text-right font-[550] tabular-nums">{s.percent}%</dd>
            <dt className="text-ink-muted">Fixed fee</dt>
            <dd className="text-right font-[550] tabular-nums">{money(s.fixed)}</dd>
            <dt className="text-ink-muted">Extra %</dt>
            <dd className="text-right font-[550] tabular-nums">{s.extra}%</dd>
            <dd className="col-span-2 mt-2 text-ink-muted">Change these in the calculator above.</dd>
          </dl>
        }
        planB={
          <>
            <InputNumber
              label="Percentage fee"
              value={b.percent}
              onChange={(v) => setB('percent', v)}
              min={0}
              max={50}
              step={0.01}
              suffix="%"
              error={bErrors.percent}
            />
            <InputCurrency label="Fixed fee per payment" currency={c} value={b.fixed} onChange={(v) => setB('fixed', v)} error={bErrors.fixed} />
            <InputNumber
              label="Extra %"
              value={b.extra}
              onChange={(v) => setB('extra', v)}
              min={0}
              max={50}
              step={0.01}
              suffix="%"
              error={bErrors.extra}
            />
          </>
        }
        rows={
          result.ok && resultB.ok
            ? [
                { label: 'Customer pays', a: money(result.price), b: money(resultB.price) },
                {
                  label: 'Total fee',
                  a: money(result.totalFee),
                  b: money(resultB.totalFee),
                  better: result.totalFee < resultB.totalFee ? 'a' : resultB.totalFee < result.totalFee ? 'b' : undefined,
                },
                { label: 'You receive', a: signedMoney(result.receive), b: signedMoney(resultB.receive) },
                { label: 'Effective rate', a: formatPercent(result.effectiveRate, 2), b: formatPercent(resultB.effectiveRate, 2) },
              ]
            : []
        }
      />
    </div>
  );
}
