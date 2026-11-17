'use client';

import { useRef } from 'react';
import { CalculatorGrid, InputsPanel } from '@/components/CalculatorGrid';
import { CurrencySelect } from '@/components/CurrencySelect';
import { InputNumber } from '@/components/InputNumber';
import { ResultCard } from '@/components/ResultCard';
import { DocToolbar } from '@/components/doc/DocToolbar';
import { DocumentSheet, type SheetTotal } from '@/components/doc/DocumentSheet';
import { LineItemsEditor } from '@/components/doc/LineItemsEditor';
import { TextArea, TextField } from '@/components/doc/TextField';
import { track } from '@/lib/analytics';
import { addDays, formatIsoDate } from '@/lib/dates';
import { DOC_LIMITS, exampleRate } from '@/lib/doc-schema';
import { formatMoney, type CurrencyCode } from '@/lib/format';
import { useLocalDraft } from '@/lib/use-local-draft';
import { quoteTotals } from './calc';
import {
  QUOTE_DRAFT_KEY,
  QUOTE_NOTE,
  freshQuote,
  newQuote,
  quoteDraftSchema,
  quoteErrors,
  switchQuoteCurrency,
  toQuoteInput,
  type QuoteState,
} from './schema';

const SLUG = 'freelance-quote-generator';

function Section(props: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-5 border-t border-line pt-7 first:border-t-0 first:pt-0">
      <legend className="type-h3 float-left mb-1 w-full text-ink">{props.title}</legend>
      {props.children}
    </fieldset>
  );
}

