import type { ToolMeta } from '@/lib/tool-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /freelance/late-fee-calculator.
 * Change the keyword map first, then this file and content.mdx (CLAUDE.md SEO rules).
 * Never mention legal or statutory late-payment rates (Puru, 2026-11-18): pure maths on the
 * fee the user agreed with their client.
 */
export const meta: ToolMeta = {
  slug: 'late-fee-calculator',
  category: 'freelance',
  primaryKeyword: 'late fee calculator',
  secondaryKeywords: ['invoice late fee calculator', 'late payment fee calculator', 'how to charge a late fee on an invoice'],
  title: 'Late Fee Calculator – Invoice Late Payment Fees',
  description:
    'Work out a late fee on an overdue invoice using the terms you agreed with your client: a flat fee, a one-off percentage or a monthly percentage by days late.',
  h1: 'Late Fee Calculator',
  subtitle: 'Work out the late fee on an overdue invoice from the terms you agreed: a flat fee, a one-off % or a % per 30 days.',
  risk: 'green',
  relatedTools: ['freelance-invoice-generator', 'freelance-quote-generator', 'retainer-fee-calculator'],
  affiliateId: 'invoicing-software',
  // Keyword-map questions first (exact, same order), then 2 more.
  faq: [
    {
      q: 'How do I calculate a late fee on an invoice?',
      a: 'Start with the late fee in your contract or invoice terms. A flat fee is simply added once the invoice is late. A one-off percentage is the invoice amount multiplied by that percentage. A percentage per 30 days is charged by the day: the invoice amount times the percentage, divided by 30, times the days late. The calculator does each of these for you.',
    },
    {
      q: 'How much should I charge for late payment?',
      a: 'Charge the fee you agreed with your client, and agree it before the work starts. Write it in your contract and on every invoice so there are no surprises. Many freelancers choose a fee that is large enough to encourage prompt payment but small enough to keep the relationship friendly. The starting values in this calculator are examples only, not a recommendation.',
    },
    {
      q: 'Should I add a grace period?',
      a: 'A short grace period can keep things friendly, because payments sometimes take a few days to arrive. If your terms include one, enter it in the calculator and the fee will only count the days after the grace period ends. Whatever you choose, state it clearly on your invoices, so your client knows exactly when a late fee will start to apply.',
    },
    {
      q: 'How do I tell a client about a late fee?',
      a: 'Keep it polite and factual. Send a reminder when the invoice becomes overdue, mention the late fee from your terms, and give a clear date to pay by. If the fee then applies, send an updated invoice that shows the original amount, the late fee and the new total as separate lines. The invoice generator makes that updated invoice quickly.',
    },
    {
      q: 'Should I charge a flat fee or a percentage?',
      a: 'A flat fee is simple and works well for smaller invoices, because everyone knows the amount in advance. A percentage grows with the invoice, so it fits larger projects better. A percentage per 30 days also grows the longer payment is delayed, which gives a client a reason to pay sooner. Pick one, write it in your terms and use it consistently.',
    },
    {
      q: 'What does a percentage per 30 days mean?',
      a: 'It means the fee grows by the day, so a full 30 days late costs the whole percentage. With 2% per 30 days on a $2,000 invoice, each day late adds about $1.33, and 45 days late adds $60. Charging by the day keeps the fee fair for payments that are only a little late, and it grows steadily for payments that stay unpaid.',
    },
    {
      q: 'Should I send a new invoice with the late fee?',
      a: 'Usually yes. Send an updated invoice, or a separate one, that shows the original amount, the late fee and the new total, with the same invoice reference so your client can match them. Keep a short, friendly note with it. Clear paperwork makes it easier for the client to pay and easier for you to track what is still owed.',
    },
  ],
};
