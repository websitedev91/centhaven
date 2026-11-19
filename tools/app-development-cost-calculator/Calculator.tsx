'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { CalculatorGrid, InputsPanel } from '@/components/CalculatorGrid';
import { CurrencySelect } from '@/components/CurrencySelect';
import { InputCurrency } from '@/components/InputCurrency';
import { InputNumber } from '@/components/InputNumber';
import { ResetIcon } from '@/components/icons';
import { LeadBox } from '@/components/LeadBox';
import { Num } from '@/components/Num';
import { ResultCard } from '@/components/ResultCard';
import { Slider } from '@/components/Slider';
import { SplitBar } from '@/components/SplitBar';
import { track } from '@/lib/analytics';
import { CATEGORICAL } from '@/lib/chart-palette';
import { formatMoney, formatNumber, type CurrencyCode } from '@/lib/format';
import { useUrlState } from '@/lib/url-state';
import { APP_FEATURES, PLATFORMS, SHARED_FEATURES, appCost, type AppFeature, type Platform, type SharedFeature } from './calc';
import { HOURLY_RATE_TOOL, LEAD_MAILTO, QUOTE_TOOL } from './links';
import {
  appCostDefaults,
  appCostErrors,
  appCostSchema,
  appCostVariant,
  hoursKey,
  platformCount,
  switchAppCostCurrency,
  toCalcInput,
  type AppCostState,
} from './schema';

const SLUG = 'app-development-cost-calculator';
const FIX_FIELDS = 'Check the highlighted fields to see your estimate.';

const PLATFORM_LABEL: Record<Platform, string> = { ios: 'iOS', android: 'Android', web: 'Web app' };

const FEATURE_LABEL: Record<AppFeature | SharedFeature, string> = {
  login: 'User accounts and login',
  pay: 'Payments / in-app purchases',
  push: 'Push notifications',
  chat: 'Chat / messaging',
  device: 'Maps, camera or other device features',
  offline: 'Works offline',
  api: 'Backend, API and database',
  admin: 'Admin dashboard',
  qa: 'Testing and QA',
};

const hrs = (n: number) => `${formatNumber(n, Number.isInteger(n) ? 0 : 2)} h`;