export default function FreelanceQuoteGenerator() {
  const { state: s, today, set, replace } = useLocalDraft(QUOTE_DRAFT_KEY, quoteDraftSchema, freshQuote);
  const tracked = useRef(false);

  function update(next: QuoteState) {
    set(next);
    if (!tracked.current) {
      tracked.current = true;
      track('calculate', { tool: SLUG });
    }
  }
  const patch = (p: Partial<QuoteState>) => update({ ...s, ...p });
  const patchFrom = (p: Partial<QuoteState['from']>) => patch({ from: { ...s.from, ...p } });
  const patchTo = (p: Partial<QuoteState['to']>) => patch({ to: { ...s.to, ...p } });

  const c = s.currency;
  const money = (n: number) => formatMoney(n, c);
  const errors = quoteErrors(s);
  const valid = Object.keys(errors).length === 0;
  const t = quoteTotals(toQuoteInput(s));
  const validUntil = s.issueDate && !errors.validDays ? addDays(s.issueDate, s.validDays) : '';

  const totals: SheetTotal[] = [
    { label: 'Subtotal', value: t.subtotal },
    ...(t.contingency > 0 ? [{ label: `Contingency (${s.contingency}%)`, value: t.contingency }] : []),
    ...(t.discount > 0 ? [{ label: `Discount (${s.discount}%)`, value: t.discount, minus: true }] : []),
    ...(t.tax > 0 ? [{ label: `${s.taxLabel.trim() || 'Tax'} (${s.taxRate}%)`, value: t.tax }] : []),
    { label: 'Total', value: t.total, strong: true },
  ];

  return (
    <div className="flex flex-col gap-6">
      <CalculatorGrid
        inputs={
          <InputsPanel label="Your quote">
            <div className="flex flex-col gap-7">
              <Section title="Quote details">
                <CurrencySelect value={c} onChange={(next: CurrencyCode) => update(switchQuoteCurrency(s, next))} />
                <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                  <TextField label="Quote number" value={s.number} onChange={(number) => patch({ number })} maxLength={DOC_LIMITS.number} />
                  <TextField
                    label="Issue date"
                    type="date"
                    value={s.issueDate}
                    onChange={(issueDate) => patch({ issueDate })}
                    error={errors.issueDate}
                  />
                  <InputNumber
                    label="Valid for"
                    value={s.validDays}
                    onChange={(validDays) => patch({ validDays })}
                    suffix="days"
                    help={validUntil ? `Valid until ${formatIsoDate(validUntil)}.` : undefined}
                    error={errors.validDays}
                  />
                  <TextField
                    label="Project title (optional)"
                    value={s.title}
                    onChange={(title) => patch({ title })}
                    maxLength={DOC_LIMITS.short}
                    placeholder="e.g. New company website"
                  />
                </div>
              </Section>

              <Section title="Your details">
                <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                  <TextField label="Your name or business" value={s.from.name} onChange={(name) => patchFrom({ name })} maxLength={DOC_LIMITS.short} autoComplete="organization" />
                  <TextField label="Email" type="email" value={s.from.email} onChange={(email) => patchFrom({ email })} maxLength={DOC_LIMITS.short} autoComplete="email" />
                  <TextField label="Phone" type="tel" value={s.from.phone} onChange={(phone) => patchFrom({ phone })} maxLength={DOC_LIMITS.short} autoComplete="tel" />
                  <TextField
                    label="Tax or business ID (optional)"
                    value={s.from.taxId}
                    onChange={(taxId) => patchFrom({ taxId })}
                    maxLength={DOC_LIMITS.short}
                  />
                </div>
                <TextArea label="Address" value={s.from.address} onChange={(address) => patchFrom({ address })} maxLength={DOC_LIMITS.address} />
              </Section>

              <Section title="Client">
                <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                  <TextField label="Client name" value={s.to.name} onChange={(name) => patchTo({ name })} maxLength={DOC_LIMITS.short} />
                  <TextField label="Company (optional)" value={s.to.company} onChange={(company) => patchTo({ company })} maxLength={DOC_LIMITS.short} />
                  <TextField label="Client email" type="email" value={s.to.email} onChange={(email) => patchTo({ email })} maxLength={DOC_LIMITS.short} />
                </div>
                <TextArea label="Client address" value={s.to.address} onChange={(address) => patchTo({ address })} maxLength={DOC_LIMITS.address} />
              </Section>

              <div className="border-t border-line pt-7">
                <LineItemsEditor
                  items={s.items}
                  lineTotals={t.lineTotals}
                  currency={c}
                  errors={errors}
                  onChange={(items) => patch({ items })}
                  newRate={exampleRate(c)}
                />
              </div>

              <Section title="Contingency, discount and tax">
                <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                  <InputNumber
                    label="Contingency (optional)"
                    help="Extra for unknowns. Many freelancers build this into the line items instead."
                    value={s.contingency}
                    onChange={(contingency) => patch({ contingency })}
                    suffix="%"
                    error={errors.contingency}
                  />
                  <InputNumber label="Discount (optional)" value={s.discount} onChange={(discount) => patch({ discount })} suffix="%" error={errors.discount} />
                  <TextField label="Tax label" value={s.taxLabel} onChange={(taxLabel) => patch({ taxLabel })} maxLength={DOC_LIMITS.short} help="As your local rules name it." />
                  <InputNumber
                    label="Tax rate"
                    help="0 = no tax line. Check the rate that applies to you."
                    value={s.taxRate}
                    onChange={(taxRate) => patch({ taxRate })}
                    suffix="%"
                    error={errors.taxRate}
                  />
                </div>
              </Section>

              <Section title="Notes and terms">
                <TextArea
                  label="Notes and terms"
                  help="What's included, revision rounds, payment terms."
                  value={s.notes}
                  onChange={(notes) => patch({ notes })}
                  maxLength={DOC_LIMITS.notes}
                  rows={4}
                />
              </Section>
            </div>
          </InputsPanel>
        }
        result={
          valid ? (
            <ResultCard
              label="Quote total"
              value={money(t.total)}
              unit={validUntil ? `${c} · valid until ${formatIsoDate(validUntil)}` : c}
              rows={totals
                .filter((row) => !row.strong)
                .map((row) => ({ label: row.label, value: row.minus ? `−${money(row.value)}` : money(row.value) }))}
              footnote="Your quote is saved in this browser only."
            />
          ) : (
            <ResultCard label="Quote total" value="" unit="" rows={[]} error="Check the highlighted fields to finish your quote." />
          )
        }
      />

      <DocToolbar toolSlug={SLUG} kind="quote" note={QUOTE_NOTE} onNew={() => replace(newQuote(s, today))} onClear={() => replace(null)} />

      <section aria-label="Quote preview" className="min-w-0">
        <DocumentSheet
          kind="Quote"
          number={s.number}
          title={s.title}
          meta={[
            { label: 'Date', value: s.issueDate ? formatIsoDate(s.issueDate) : '' },
            { label: 'Valid until', value: validUntil ? formatIsoDate(validUntil) : '' },
          ]}
          from={{ heading: 'From', lines: [s.from.name, s.from.address, s.from.email, s.from.phone, s.from.taxId ? `Tax ID: ${s.from.taxId}` : ''] }}
          to={{ heading: 'Prepared for', lines: [s.to.name, s.to.company, s.to.address, s.to.email] }}
          items={s.items}
          lineTotals={t.lineTotals}
          currency={c}
          totals={totals}
          blocks={[{ heading: 'Notes and terms', text: s.notes }]}
        />
      </section>
    </div>
  );
}
