'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { CalculatorGrid, InputsPanel } from '@/components/CalculatorGrid';
import { CurrencySelect } from '@/components/CurrencySelect';
import { InputCurrency } from '@/components/InputCurrency';
import { InputNumber } from '@/components/InputNumber';
import { ResetIcon } from '@/components/icons';
import { Num } from '@/components/Num';
import { ResultCard } from '@/components/ResultCard';
import { SegmentedControl } from '@/components/SegmentedControl';
import { Slider } from '@/components/Slider';
import { SplitBar } from '@/components/SplitBar';
import { track } from '@/lib/analytics';
import { CATEGORICAL } from '@/lib/chart-palette';
import { formatMoney, formatNumber, type CurrencyCode } from '@/lib/format';
import { useUrlState } from '@/lib/url-state';
import { FEATURES, websiteCost, type DesignLevel, type Feature } from './calc';
import { HOURLY_RATE_TOOL } from './links';
import {
  fieldErrors,
  hoursKey,
  switchWebsiteCostCurrency,
  toCalcInput,
  websiteCostDefaults,
  websiteCostSchema,
  websiteCostVariant,
  type WebsiteCostState,
} from './schema';

const SLUG = 'website-design-cost-calculator';
const FIX_FIELDS = 'Check the highlighted fields to see your estimate.';

const FEATURE_LABEL: Record<Feature, string> = {
  contact: 'Contact form',
  blog: 'Blog',
  shop: 'Online shop (e-commerce)',
  booking: 'Booking / appointments',
  lang: 'Multiple languages',
  seo: 'SEO setup',
};

const LEVELS: readonly { value: DesignLevel; label: string }[] = [
  { value: 'template', label: 'Template' },
  { value: 'custom', label: 'Custom' },
  { value: 'premium', label: 'Premium' },
];

const hrs = (n: number) => `${formatNumber(n, Number.isInteger(n) ? 0 : 2)} h`;

