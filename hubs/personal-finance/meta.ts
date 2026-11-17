import type { HubMeta } from '@/lib/hub-types';

/** SEO fields copied exactly from docs/seo/keyword-map.md → /personal-finance/ (hub: Personal Finance). */
export const hub: HubMeta = {
  slug: 'personal-finance',
  primaryKeyword: 'personal finance calculators',
  secondaryKeywords: ['emergency fund calculator', 'savings calculator'],
  title: 'Personal Finance Calculators – Save and Plan Ahead',
  description:
    'Plan your emergency fund and savings goals with simple, free personal finance calculators, built for people with a steady or irregular income.',
  h1: 'Personal Finance Calculators',
  intro:
    'Free personal finance calculators to plan a safety net and your savings goals, whether your income is a steady salary or changes month to month. Each one shows its working in plain English.',
  faq: [
    {
      q: 'Where should I start with personal finance?',
      a: 'Start by knowing your essential monthly costs, then build a safety net that covers several months of them. An emergency fund stops a surprise bill or a quiet month from turning into debt, and it gives you room to make calmer decisions about work and spending. Once it is in place, saving for other goals becomes much easier.',
    },
    {
      q: 'Are these calculators suitable for freelancers?',
      a: 'Yes. They were built with irregular income in mind. The emergency fund calculator, for example, suggests more months of cover for self-employed and variable income than for a steady salary, and you can change every assumption. Our freelance calculators can also help you set a rate that leaves room to save each month.',
    },
    {
      q: 'Is this financial advice?',
      a: 'No. The calculators give estimates based on the numbers you enter and on simple, clearly explained rules of thumb. They are meant to help you plan and compare options, not to replace advice for your own situation. For decisions about debt, investments or pensions, speak to a qualified financial adviser who can look at your whole picture.',
    },
  ],
  lastUpdated: '2026-11-17',
};
