import type { HubMeta } from '@/lib/hub-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /fees/ (hub: Fees & Payments).
 * Scope rule (Puru, 2026-11-18): the intro, FAQ and guide never state a company's fees; every
 * fee in these calculators is entered by the user. The keyword-map title/meta still name
 * PayPal, Stripe and Wise and still say "official fees": waiting on Puru (the hub has no live
 * tool yet, so it isn't published).
 */
export const hub: HubMeta = {
  slug: 'fees',
  primaryKeyword: 'payment fee calculators',
  secondaryKeywords: ['paypal fee calculator', 'stripe fee calculator', 'upwork fee calculator'],
  title: 'Payment Fee Calculators – PayPal, Stripe, Wise, Upwork',
  description:
    "See what PayPal, Stripe, Wise, Payoneer, Upwork and Fiverr take from your payments, using each company's official fees, and keep more of what you earn.",
  h1: 'Payment and Platform Fee Calculators',
  intro:
    'Free payment fee calculators that show what a platform or payment service takes from your money, and what actually reaches you. You enter the fee shown in your own account, so the maths always matches your real pricing.',
  faq: [
    {
      q: 'Why do I have to enter the fee myself?',
      a: 'Platforms change their prices, run promotions and often set different fees for different accounts, countries or contracts. A number printed on our page could easily be out of date or simply not yours. The fee shown in your own account, proposal or pricing page is the one that applies, so the calculators ask for it and then do the maths clearly and exactly.',
    },
    {
      q: 'Where can I find the fee I pay?',
      a: 'Look where the platform shows prices for your account. Freelance marketplaces usually show the service fee on each proposal or offer. Payment processors usually list their percentage and any fixed fee per payment on their pricing page or in your dashboard, and your statements show what was actually taken. Use those figures in the calculator, and check them again from time to time.',
    },
    {
      q: 'How do I pass a payment fee on to my client?',
      a: 'Work backwards from the amount you want to receive. If a platform takes a percentage, dividing your target by one minus that percentage gives the price to charge. The calculators have a reverse mode that does this for you. Check the platform rules first, because some do not allow surcharges, and say clearly on your quote or invoice how the price was set.',
    },
  ],
  lastUpdated: '2026-11-18',
};
