import type { HubMeta } from '@/lib/hub-types';

/** SEO fields copied exactly from docs/seo/keyword-map.md → /marketing/ (hub: Marketing). */
export const hub: HubMeta = {
  slug: 'marketing',
  primaryKeyword: 'marketing calculators',
  secondaryKeywords: ['marketing roi calculators', 'ad spend calculators'],
  title: 'Marketing Calculators – CAC, ROAS and Cost Per Lead',
  description:
    'Free marketing calculators for small businesses: work out customer acquisition cost, return on ad spend and cost per lead from your own campaign numbers.',
  h1: 'Marketing Calculators',
  intro:
    'Free marketing calculators that turn your own campaign numbers into clear answers: what each lead and each new customer costs, and whether your ads pay for themselves. Each one shows its formula and worked examples.',
  faq: [
    {
      q: 'Which marketing number should I check first?',
      a: 'Start with what a new customer costs you, because it covers every channel at once. Add up your sales and marketing spend for a month and divide it by the new customers you won in that month. Then check cost per lead and return on ad spend for each channel, so you can see which one brings in customers most cheaply.',
    },
    {
      q: 'Do I need exact numbers to use these calculators?',
      a: 'No. Rough numbers from your ad account, your bank statement or a spreadsheet are enough to start. The main thing is to use the same period for spend and results, such as one month of spend and the leads or customers from that same month. As your tracking gets better, come back and run the numbers again.',
    },
    {
      q: 'Do these calculators use industry averages?',
      a: 'No. Every result comes only from the numbers you enter. Averages from other businesses rarely match your prices, margins or customers, so the calculators help you set your own targets instead. The return on ad spend calculator, for example, works out your break-even point from your own profit margin rather than quoting a typical figure.',
    },
  ],
  lastUpdated: '2026-11-19',
};
