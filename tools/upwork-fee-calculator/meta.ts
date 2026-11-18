import type { ToolMeta } from '@/lib/tool-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /freelance/upwork-fee-calculator.
 * Change the keyword map first, then this file and content.mdx (CLAUDE.md SEO rules).
 *
 * Scope rule (Puru, 2026-11-18): pure maths only. The fee % always comes from the user, and
 * no Upwork fee, fee range or other Upwork price is stated anywhere on the page.
 */
export const meta: ToolMeta = {
  slug: 'upwork-fee-calculator',
  category: 'freelance',
  primaryKeyword: 'upwork fee calculator',
  secondaryKeywords: ['upwork service fee calculator', 'how much does upwork take', 'upwork fees for freelancers'],
  title: 'Upwork Fee Calculator – What You Keep After Fees',
  description:
    "See Upwork's freelancer service fee on any contract and what you actually take home. Work backwards to the rate you need to quote on Upwork.",
  h1: 'Upwork Fee Calculator',
  subtitle: 'Enter the service fee % from your proposal to see the fee and what you take home, or work backwards to the price you need to quote.',
  risk: 'green',
  relatedTools: ['hourly-rate-calculator', 'rate-increase-calculator', 'freelance-invoice-generator'],
  // Keyword-map questions first (exact, same order), then 2 more from the spec.
  faq: [
    {
      q: 'How much does Upwork take from freelancers?',
      a: 'Upwork takes a service fee from what freelancers are paid, and the percentage can differ from one contract to another. We do not publish a number, because the only reliable figure is the one Upwork shows you. Look for the fee on your proposal or offer before you start, enter it in the calculator, and you will see the fee in dollars and what you take home.',
    },
    {
      q: 'How is the Upwork service fee calculated?',
      a: 'The calculator treats the fee as a percentage of the contract amount. Multiply the contract by your fee percentage to get the fee, then subtract it to get your take-home. For example, a $1,000 contract with a 10% fee would cost $100 and leave you $900. Always use the percentage shown on your own proposal, because that is what applies to your contract.',
    },
    {
      q: 'How do I set my Upwork rate after fees?',
      a: 'Start with what you want to keep, then divide by one minus your fee. If you want $20 an hour and your fee is 10%, divide 20 by 0.9 and charge $22.22. Choose "I want to take home" in the calculator and it works this out for you. It is the simplest way to make the fee come out of your price rather than your income.',
    },
    {
      q: 'Are there other Upwork costs (Connects, withdrawal)?',
      a: 'There can be. Sending proposals uses Connects, and moving money out of Upwork may cost something depending on the withdrawal method and your country. These costs change over time and differ between accounts, so we do not list them here. Check the prices shown in your own Upwork account, then add them to your planning alongside the service fee this calculator works out.',
    },
    {
      q: 'Upwork vs Fiverr fees?',
      a: 'The two platforms charge freelancers in different ways, and their fees can change, so we do not quote either one. The fair way to compare is to take the fee percentage each platform shows you for a job and look at what you keep from the same price. Run this calculator twice with each percentage, or use "Compare two fees" to see both side by side.',
    },
    {
      q: "Why is my Upwork fee different from someone else's?",
      a: 'The percentage can vary between contracts, so two freelancers can see different fees, and you can see different fees on different jobs. That is why this calculator asks for your own percentage instead of assuming one rate for everyone. Check the fee shown on each proposal or offer before you commit, and run the numbers again whenever it changes.',
    },
    {
      q: 'Does the client pay this fee or do I?',
      a: "You pay it. The freelancer service fee comes out of what you are paid, so it reduces your take-home rather than adding to the client's bill. If you want the client's price to cover the fee instead, raise your rate. Choose the \"I want to take home\" mode, enter the amount you need to keep, and the calculator shows the contract price that leaves you that amount.",
    },
  ],
};
