import type { HubMeta } from '@/lib/hub-types';

/** SEO fields copied exactly from docs/seo/keyword-map.md → /fees/ (hub: Fees & Payments). */
export const hub: HubMeta = {
  slug: 'fees',
  primaryKeyword: 'payment fee calculators',
  secondaryKeywords: ['paypal fee calculator', 'stripe fee calculator', 'upwork fee calculator'],
  title: 'Payment Fee Calculators – PayPal, Stripe, Wise, Upwork',
  description:
    "See what PayPal, Stripe, Wise, Payoneer, Upwork and Fiverr take from your payments, using each company's official fees, and keep more of what you earn.",
  h1: 'Payment and Platform Fee Calculators',
  intro:
    "Free payment fee calculators that show what a platform or payment service takes from your money, and what actually reaches you. Every fee comes from the company's own pricing page, with the link and the date we last checked it.",
  faq: [
    {
      q: 'Where do the fees in these calculators come from?',
      a: "Every fee comes from the company's own published pricing or help page. We save the exact line we used, the link and the date we checked it, and show that date in the Sources section of each calculator. We check every fee page again at least every three months, and sooner when a company announces a change. If a fee cannot be confirmed from an official page, we leave it out.",
    },
    {
      q: 'Why might my real fee be different from the calculator?',
      a: "Platforms change their prices, run promotions and sometimes set fees per account or per contract. Card type, the country of your customer and currency conversion can all change the total too. The calculators use each company's standard published fees, so treat the result as a close estimate and always compare it with the fee shown in your own account before you rely on it.",
    },
    {
      q: 'How do I pass a payment fee on to my client?',
      a: "Work backwards from the amount you want to receive. If a platform takes a percentage, dividing your target by one minus that percentage gives the price to charge. Several of these calculators have a reverse mode that does this for you. Check the platform's rules first, because some do not allow surcharges, and say clearly on your quote or invoice how the price was set.",
    },
  ],
  lastUpdated: '2026-11-18',
};
