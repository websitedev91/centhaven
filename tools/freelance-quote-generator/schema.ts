// zod/mini keeps the client bundle small (same validation, tree-shakable API).
import * as z from 'zod/mini';
import { nextDocNumber } from '@/lib/doc-calc';
import {
  DOC_LIMITS,
  addError,
  emptyFrom,
  exampleItem,
  fromSchema,
  itemErrors,
  lineItemSchema,
  percentError,
  switchItemsCurrency,
  type DocErrors,
} from '@/lib/doc-schema';
import { CURRENCIES, type CurrencyCode } from '@/lib/format';
import type { QuoteInput } from './calc';

/** Saved in this browser only (shared rule 2). Bump the version if the shape changes. */
export const QUOTE_DRAFT_KEY = 'centhaven:quote-draft:v1';
export const QUOTE_FIRST_NUMBER = 'Q-0001';

export const QUOTE_NOTE =
  'This is a simple quote. If you add tax, some countries have rules on how it must be shown (for example GST in India or VAT in the UK/EU). Check your local rules.';

const clientSchema = z.object({ name: z.string(), company: z.string(), address: z.string(), email: z.string() });

/** Types only: limits are inline errors (quoteErrors), so a half-finished draft still reloads. */
export const quoteDraftSchema = z.object({
  v: z.literal(1),
  currency: z.enum(CURRENCIES),
  number: z.string(),
  issueDate: z.string(),
  validDays: z.number(),
  title: z.string(),
  from: fromSchema,
  to: clientSchema,
  items: z.array(lineItemSchema).check(z.minLength(1), z.maxLength(DOC_LIMITS.items)),
  contingency: z.number(),
  discount: z.number(),
  taxLabel: z.string(),
  taxRate: z.number(),
  notes: z.string(),
});

export type QuoteState = z.infer<typeof quoteDraftSchema>;

export const QUOTE_DEFAULT_NOTES = 'Payment terms: 50% to start, 50% on delivery.';

/** A fresh quote (first visit or after Clear form). `today` is '' during the server render. */
export function freshQuote(today: string, currency: CurrencyCode = 'USD'): QuoteState {
  return {
    v: 1,
    currency,
    number: QUOTE_FIRST_NUMBER,
    issueDate: today,
    validDays: 30,
    title: '',
    from: { ...emptyFrom },
    to: { name: '', company: '', address: '', email: '' },
    items: [exampleItem(currency)],
    contingency: 0,
    discount: 0,
    taxLabel: 'Tax',
    taxRate: 0,
    notes: QUOTE_DEFAULT_NOTES,
  };
}

/**
 * "Start a new quote": keeps your details, currency, validity, tax line and terms; clears the
 * client, title, items, contingency and discount; suggests the next number; dates it today.
 */
export function newQuote(prev: QuoteState, today: string): QuoteState {
  return {
    ...freshQuote(today, prev.currency),
    number: nextDocNumber(prev.number, QUOTE_FIRST_NUMBER),
    validDays: prev.validDays,
    from: { ...prev.from },
    taxLabel: prev.taxLabel,
    taxRate: prev.taxRate,
    notes: prev.notes,
  };
}

/** Currency switch: example line rates follow the currency until edited (switchCurrency). */
export function switchQuoteCurrency(s: QuoteState, next: CurrencyCode): QuoteState {
  if (next === s.currency) return s;
  return { ...s, currency: next, items: switchItemsCurrency(s.items, s.currency, next) };
}

export function quoteErrors(s: QuoteState): DocErrors {
  const out: DocErrors = itemErrors(s.items);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s.issueDate) && s.issueDate !== '') out.issueDate = 'Pick a date';
  addError(
    out,
    'validDays',
    !Number.isInteger(s.validDays) ? 'Use whole days' : s.validDays < 1 ? 'Minimum is 1 day' : s.validDays > 365 ? 'Maximum is 365 days' : undefined,
  );
  addError(out, 'contingency', percentError(s.contingency, 50));
  addError(out, 'discount', percentError(s.discount, 100));
  addError(out, 'taxRate', percentError(s.taxRate, 100));
  return out;
}

export function toQuoteInput(s: QuoteState): QuoteInput {
  return {
    lines: s.items,
    contingency: s.contingency / 100,
    discount: s.discount / 100,
    taxRate: s.taxRate / 100,
  };
}
