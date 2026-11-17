'use client';

import { useRef, useState, type ReactNode } from 'react';
import { InputsPanel } from '@/components/CalculatorGrid';
import { CurrencySelect } from '@/components/CurrencySelect';
import { InputCurrency } from '@/components/InputCurrency';
import { InputNumber } from '@/components/InputNumber';
import { SelectField } from '@/components/SelectField';
import { secondaryButtonClass, textButtonClass } from '@/components/actionButtonClass';
import { DocToolbar } from '@/components/doc/DocToolbar';
import { DocWorkspace } from '@/components/doc/DocWorkspace';
import { DocumentSheet, type SheetTotal } from '@/components/doc/DocumentSheet';
import { LineItemsEditor } from '@/components/doc/LineItemsEditor';
import { TextArea, TextField } from '@/components/doc/TextField';
import { TrashIcon } from '@/components/icons';
import { track } from '@/lib/analytics';
import { addDays, formatIsoDate } from '@/lib/dates';
import { DOC_LIMITS, exampleRate } from '@/lib/doc-schema';
import { formatMoney, type CurrencyCode } from '@/lib/format';
import { useLocalDraft } from '@/lib/use-local-draft';
import { invoiceTotals, termDays, type Terms } from './calc';
import {
  INVOICE_DRAFT_KEY,
  INVOICE_NOTE,
  LOGO_TYPES,
  freshInvoice,
  invoiceDraftSchema,
  invoiceErrors,
  logoError,
  newInvoice,
  switchInvoiceCurrency,
  toInvoiceInput,
  type InvoiceState,
} from './schema';

const SLUG = 'freelance-invoice-generator';

const TERM_OPTIONS: readonly { value: Terms; label: string }[] = [
  { value: 'receipt', label: 'Due on receipt' },
  { value: '7', label: 'Net 7 (7 days)' },
  { value: '14', label: 'Net 14 (14 days)' },
  { value: '30', label: 'Net 30 (30 days)' },
  { value: '60', label: 'Net 60 (60 days)' },
  { value: 'custom', label: 'Custom number of days' },
];

function Section(props: { title: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-5 border-t border-line pt-7 first:border-t-0 first:pt-0">
      <legend className="type-h3 float-left mb-1 w-full text-ink">{props.title}</legend>
      {props.children}
    </fieldset>
  );
}