export default function WebsiteDesignCostCalculator() {
  const { state: s, setField, setAll, reset } = useUrlState(websiteCostSchema, websiteCostDefaults, { variant: websiteCostVariant });
  const tracked = useRef(false);

  function update<K extends keyof WebsiteCostState>(key: K, value: WebsiteCostState[K]) {
    setField(key, value);
    if (!tracked.current) {
      tracked.current = true;
      track('calculate', { tool: SLUG });
    }
  }

  const c = s.currency;
  const money = (n: number) => formatMoney(n, c);
  const errors = fieldErrors(websiteCostSchema, s);
  const valid = Object.keys(errors).length === 0;
  const r = valid ? websiteCost(toCalcInput(s)) : null;

  function toggle(key: Feature | 'copy', label: string, hoursField: keyof WebsiteCostState & `${string}H`, suffix: string) {
    const on = s[key] === 1;
    return (
      <div key={key} className="flex flex-col gap-3">
        <label className="inline-flex cursor-pointer items-center gap-3 self-start text-[15px] font-[550] text-ink">
          <input
            type="checkbox"
            checked={on}
            onChange={(e) => update(key, e.target.checked ? 1 : 0)}
            className="h-5 w-5 accent-haven"
          />
          {label}
        </label>
        {on ? (
          <InputNumber
            label={`${label} hours`}
            value={s[hoursField] as number}
            onChange={(v) => update(hoursField, v)}
            suffix={suffix}
            error={errors[hoursField]}
          />
        ) : null}
      </div>
    );
  }

  const label = 'Project price';

  return (
    <div className="flex flex-col gap-6">
      <CalculatorGrid
        inputs={
          <InputsPanel
            label="Your website project"
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
                <CurrencySelect value={c} onChange={(next: CurrencyCode) => setAll(switchWebsiteCostCurrency(s, next))} />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <InputCurrency label="Your hourly rate" currency={c} value={s.rate} onChange={(v) => update('rate', v)} error={errors.rate} />
                <p className="no-print type-small text-ink-muted">
                  Not sure? <Link href={HOURLY_RATE_TOOL.path}>Work it out with the freelance hourly rate calculator</Link>.
                </p>
              </div>
              <InputNumber label="Number of pages" value={s.pages} onChange={(v) => update('pages', v)} suffix="pages" error={errors.pages} />
              <InputNumber
                label="Design and build hours per page"
                value={s.hpp}
                onChange={(v) => update('hpp', v)}
                suffix="hours"
                error={errors.hpp}
              />
              <div className="flex flex-col gap-2 sm:col-span-2">
                <SegmentedControl<DesignLevel> label="Design level" value={s.level} options={LEVELS} onChange={(v) => update('level', v)} />
                <p className="type-small text-ink-muted">Template = half the page hours · Custom = as entered · Premium = 1.5 × the page hours.</p>
              </div>
              <div className="sm:col-span-2">
                <InputNumber
                  label="Setup, discovery and launch"
                  help="Calls, planning, hosting and domain setup, testing and going live."
                  value={s.setup}
                  onChange={(v) => update('setup', v)}
                  suffix="hours"
                  error={errors.setup}
                />
              </div>
              <fieldset className="flex flex-col gap-5 border-t border-line pt-6 sm:col-span-2">
                <legend className="type-small float-left mb-1 w-full font-[550] text-ink">Features</legend>
                <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                  {FEATURES.map((f) => toggle(f, FEATURE_LABEL[f], hoursKey(f), 'hours'))}
                  {toggle('copy', 'Copywriting', 'copyH', 'hours per page')}
                </div>
                <p className="type-small text-ink-muted">Example values — change them to match how you work.</p>
              </fieldset>
              <div className="border-t border-line pt-6 sm:col-span-2">
                <Slider
                  label="Buffer for changes and project management"
                  help="Covers feedback rounds, emails and the small things nobody plans for."
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
                  label="Maintenance hours per month"
                  help="Optional. Updates, backups and small edits after launch. 0 = none."
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
                ...(r.basePrice < r.price
                  ? [{ label: 'Without the buffer', note: 'Low end of your quote range', value: money(r.basePrice) }]
                  : []),
                { label: 'Total hours', value: hrs(r.totalHours) },
                { label: 'Your hourly rate', value: money(s.rate) },
                ...(r.maintenanceMonthly > 0
                  ? [
                      { label: 'Maintenance', note: `${hrs(s.maint)} a month`, value: `${money(r.maintenanceMonthly)} / month` },
                      { label: 'Maintenance per year', value: money(r.maintenanceYearly) },
                    ]
                  : []),
              ]}
              footnote="Hours × your own rate. The hours are examples you can change, not market prices."
            />
          ) : (
            <ResultCard label={label} value="" unit="" rows={[]} error={FIX_FIELDS} />
          )
        }
      />

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
                  {[
                    { label: 'Setup, discovery and launch', h: r.setupHours },
                    { label: `Design and build (${s.pages} ${s.pages === 1 ? 'page' : 'pages'}, ${s.level})`, h: r.designHours },
                    ...(r.copyHours > 0 ? [{ label: 'Copywriting', h: r.copyHours }] : []),
                    ...FEATURES.filter((f) => s[f] === 1).map((f) => ({ label: FEATURE_LABEL[f], h: s[hoursKey(f)] })),
                    ...(r.bufferHours > 0 ? [{ label: `Buffer (${s.buffer}%)`, h: r.bufferHours }] : []),
                  ].map((row) => (
                    <tr key={row.label} className="border-b border-line">
                      <th scope="row" className="py-3 pr-3 text-left font-normal normal-nums text-ink-muted">
                        {row.label}
                      </th>
                      <td className="py-3 pr-3 text-right tabular-nums"><Num>{hrs(row.h)}</Num></td>
                      <td className="py-3 text-right tabular-nums"><Num>{money(row.h * s.rate)}</Num></td>
                    </tr>
                  ))}
                  <tr>
                    <th scope="row" className="py-3 pr-3 text-left font-[550] normal-nums text-ink">
                      Total
                    </th>
                    <td className="py-3 pr-3 text-right font-[550] tabular-nums"><Num>{hrs(r.totalHours)}</Num></td>
                    <td className="py-3 text-right font-[550] tabular-nums"><Num>{money(r.price)}</Num></td>
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
                { key: 'setup', label: 'Setup and launch', value: r.setupHours, display: hrs(r.setupHours), color: CATEGORICAL[0] },
                { key: 'design', label: 'Design and build', value: r.designHours, display: hrs(r.designHours), color: CATEGORICAL[1] },
                { key: 'copy', label: 'Copywriting', value: r.copyHours, display: hrs(r.copyHours), color: CATEGORICAL[2] },
                { key: 'features', label: 'Features', value: r.featureHours, display: hrs(r.featureHours), color: CATEGORICAL[3] },
                { key: 'buffer', label: 'Buffer', value: r.bufferHours, display: hrs(r.bufferHours), color: CATEGORICAL[4] },
              ]}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}
