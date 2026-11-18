'use client';

import { useRef, useState, type ReactNode } from 'react';
import { primaryButtonClass } from '../actionButtonClass';
import { Num } from '../Num';
import { SegmentedControl } from '../SegmentedControl';

type Tab = 'edit' | 'preview';

/**
 * Editor layout for the quote and invoice generators.
 * - Desktop (lg+): form on the left, live document preview on the right. The preview column is
 *   sticky and scrolls on its own, so the document stays in view while the form is filled in.
 * - Phones and tablets: "Edit" / "Preview" tabs, plus a bottom bar with the total and a
 *   Preview button while editing.
 * The preview stays in the DOM on every screen size (only hidden with CSS), so Download PDF
 * always prints the document (globals.css forces the sheet's ancestors visible when printing).
 */
export function DocWorkspace(props: {
  kind: 'quote' | 'invoice';
  /** Pre-formatted total for the summary and the mobile bar, e.g. "$2,476.65". */
  total: string;
  totalLabel: string;
  /** Second line under the total, e.g. "USD · valid until 18 December 2026". */
  detail: string;
  error?: string;
  form: ReactNode;
  toolbar: ReactNode;
  preview: ReactNode;
}) {
  const { kind, total, totalLabel, detail, error, form, toolbar, preview } = props;
  const [tab, setTab] = useState<Tab>('edit');
  const top = useRef<HTMLDivElement>(null);
  const show = (next: Tab) => {
    setTab(next);
    top.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  };

  return (
    <div ref={top} className="scroll-mt-24">
      <div className="no-print mb-5 lg:hidden">
        <SegmentedControl<Tab>
          label={`Edit or preview your ${kind}`}
          value={tab}
          onChange={show}
          options={[
            { value: 'edit', label: 'Edit' },
            { value: 'preview', label: 'Preview' },
          ]}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-12 lg:items-start lg:gap-8">
        <div className={`min-w-0 lg:col-span-6 xl:col-span-5 ${tab === 'edit' ? '' : 'hidden lg:block'}`}>{form}</div>

        <div
          className={`min-w-0 lg:sticky lg:top-[92px] lg:col-span-6 xl:col-span-7 lg:max-h-[calc(100vh-108px)] lg:overflow-y-auto lg:pr-1 ${
            tab === 'preview' ? '' : 'hidden lg:block'
          }`}
        >
          <div className="flex flex-col gap-4">
            <div className="no-print overflow-hidden rounded-panel border border-line bg-surface">
              <section aria-live="polite" aria-label={totalLabel} className="bg-mint px-5 py-3">
                {error ? (
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="type-small font-[550] text-ink">{totalLabel}</p>
                      <p role="alert" className="text-[13px] font-[550] leading-5 text-danger">
                        {error}
                      </p>
                    </div>
                    <p className="shrink-0 text-[26px] font-[700] leading-8 text-ink-muted">—</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="type-small font-[550] text-ink">{totalLabel}</p>
                      <p className="text-[13px] leading-5 text-ink-muted">{detail}</p>
                    </div>
                    <p className="shrink-0 text-[26px] font-[700] leading-8 tabular-nums text-ink">
                      <Num>{total}</Num>
                    </p>
                  </div>
                )}
              </section>
              <div className="px-5 py-4">{toolbar}</div>
            </div>
            {preview}
          </div>
        </div>
      </div>

      {tab === 'edit' ? (
        <div className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="type-small text-ink-muted">{totalLabel}</p>
              <p className="text-[20px] font-[700] leading-6 tabular-nums text-ink">{error ? '—' : <Num>{total}</Num>}</p>
            </div>
            <button type="button" className={primaryButtonClass} onClick={() => show('preview')}>
              Preview {kind}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