export default function FreelanceInvoiceGenerator() {
  const { state: s, today, set, replace } = useLocalDraft(INVOICE_DRAFT_KEY, invoiceDraftSchema, freshInvoice);
  const tracked = useRef(false);
  const [logoMessage, setLogoMessage] = useState<string>();

  function update(next: InvoiceState) {
    set(next);
    if (!tracked.current) {
      tracked.current = true;
      track('calculate', { tool: SLUG });
    }
  }
  const patch = (p: Partial<InvoiceState>) => update({ ...s, ...p });
  const patchFrom = (p: Partial<InvoiceState['from']>) => patch({ from: { ...s.from, ...p } });
  const patchTo = (p: Partial<InvoiceState['to']>) => patch({ to: { ...s.to, ...p } });

  function pickLogo(file: File | undefined) {
    if (!file) return;
    const err = logoError(file);
    if (err) {
      setLogoMessage(err);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setLogoMessage(undefined);
      if (typeof reader.result === 'string') patch({ logo: reader.result });
    };
    reader.onerror = () => setLogoMessage('That file could not be read. Try another image.');
    reader.readAsDataURL(file);
  }

  const c = s.currency;
  const money = (n: number) => formatMoney(n, c);
  const errors = invoiceErrors(s);
  const valid = Object.keys(errors).length === 0;
  const t = invoiceTotals(toInvoiceInput(s));
  const days = termDays(s.terms, s.customDays);
  const dueDate = s.issueDate && !errors.customDays ? addDays(s.issueDate, days) : '';
  const termsLabel = s.terms === 'receipt' ? 'Due on receipt' : `Net ${days}`;
  const paidInFull = t.total > 0 && t.balance === 0;

  const totals: SheetTotal[] = [
    { label: 'Subtotal', value: t.subtotal },
    ...(t.discount > 0 ? [{ label: `Discount (${s.discount}%)`, value: t.discount, minus: true }] : []),
    ...(t.tax > 0 ? [{ label: `${s.taxLabel.trim() || 'Tax'} (${s.taxRate}%)`, value: t.tax }] : []),
    { label: 'Total', value: t.total, strong: true },
    ...(t.paid > 0 ? [{ label: 'Amount paid', value: t.paid, minus: true }, { label: 'Balance due', value: t.balance, strong: true }] : []),
  ];

  return (
    <DocWorkspace
      kind="invoice"
      total={paidInFull ? 'Paid in full' : money(t.balance)}
      totalLabel="Balance due"
      detail={paidInFull ? `Paid in full · total ${money(t.total)}` : dueDate ? `${c} · due ${formatIsoDate(dueDate)}` : c}
      error={valid ? undefined : 'Check the highlighted fields to finish your invoice.'}
      form={
          <InputsPanel label="Your invoice">
            <div className="flex flex-col gap-7">
              <Section title="Invoice details">
                <CurrencySelect value={c} onChange={(next: CurrencyCode) => update(switchInvoiceCurrency(s, next))} />
                <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                  <TextField label="Invoice number" value={s.number} onChange={(number) => patch({ number })} maxLength={DOC_LIMITS.number} />
                  <TextField label="PO or reference (optional)" value={s.po} onChange={(po) => patch({ po })} maxLength={DOC_LIMITS.number} />
                  <TextField label="Issue date" type="date" value={s.issueDate} onChange={(issueDate) => patch({ issueDate })} error={errors.issueDate} />
                  <SelectField<Terms>
                    label="Payment terms"
                    value={s.terms}
                    options={TERM_OPTIONS}
                    onChange={(terms) => patch({ terms })}
                    help={dueDate ? `Due ${formatIsoDate(dueDate)}.` : undefined}
                  />
                  {s.terms === 'custom' ? (
                    <InputNumber label="Days to pay" value={s.customDays} onChange={(customDays) => patch({ customDays })} suffix="days" error={errors.customDays} />
                  ) : null}
                </div>
              </Section>

              <Section title="Your details">
                <div className="flex flex-col gap-2">
                  <p className="type-small font-[550] text-ink">Logo (optional)</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className={`${secondaryButtonClass} cursor-pointer has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-haven`}>
                      <input
                        type="file"
                        accept={LOGO_TYPES.join(',')}
                        className="sr-only"
                        onChange={(e) => {
                          pickLogo(e.target.files?.[0]);
                          e.target.value = '';
                        }}
                      />
                      {s.logo ? 'Change logo' : 'Add a logo'}
                    </label>
                    {s.logo ? (
                      <button type="button" className={textButtonClass} onClick={() => patch({ logo: '' })}>
                        <TrashIcon size={16} />
                        Remove logo
                      </button>
                    ) : null}
                  </div>
                  {logoMessage ? (
                    <p role="alert" className="type-small font-[550] text-danger">
                      {logoMessage}
                    </p>
                  ) : (
                    <p className="type-small text-ink-muted">PNG, JPG or SVG, up to 500 KB. It stays in this browser and is never uploaded.</p>
                  )}
                </div>
                <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                  <TextField label="Your name or business" value={s.from.name} onChange={(name) => patchFrom({ name })} maxLength={DOC_LIMITS.short} autoComplete="organization" />
                  <TextField label="Email" type="email" value={s.from.email} onChange={(email) => patchFrom({ email })} maxLength={DOC_LIMITS.short} autoComplete="email" />
                  <TextField label="Phone" type="tel" value={s.from.phone} onChange={(phone) => patchFrom({ phone })} maxLength={DOC_LIMITS.short} autoComplete="tel" />
                  <TextField label="Tax or business ID (optional)" value={s.from.taxId} onChange={(taxId) => patchFrom({ taxId })} maxLength={DOC_LIMITS.short} />
                </div>
                <TextArea label="Address" value={s.from.address} onChange={(address) => patchFrom({ address })} maxLength={DOC_LIMITS.address} />
              </Section>

              <Section title="Bill to">
                <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                  <TextField label="Client name" value={s.to.name} onChange={(name) => patchTo({ name })} maxLength={DOC_LIMITS.short} />
                  <TextField label="Company (optional)" value={s.to.company} onChange={(company) => patchTo({ company })} maxLength={DOC_LIMITS.short} />
                  <TextField label="Client email" type="email" value={s.to.email} onChange={(email) => patchTo({ email })} maxLength={DOC_LIMITS.short} />
                  <TextField label="Client tax ID (optional)" value={s.to.taxId} onChange={(taxId) => patchTo({ taxId })} maxLength={DOC_LIMITS.short} />
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

              <Section title="Discount, tax and payments">
                <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                  <InputNumber label="Discount (optional)" value={s.discount} onChange={(discount) => patch({ discount })} suffix="%" error={errors.discount} />
                  <InputCurrency
                    label="Amount already paid"
                    help="A deposit or part payment. 0 if none."
                    currency={c}
                    value={s.paid}
                    onChange={(paid) => patch({ paid })}
                    error={errors.paid}
                  />
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

              <Section title="Payment details and notes">
                <TextArea
                  label="Payment details"
                  value={s.payment}
                  onChange={(payment) => patch({ payment })}
                  maxLength={DOC_LIMITS.payment}
                  placeholder="Bank name, account number, IBAN/SWIFT, or your PayPal / Wise email"
                  rows={4}
                />
                <TextArea label="Notes" value={s.notes} onChange={(notes) => patch({ notes })} maxLength={DOC_LIMITS.notes} />
              </Section>
            </div>
          </InputsPanel>
      }
      toolbar={<DocToolbar toolSlug={SLUG} kind="invoice" note={INVOICE_NOTE} onNew={() => replace(newInvoice(s, today))} onClear={() => replace(null)} />}
      preview={
        <section aria-label="Invoice preview" className="min-w-0">
        <DocumentSheet
          kind="Invoice"
          number={s.number}
          logo={s.logo || undefined}
          meta={[
            { label: 'Issue date', value: s.issueDate ? formatIsoDate(s.issueDate) : '' },
            { label: 'Due date', value: dueDate ? formatIsoDate(dueDate) : '' },
            { label: 'Terms', value: termsLabel },
            { label: 'PO / reference', value: s.po },
          ]}
          from={{ heading: 'From', lines: [s.from.name, s.from.address, s.from.email, s.from.phone, s.from.taxId ? `Tax ID: ${s.from.taxId}` : ''] }}
          to={{ heading: 'Bill to', lines: [s.to.name, s.to.company, s.to.address, s.to.email, s.to.taxId ? `Tax ID: ${s.to.taxId}` : ''] }}
          items={s.items}
          lineTotals={t.lineTotals}
          currency={c}
          totals={totals}
          blocks={[
            { heading: 'Payment details', text: s.payment },
            { heading: 'Notes', text: s.notes },
          ]}
        />
        </section>
      }
    />
  );
}
