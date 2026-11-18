'use client';

import { useRef } from 'react';
import { CalculatorGrid, InputsPanel } from '@/components/CalculatorGrid';
import { CurrencySelect } from '@/components/CurrencySelect';
import { InputCurrency } from '@/components/InputCurrency';
import { InputNumber } from '@/components/InputNumber';
import { ResetIcon } from '@/components/icons';
import { ResultCard } from '@/components/ResultCard';
import { SegmentedControl } from '@/components/SegmentedControl';
import { track } from '@/lib/analytics';
import { formatMoney, formatNumber, type CurrencyCode } from '@/lib/format';
import { useUrlState } from '@/lib/url-state';
import { lateFee, type FeeType } from './calc';
import { fieldErrors, lateFeeDefaults, lateFeeSchema, lateFeeVariant, switchLateFeeCurrency, toCalcInput, type LateFeeState } from './schema';

const SLUG = 'late-fee-calculator';
const FIX_FIELDS = 'Check the highlighted fields to see your result.';
const daysText = (n: number) => `${formatNumber(n)} ${n === 1 ? 'day' : 'days'}`;

export default function LateFeeCalculator() {
  const { state: s, setField, setAll, reset } = useUrlState(lateFeeSchema, lateFeeDefaults, { variant: lateFeeVariant });
  const tracked = useRef(false);

  function update<K extends keyof LateFeeState>(key: K, value: LateFeeState[K]) {
    setField(key, value);
    if (!tracked.current) {
      tracked.current = true;
      track('calculate', { tool: SLUG });
    }
  }

  const c = s.currency;
  const money = (n: number) => formatMoney(n, c);
  const errors = fieldErrors(lateFeeSchema, s);
  const r = Object.keys(errors).length > 0 ? null : lateFee(toCalcInput(s));
  const feeDesc = s.type === 'flat' ? `${money(s.flat)} flat fee` : s.type === 'oneoff' ? `${formatNumber(s.pct, 2)}% one-off` : `${formatNumber(s.pct, 2)}% per 30 days`;

  return (
    <div className="flex flex-col gap-6">
      <CalculatorGrid
        inputs={
          <InputsPanel
            label="Your invoice"
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
              <CurrencySelect value={c} onChange={(next: CurrencyCode) => setAll(switchLateFeeCurrency(s, next))} />
              <InputCurrency label="Invoice amount" currency={c} value={s.amount} onChange={(v) => update('amount', v)} error={errors.amount} />
              <InputNumber label="Days late" help="Days after the due date." value={s.days} onChange={(v) => update('days', v)} suffix="days" error={errors.days} />
              <InputNumber
                label="Grace period (optional)"
                help="Days after the due date before a fee applies. 0 = none."
                value={s.grace}
                onChange={(v) => update('grace', v)}
                suffix="days"
                error={errors.grace}
              />
              <div className="sm:col-span-2">
                <SegmentedControl<FeeType>
                  label="Your late fee"
                  value={s.type}
                  onChange={(v) => update('type', v)}
                  options={[
                    { value: 'flat', label: 'Flat fee' },
                    { value: 'oneoff', label: 'One-off %' },
                    { value: 'monthly', label: '% per 30 days' },
                  ]}
                />
              </div>
              <div className="sm:col-span-2">
                {s.type === 'flat' ? (
                  <InputCurrency
                    label="Flat fee"
                    help="Example only. Use the fee in your contract or invoice terms."
                    currency={c}
                    value={s.flat}
                    onChange={(v) => update('flat', v)}
                    error={errors.flat}
                  />
                ) : (
                  <InputNumber
                    label={s.type === 'oneoff' ? 'Fee %' : 'Fee % per 30 days'}
                    help={
                      s.type === 'oneoff'
                        ? 'Example only. Use the fee in your contract or invoice terms.'
                        : 'Example only. Use the fee in your contract or invoice terms. Charged by the day.'
                    }
                    value={s.pct}
                    onChange={(v) => update('pct', v)}
                    min={0}
                    max={100}
                    step={0.1}
                    suffix="%"
                    error={errors.pct}
                  />
                )}
              </div>
            </div>
          </InputsPanel>
        }
        result={
          r ? (
            <ResultCard
              label="Late fee"
              value={money(r.fee)}
              unit={`${c} · ${feeDesc}`}
              rows={[
                { label: 'Invoice amount', value: money(s.amount) },
                {
                  label: 'Days charged',
                  note: s.grace > 0 ? `${daysText(s.days)} late − ${daysText(s.grace)} grace` : undefined,
                  value: daysText(r.chargeableDays),
                },
                ...(r.perDay !== null ? [{ label: 'Fee per day', value: money(r.perDay) }] : []),
                { label: 'New total due', value: money(r.total) },
              ]}
              footnote={
                r.chargeableDays === 0 ? (
                  <p>No late fee yet.</p>
                ) : (
                  <p>Charge only the late fee you agreed with your client in your contract or invoice terms.</p>
                )
              }
            />
          ) : (
            <ResultCard label="Late fee" value="" unit="" rows={[]} error={FIX_FIELDS} />
          )
        }
      />
    </div>
  );
}