export default function AppDevelopmentCostCalculator() {
  const { state: s, setField, setAll, reset } = useUrlState(appCostSchema, appCostDefaults, { variant: appCostVariant });
  const tracked = useRef(false);

  function update<K extends keyof AppCostState>(key: K, value: AppCostState[K]) {
    setField(key, value);
    if (!tracked.current) {
      tracked.current = true;
      track('calculate', { tool: SLUG });
    }
  }

  const c = s.currency;
  const money = (n: number) => formatMoney(n, c);
  const errors = appCostErrors(s);
  const r = Object.keys(errors).length === 0 ? appCost(toCalcInput(s)) : null;
  const platforms = platformCount(s);
  const platformNames = PLATFORMS.filter((p) => s[p] === 1).map((p) => PLATFORM_LABEL[p]);

  function checkbox(key: keyof AppCostState, label: string) {
    return (
      <label key={key} className="inline-flex cursor-pointer items-center gap-3 self-start text-[15px] font-[550] text-ink">
        <input type="checkbox" checked={s[key] === 1} onChange={(e) => update(key, e.target.checked ? 1 : 0)} className="h-5 w-5 accent-haven" />
        {label}
      </label>
    );
  }

  function feature(f: AppFeature | SharedFeature) {
    const hk = hoursKey(f);
    return (
      <div key={f} className="flex flex-col gap-3">
        {checkbox(f, FEATURE_LABEL[f])}
        {s[f] === 1 ? (
          <InputNumber label={`${FEATURE_LABEL[f]} hours`} value={s[hk]} onChange={(v) => update(hk, v)} suffix="hours" error={errors[hk]} />
        ) : null}
      </div>
    );
  }

  const label = 'Project price';
  const tableRows = r
    ? [
        { label: 'Setup, discovery and launch', h: r.setupHours },
        { label: `Screens (${s.screens} × ${hrs(s.hps)})`, h: r.screenHours },
        ...APP_FEATURES.filter((f) => s[f] === 1).map((f) => ({ label: FEATURE_LABEL[f], h: s[hoursKey(f)] })),
        ...(r.extraPlatformHours > 0
          ? [{ label: `Extra platforms (${platforms - 1} × ${s.extra}% of app-side work)`, h: r.extraPlatformHours }]
          : []),
        ...SHARED_FEATURES.filter((f) => s[f] === 1).map((f) => ({ label: FEATURE_LABEL[f], h: s[hoursKey(f)] })),
        ...(r.bufferHours > 0 ? [{ label: `Buffer (${s.buffer}%)`, h: r.bufferHours }] : []),
      ]
    : [];

  return (
    <div className="flex flex-col gap-6">
      <CalculatorGrid
        inputs={
          <InputsPanel
            label="Your app project"
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
                <CurrencySelect value={c} onChange={(next: CurrencyCode) => setAll(switchAppCostCurrency(s, next))} />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <InputCurrency label="Your hourly rate" currency={c} value={s.rate} onChange={(v) => update('rate', v)} error={errors.rate} />
                <p className="no-print type-small text-ink-muted">
                  Not sure? <Link href={HOURLY_RATE_TOOL.path}>Work it out with the freelance hourly rate calculator</Link>.
                </p>
              </div>
              <fieldset className="flex flex-col gap-3 sm:col-span-2">
                <legend className="type-small float-left mb-1 w-full font-[550] text-ink">Platforms</legend>
                <div className="flex flex-wrap gap-x-6 gap-y-3">{PLATFORMS.map((p) => checkbox(p, PLATFORM_LABEL[p]))}</div>
                {errors.platforms ? (
                  <p className="type-small font-[550] text-danger" role="alert">
                    {errors.platforms}
                  </p>
                ) : null}
              </fieldset>
              {platforms >= 2 ? (
                <div className="sm:col-span-2">
                  <InputNumber
                    label="Extra work for each added platform"
                    help="Share of the app-side hours needed again for each platform after the first. Example value."
                    value={s.extra}
                    onChange={(v) => update('extra', v)}
                    suffix="%"
                    error={errors.extra}
                  />
                </div>
              ) : null}
              <InputNumber label="Number of screens" value={s.screens} onChange={(v) => update('screens', v)} suffix="screens" error={errors.screens} />
              <InputNumber
                label="Design and build hours per screen"
                value={s.hps}
                onChange={(v) => update('hps', v)}
                suffix="hours"
                error={errors.hps}
              />
              <div className="sm:col-span-2">
                <InputNumber
                  label="Setup, discovery and launch"
                  help="Calls, planning, project setup, app store submission and going live."
                  value={s.setup}
                  onChange={(v) => update('setup', v)}
                  suffix="hours"
                  error={errors.setup}
                />
              </div>
              <fieldset className="flex flex-col gap-5 border-t border-line pt-6 sm:col-span-2">
                <legend className="type-small float-left mb-1 w-full font-[550] text-ink">App features (built for each platform)</legend>
                <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">{APP_FEATURES.map(feature)}</div>
              </fieldset>
              <fieldset className="flex flex-col gap-5 border-t border-line pt-6 sm:col-span-2">
                <legend className="type-small float-left mb-1 w-full font-[550] text-ink">Shared features (built once)</legend>
                <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">{SHARED_FEATURES.map(feature)}</div>
                <p className="type-small text-ink-muted">Example values — change them to match how you work.</p>
              </fieldset>
              <div className="border-t border-line pt-6 sm:col-span-2">
                <Slider
                  label="Buffer for changes and project management"
                  help="Covers feedback rounds, store review fixes and the small things nobody plans for."
                  value={s.buffer}
                  onChange={(v) => update('buffer', v)}
                  min={0}
                  max={50}
                  format={(v) => `${v}%`}
                  unit="%"
                  error={errors.buffer}
                />
              </div>
              <div className="sm:col-span-2">
                <InputNumber
                  optional
                  label="Maintenance hours per month"
                  help="Optional. Updates for new phone versions, fixes and small changes after launch. 0 = none."
                  value={s.maint}
                  onChange={(v) => update('maint', v)}
                  suffix="hours"
                  error={errors.maint}
                />
              </div>
            </div>
          </InputsPanel>
        }
        result={
          r ? (
            <ResultCard
              label={label}
              value={money(r.price)}
              unit={`${c} · ${hrs(r.totalHours)} incl. buffer`}
              rows={[
                ...(r.basePrice < r.price ? [{ label: 'Without the buffer', note: 'Low end of your quote range', value: money(r.basePrice) }] : []),
                { label: 'Total hours', value: hrs(r.totalHours) },
                { label: 'Platforms', value: platformNames.join(' + ') },
                { label: 'Your hourly rate', value: money(s.rate) },
                ...(r.maintenanceMonthly > 0
                  ? [
                      { label: 'Maintenance', note: `${hrs(s.maint)} a month`, value: `${money(r.maintenanceMonthly)} / month` },
                      { label: 'Maintenance per year', value: money(r.maintenanceYearly) },
                    ]
                  : []),
              ]}
              footnote={
                <>
                  <p>Hours × your own rate. The hours are examples you can change, not market prices.</p>
                  <p className="no-print mt-2">
                    <Link href={QUOTE_TOOL.path}>Turn this into a quote</Link> with the freelance quote generator.
                  </p>
                </>
              }
            />
          ) : (
            <ResultCard label={label} value="" unit="" rows={[]} error={FIX_FIELDS} />
          )
        }
      />

      {r ? <LeadBox heading="Want this app built?" mailto={LEAD_MAILTO} tool={SLUG} /> : null}

      {r ? (
        <>
          <section aria-labelledby="cost-breakdown-heading" className="print-break-avoid min-w-0 rounded-panel border border-line bg-surface p-5 sm:p-8">
            <h2 id="cost-breakdown-heading" className="type-h3 text-ink">
              Cost breakdown
            </h2>
            <p className="type-small mt-1 text-ink-muted">Hours and price for each part of the project.</p>
            <div className="mt-6 overflow-x-auto">
              <table className="type-small w-full">
                <thead>
                  <tr className="border-b border-line text-left text-ink-muted">
                    <th scope="col" className="py-2 pr-3 font-[550]">
                      Section
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-[550]">
                      Hours
                    </th>
                    <th scope="col" className="py-2 text-right font-[550]">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row) => (
                    <tr key={row.label} className="border-b border-line">
                      <th scope="row" className="py-3 pr-3 text-left font-normal normal-nums text-ink-muted">
                        {row.label}
                      </th>
                      <td className="py-3 pr-3 text-right tabular-nums">
                        <Num>{hrs(row.h)}</Num>
                      </td>
                      <td className="py-3 text-right tabular-nums">
                        <Num>{money(row.h * s.rate)}</Num>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <th scope="row" className="py-3 pr-3 text-left font-[550] normal-nums text-ink">
                      Total
                    </th>
                    <td className="py-3 pr-3 text-right font-[550] tabular-nums">
                      <Num>{hrs(r.totalHours)}</Num>
                    </td>
                    <td className="py-3 text-right font-[550] tabular-nums">
                      <Num>{money(r.price)}</Num>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {r.totalHours > 0 ? (
            <SplitBar
              title="Where the hours go"
              description={`${hrs(r.totalHours)} in total, including the buffer.`}
              parts={[
                { key: 'shared', label: 'Setup and shared features', value: r.sharedHours, display: hrs(r.sharedHours), color: CATEGORICAL[0] },
                { key: 'screens', label: 'Screens', value: r.screenHours, display: hrs(r.screenHours), color: CATEGORICAL[1] },
                { key: 'app', label: 'App features', value: r.appFeatureHours, display: hrs(r.appFeatureHours), color: CATEGORICAL[2] },
                { key: 'extra', label: 'Extra platforms', value: r.extraPlatformHours, display: hrs(r.extraPlatformHours), color: CATEGORICAL[3] },
                { key: 'buffer', label: 'Buffer', value: r.bufferHours, display: hrs(r.bufferHours), color: CATEGORICAL[4] },
              ]}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}
