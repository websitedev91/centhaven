import type { HubMeta } from '@/lib/hub-types';

/** SEO fields copied exactly from docs/seo/keyword-map.md → /freelance/ (hub: Freelance). */
export const hub: HubMeta = {
  slug: 'freelance',
  primaryKeyword: 'freelance calculators',
  secondaryKeywords: ['freelance rate calculator', 'freelance pricing tools'],
  title: 'Freelance Calculators – Rates, Pricing and Quotes',
  description:
    'Free calculators for freelancers: set your hourly or day rate, plan a rate increase, price projects and retainers, and see what you really earn.',
  h1: 'Freelance Calculators',
  intro:
    'Free freelance calculators to set a rate that covers your costs, turn a day rate into a yearly figure and test a price rise before you announce it. Every tool shows its formula and worked examples, and works in six currencies.',
  faq: [
    {
      q: 'Which calculator should I start with?',
      a: 'Start with the freelance hourly rate calculator. It works out the lowest rate that covers your income goal, tax, expenses and unpaid time, which is the number every other decision builds on. Once you know that floor, use the day rate calculator for contracts and the rate increase calculator when it is time to charge more.',
    },
    {
      q: 'Are these calculators free to use?',
      a: 'Yes. Every calculator on CentHaven is free, with no sign-up and no limit on how often you use it. Your numbers stay in your browser, and in the page address if you share a link, and nothing you type is saved on our side. If we show a partner offer, it is clearly marked and never changes the results.',
    },
    {
      q: 'Do the results include tax?',
      a: 'It depends on the tool. The hourly rate calculator lets you add a rough tax rate so your take-home income is covered. The day rate and rate increase calculators work before tax, so you can compare like with like. Tax rules differ by country, so treat every result as an estimate and check your own situation with an accountant.',
    },
  ],
  lastUpdated: '2026-11-16',
};
