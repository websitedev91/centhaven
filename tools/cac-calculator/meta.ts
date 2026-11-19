import type { ToolMeta } from '@/lib/tool-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /marketing/cac-calculator.
 * Change the keyword map first, then this file and content.mdx (CLAUDE.md SEO rules).
 * Pure maths: 3 : 1 is "a common rule of thumb", never a benchmark. No industry CAC figures.
 */
export const meta: ToolMeta = {
  slug: 'cac-calculator',
  category: 'marketing',
  primaryKeyword: 'cac calculator',
  secondaryKeywords: [
    'customer acquisition cost calculator',
    'how to calculate customer acquisition cost',
    'ltv to cac ratio calculator',
    'cost to acquire a customer',
  ],
  title: 'CAC Calculator – Customer Acquisition Cost and LTV:CAC',
  description:
    'Work out your customer acquisition cost from your sales and marketing spend and new customers. Add customer lifetime value to see your LTV:CAC ratio.',
  h1: 'CAC Calculator',
  subtitle: 'Work out what each new customer costs you, and whether they bring back more than that over time.',
  risk: 'green',
  relatedTools: ['cost-per-lead-calculator', 'roas-calculator', 'break-even-calculator'],
  // Keyword-map questions first (exact, same order), then 2 more.
  faq: [
    {
      q: 'How do you calculate customer acquisition cost?',
      a: 'Add up everything you spent on sales and marketing in a period, then divide it by the new customers you won in that same period. If you spent $8,000 on marketing and $4,000 on sales in a month and won 60 new customers, your customer acquisition cost is $12,000 ÷ 60 = $200. Use the same period for spend and customers so the two match.',
    },
    {
      q: 'What should be included in CAC?',
      a: 'Include every cost of winning new customers: ad spend, marketing tools, content, agency or freelancer fees, and the sales side, such as sales salaries, commissions and software. Leave out costs of serving customers you already have, like support or delivery. If you are unsure, run the calculator twice, once with marketing only and once with sales added, and compare the two results.',
    },
    {
      q: 'What is a good LTV to CAC ratio?',
      a: 'A ratio of 3 : 1 is a common rule of thumb, meaning a customer brings back three times what it cost to win them. It is not a rule. The right target depends on your margins, how fast customers pay you back and how much cash you have. The calculator starts the target at 3 so you can change it to one that suits your business.',
    },
    {
      q: 'How can I lower my CAC?',
      a: 'Spend more on the channels that bring customers cheaply and less on the ones that do not. Improve how many leads become customers, because a better sales process lowers CAC without cutting spend. Referrals, content and repeat visitors often cost less than paid ads. Use Compare two plans to see what a smaller budget or more customers would do to your number.',
    },
    {
      q: 'What is the difference between CAC and cost per lead?',
      a: 'Cost per lead is what you pay for each enquiry or sign-up. CAC is what you pay for each paying customer, and it usually includes sales costs too. Because only some leads buy, CAC is always higher than cost per lead for the same spend. If 10 leads cost $250 and one becomes a customer, the cost per lead is $25 but that customer cost $250.',
    },
    {
      q: 'Which period should I use?',
      a: 'Use a period long enough to smooth out quiet and busy weeks, such as a month or a quarter. If customers usually take a while to decide, spend in one month may win customers in the next, so a quarter often gives a fairer number. Whatever you choose, use the same period for spend and new customers, and keep it the same when you compare.',
    },
    {
      q: 'Should I include salaries in CAC?',
      a: 'Include the share of salaries spent on winning new customers, such as a salesperson or a marketer, because that time is part of the cost. If someone splits their time between new and existing customers, include only the new-customer share. The calculator has a separate optional sales spend box, so you can see CAC with and without those costs and decide which one to track.',
    },
  ],
};
