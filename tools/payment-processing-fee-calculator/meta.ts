import type { ToolMeta } from '@/lib/tool-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /business/payment-processing-fee-calculator.
 * Change the keyword map first, then this file and content.mdx (CLAUDE.md SEO rules).
 *
 * Scope rule (Puru, 2026-11-18): pure maths. Copy may say it works for PayPal, Stripe, Square
 * or any provider, but never states any company's rates.
 */
export const meta: ToolMeta = {
  slug: 'payment-processing-fee-calculator',
  category: 'business',
  primaryKeyword: 'payment processing fee calculator',
  secondaryKeywords: [
    'credit card processing fee calculator',
    'transaction fee calculator',
    'merchant fee calculator',
    'how much to charge to cover fees',
  ],
  title: 'Payment Processing Fee Calculator – Card & Online Fees',
  description:
    'Work out what card and online payment fees cost you. Enter your rate and fixed fee to see what you receive, or how much to charge to cover fees.',
  h1: 'Payment Processing Fee Calculator',
  subtitle: 'Enter your provider’s percentage and fixed fee to see what a payment costs you, or the price to charge so you receive a set amount.',
  risk: 'green',
  relatedTools: ['upwork-fee-calculator', 'freelance-invoice-generator', 'hourly-rate-calculator'],
  rates: [],
  // Keyword-map questions first (exact, same order), then 2 more from the spec.
  faq: [
    {
      q: 'How are payment processing fees calculated?',
      a: 'Most providers charge a percentage of the payment, often plus a fixed amount for each transaction. Multiply the payment by the percentage, add the fixed fee, and that is the total fee. Subtract it from the payment to see what you receive. For example, $100 at 3% plus $0.30 costs $3.30 and leaves you $96.70. Use the figures from your own provider.',
    },
    {
      q: 'How do I pass card fees on to customers?',
      a: 'Work backwards from the amount you want to receive. Add the fixed fee to your target, then divide by one minus the percentage. To receive $100 at 3% plus $0.30, charge $103.40. Choose "I want to receive" in the calculator and it does this for you. Check your provider’s rules first, and show clearly on your quote or invoice how the price was set.',
    },
    {
      q: 'Why do small payments cost more in fees?',
      a: 'Because the fixed part of the fee stays the same however small the payment is. On a $100 payment, a $0.30 fixed fee is a tiny share. On a $5 payment, the same $0.30 is six percent on its own, so a 3% plus $0.30 fee takes 9% of the sale. If you take many small payments, look closely at the fixed fee.',
    },
    {
      q: 'What is an effective processing rate?',
      a: 'It is the total fee divided by the payment, shown as a percentage. It combines the percentage and the fixed fee into one number, so you can see what a payment really costs. A 3% plus $0.30 fee is an effective 3.3% on a $100 payment but 9% on a $5 payment. Comparing effective rates is the fairest way to compare two providers.',
    },
    {
      q: 'Should I charge clients for card fees?',
      a: 'It depends on your business and your provider. Many freelancers and small businesses simply build fees into their prices, which keeps invoices simple. Others add the fee as a separate line. Either way, check your provider’s terms first, because some restrict surcharges, and be open with clients about how your price is set. The calculator shows the price that covers the fee.',
    },
    {
      q: 'What counts as a fixed fee?',
      a: 'A fixed fee is a set amount charged on every payment, whatever its size, such as 30 cents or 10 rupees per transaction. Not every provider charges one, and some only charge it on certain payment types. Look for it on your provider’s pricing page or on your statements. If you only pay a percentage, enter 0 as the fixed fee.',
    },
    {
      q: 'How do I compare two payment providers?',
      a: 'Enter the first provider’s percentage and fixed fee above, then open "Compare two providers" and enter the second. The calculator shows what each one costs on the same payment, what you receive and the effective rate. Try a typical payment size for your business, because a provider with a lower percentage but a higher fixed fee can cost more on small payments.',
    },
  ],
};
