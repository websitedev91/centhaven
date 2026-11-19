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
import { formatMoney, type CurrencyCode } from '@/lib/format';
import { useUrlState } from '@/lib/url-state';
import { formatRatioPercent, formatX, roas, type RoasMode } from './calc';
import { roasDefaults, roasErrors, roasSchema, roasVariant, switchRoasCurrency, toCalcInput, type RoasState } from './schema';

const SLUG = 'roas-calculator';
const FIX_FIELDS = 'Check the highlighted fields to see your result.';

const MODE_OPTIONS: readonly { value: RoasMode; label: string }[] = [
  { value: 'find', label: 'Find my ROAS' },
  { value: 'needed', label: 'Revenue needed' },
];

export default function RoasCalculator() {
  const { state: s, setField, setAll, reset } = useUrlState(roasSchema, roasDefaults, { variant: roasVariant });
  const tracked = useRef(false);

  function update<K extends keyof RoasState>(key: K, value: RoasState[K]) {
    setField(key, value);
    if (!tracked.current) {
      tracked.current = true;
      track('calculate', { tool: SLUG });
    }
  }

  const c = s.currency;
  const money = (n: number) => formatMoney(n, c);
  const errors = roasErrors(s);
  const r = Object.keys(errors).length > 0 ? null : roas(toCalcInput(s));
  const find = s.mode === 'find';
  const label = find ? 'Return on ad spend' : 'Revenue needed';

  const breakEvenRow =
    r && r.breakEven !== null
      ? [{ label: 'Break-even ROAS', note: `At a ${s.margin}% margin`, value: `${formatX(r.breakEven)} (${formatRatioPercent(r.breakEven)})` }]
      : [];

  const status =
    r && r.status !== null
      ? find
        ? r.status === 'above'
          ? { text: 'Above break-even: the ads are profitable.', tone: 'positive' as const }
          : r.status === 'below'
            ? { text: 'Below break-even: the ads cost more than the profit they bring in.', tone: 'negative' as const }
            : { text: 'Exactly break-even: the ads pay for themselves, with nothing left over.', tone: undefined }
        : r.status === 'below'
          ? { text: `This target is below your break-even ROAS of ${formatX(r.breakEven!)}, so it would lose money.`, tone: 'negative' as const }
          : { text: `This target is at or above your break-even ROAS of ${formatX(r.breakEven!)}.`, tone: undefined }
      : null;

  return (
    <div className="flex flex-col gap-6">
      <CalculatorGrid
        inputs={
          <InputsPanel
            label="Your ad numbers"
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
                <SegmentedControl<RoasMode> label="What do you want to know?" value={s.mode} options={MODE_OPTIONS} onChange={(v) => update('mode', v)} />
              </div>
              <CurrencySelect value={c} onChange={(next: CurrencyCode) => setAll(switchRoasCurrency(s, next))} />
              {find ? (
                <InputCurrency
                  label="Revenue from ads"
                  help="Sales that came from the ads in the period. Example values — use your own numbers."
                  currency={c}
                  value={s.rev}
                  onChange={(v) => update('rev', v)}
                  error={errors.rev}
                />
              ) : null}
              <InputCurrency
                label="Ad spend"
                help={find ? 'What you spent on the ads in the same period.' : 'What you plan to spend on the ads.'}
                currency={c}
                value={s.spend}
                onChange={(v) => update('spend', v)}
                error={errors.spend}
              />
              {!find ? (
                <InputNumber
                  label="Target ROAS"
                  help="4 means 4 in revenue for every 1 spent (400%)."
                  value={s.target}
                  onChange={(v) => update('target', v)}
                  suffix="x"
                  error={errors.target}
                />
              ) : null}
              <div className="sm:col-span-2">
                <InputNumber
                  optional
                  label="Profit margin before ad spend (optional)"
                  help="What is left of each sale after product and delivery costs, before ads. 0 = off."
                  value={s.margin}
                  onChange={(v) => update('margin', v)}
                  suffix="%"
                  error={errors.margin}
                />
              </div>
            </div>
          </InputsPanel>
        }
        result={
          r ? (
            find ? (
              <ResultCard
                label={label}
                value={formatX(r.roas!)}
                unit={`${formatRatioPercent(r.roas!)} return on ad spend`}
                tone={status?.tone}
                rows={[
                  { label: 'Revenue for every 1 spent', value: money(r.roas!) },
                  ...breakEvenRow,
                  ...(r.profitAfterAds !== null
                    ? [{ label: 'Profit after ad spend', note: 'Revenue × margin − ad spend', value: money(r.profitAfterAds) }]
                    : []),
                ]}
                footnote={status ? <p className="font-[550]">{status.text}</p> : undefined}
              />
            ) : (
              <ResultCard
                label={label}
                value={money(r.revenueNeeded!)}
                unit={`for ${formatX(s.target)} on ${money(s.spend)} of ads · ${c}`}
                tone={status?.tone}
                rows={[{ label: 'Target ROAS', value: `${formatX(s.target)} (${formatRatioPercent(s.target)})` }, ...breakEvenRow]}
                footnote={status ? <p className="font-[550]">{status.text}</p> : undefined}
              />
            )
          ) : (
            <ResultCard label={label} value="" unit="" rows={[]} error={FIX_FIELDS} />
          )
        }
      />
    </div>
  );
}
