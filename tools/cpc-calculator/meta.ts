import type { ToolMeta } from '@/lib/tool-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /marketing/cpc-calculator.
 * Change the keyword map first, then this file and content.mdx (CLAUDE.md SEO rules).
 * Pure maths: no average CPC figures.
 */
export const meta: ToolMeta = {
  slug: 'cpc-calculator',
  category: 'marketing',
  primaryKeyword: 'cpc calculator',
  secondaryKeywords: ['cost per click calculator', 'how to calculate cpc', 'cost per conversion calculator', 'ppc budget calculator'],
  title: 'CPC Calculator – Cost Per Click and Clicks From a Budget',
  description:
    'Work out your cost per click from ad spend and clicks, or see how many clicks a budget buys. Add a conversion rate to find your cost per conversion.',
  h1: 'CPC Calculator',
  subtitle: 'Find what each click costs, or how many clicks a budget buys, and what each conversion costs you.',
  risk: 'green',
  relatedTools: ['cost-per-lead-calculator', 'roas-calculator', 'cac-calculator'],
  // Keyword-map questions first (exact, same order), then 2 more.
  faq: [
    {
      q: 'How do you calculate cost per click?',
      a: 'Divide what you spent on the ads by the number of clicks they got. If a campaign cost $500 and brought 250 clicks, the cost per click is 500 ÷ 250 = $2.00. Use the spend and the clicks from the same campaign and the same dates, or the result will mix two different things and be hard to compare.',
    },
    {
      q: 'How many clicks will my budget get?',
      a: 'Divide your budget by the cost per click you expect. A budget of $1,000 at $1.25 a click buys 1,000 ÷ 1.25 = 800 clicks. Your real cost per click changes from day to day, so treat the answer as a planning number. Choose Clicks from a budget in the calculator and enter your own figures to see it.',
    },
    {
      q: 'What is cost per conversion?',
      a: 'Cost per conversion is what you pay, on average, for each sale, lead or sign-up that comes from your ads. Divide the ad spend by the number of conversions. If $500 of clicks led to 10 sales, each sale cost $50. Add your conversion rate in the calculator and it works this out from your clicks for you.',
    },
    {
      q: 'How can I lower my CPC?',
      a: 'Start by finding where clicks cost the most. Compare campaigns, keywords and audiences by their cost per click, then move budget towards the cheaper ones that still convert. Clearer ads and landing pages that match what people searched for often help. Change one thing at a time and recalculate, so you can see which change actually made the difference.',
    },
    {
      q: 'Is a lower CPC always better?',
      a: 'No. Cheap clicks that never turn into customers can cost more in the end than expensive clicks that do. What matters is the cost per conversion and the profit each conversion brings. A campaign at $2.50 a click with a 5% conversion rate beats one at $1.00 a click with a 1% rate, because each sale costs $50 instead of $100.',
    },
    {
      q: 'What is the difference between CPC and CPM?',
      a: 'CPC means cost per click: you look at what each click on your ad costs. CPM means cost per thousand impressions: you look at what it costs for your ad to be shown a thousand times, whether anyone clicks or not. This calculator works with clicks. If you pay per impression, divide your spend by your clicks to compare on the same basis.',
    },
    {
      q: 'How do I set a daily budget?',
      a: 'Divide the total you want to spend by the number of days the campaign runs. A $1,000 budget over 20 days is $50 a day. To plan for a number of clicks instead, multiply the clicks you want by your expected cost per click, then divide by the days. Ad platforms may spend a little above or below the daily amount on some days.',
    },
  ],
};
