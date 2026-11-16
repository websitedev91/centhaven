import type { HubMeta } from '@/lib/hub-types';

/** SEO fields copied exactly from docs/seo/keyword-map.md → /business/ (hub: Small Business). */
export const hub: HubMeta = {
  slug: 'business',
  primaryKeyword: 'small business calculators',
  secondaryKeywords: ['break even calculator', 'business finance calculators'],
  title: 'Small Business Calculators – Break-Even and Utilization',
  description:
    'Free calculators for small businesses and agencies: find your break-even point, track billable utilization and plan depreciation in minutes.',
  h1: 'Small Business Calculators',
  intro:
    'Free small business calculators for the numbers that keep a business or freelance practice healthy: how many sales cover your costs, and how much of your time actually earns money. Each one explains its formula in plain English.',
  faq: [
    {
      q: 'Which number should a small business check first?',
      a: 'Start with your break-even point: the sales you need each month to cover your fixed costs. It tells you the minimum you must sell before you make any profit, and it changes whenever your price or costs change. If you sell your own time, check your utilization next, because unbilled hours are the most common reason a business falls short.',
    },
    {
      q: 'Do these calculators work for freelancers and agencies?',
      a: 'Yes. The break-even calculator can count projects or clients instead of units, so it works for service businesses as well as shops. The utilization rate calculator is built for anyone who sells time, from a solo freelancer tracking a week to an agency looking at a whole team over a year. Both explain their maths with worked examples.',
    },
    {
      q: 'How often should I recalculate?',
      a: 'Whenever something important changes: a new price, a new supplier, a rent increase, a new hire or a big client leaving. Otherwise, a quick check every quarter is a good habit. The calculators take a minute, and you can save a share link with your numbers so it is easy to come back and update them next time.',
    },
  ],
  lastUpdated: '2026-11-16',
};
