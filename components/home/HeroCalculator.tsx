'use client';

import Link from 'next/link';
import { useId, useState } from 'react';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { InputCurrency } from '@/components/InputCurrency';
import { InputNumber } from '@/components/InputNumber';
import { CURRENCIES, formatMoney, type CurrencyCode } from '@/lib/format';
import { toQuery } from '@/lib/url-state';
import { calcHourlyRate } from '@/tools/hourly-rate-calculator/calc';
import {
  hourlyRateDefaults,
  hourlyRateVariant,
  switchHourlyRateCurrency,
  toCalcInput,
  type HourlyRateState,
} from '@/tools/hourly-rate-calculator/defaults';

/**
 * Homepage hero mini-calculator (DESIGN.md §8): two inputs, everything else uses the hourly
 * rate tool's defaults, maths from tools/hourly-rate-calculator/calc.ts. No Zod here (budget):
 * the two ranges match the tool's schema and are checked inline.
 */
export function HeroCalculator({ toolHref }: { toolHref?: string }) {
  const [s, setS] = useState<HourlyRateState>(hourlyRateDefaults);
  const currencyId = useId();

  const incomeError =
    !Number.isFinite(s.targetIncome) || s.targetIncome < 0
      ? 'Income can’t be negative'
      : s.targetIncome > 100_000_000
        ? 'Maximum is 100,000,000'
        : undefined;
  const hoursError =
    !Number.isFinite(s.hoursPerWeek) || s.hoursPerWeek < 1
      ? 'Minimum is 1 hour'
      : s.hoursPerWeek > 80
        ? 'Maximum is 80 hours'
        : undefined;
  const result = incomeError || hoursError ? null : calcHourlyRate(toCalcInput(s));
  const rate = result && result.ok ? formatMoney(result.hourlyRate, s.currency) : null;

  return (
    <section aria-labelledby="hero-calc-heading" className="rounded-panel border border-line bg-surface">
      <div className="p-5 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <h2 id="hero-calc-heading" className="type-h3 max-w-[16ch] text-ink">
            What should you charge per hour?
          </h2>
          <label htmlFor={currencyId} className="sr-only">
            Currency
          </label>
          <select
            id={currencyId}
            value={s.currency}
            onChange={(e) => setS(switchHourlyRateCurrency(s, e.target.value as CurrencyCode))}
            className="h-9 shrink-0 rounded-field border border-line bg-surface px-2 text-[15px] font-[550] text-ink hover:border-ink-muted/50 focus-visible:border-haven focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-haven"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <InputCurrency
            label="Take-home goal (per year)"
            currency={s.currency}
            value={s.targetIncome}
            onChange={(v) => setS({ ...s, targetIncome: v })}
            error={incomeError}
          />
          <InputNumber
            label="Hours a week"
            value={s.hoursPerWeek}
            onChange={(v) => setS({ ...s, hoursPerWeek: v })}
            suffix="hours"
            error={hoursError}
          />
        </div>
      </div>
      <div aria-live="polite" className="rounded-b-panel border-t border-line bg-mint p-5 sm:px-8 sm:py-7">
        {rate ? (
          <>
            <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <AnimatedNumber value={rate} className="type-result inline-block border-b-[3px] border-brass pb-1.5 text-ink" />
              <span className="type-small text-ink-muted">per hour · {s.currency}</span>
            </p>
            <p className="type-small mt-4 text-ink-muted">
              Assumes {s.taxRate}% tax, typical expenses, {s.weeksOff} weeks off and {s.billablePct}% billable time.
            </p>
          </>
        ) : (
          <p role="alert" className="type-small font-[550] text-danger">
            Check the fields above to see your rate.
          </p>
        )}
        {toolHref ? (
          <Link
            href={`${toolHref}${toQuery(s, hourlyRateDefaults, hourlyRateVariant)}`}
            className="mt-5 inline-flex items-center gap-1.5 text-[15px] font-[550] text-haven no-underline hover:text-haven-deep hover:underline"
          >
            Open full calculator
          </Link>
        ) : null}
      </div>
    </section>
  );
}
