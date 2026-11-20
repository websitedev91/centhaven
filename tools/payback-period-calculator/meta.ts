import type { ToolMeta } from '@/lib/tool-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /business/payback-period-calculator.
 * Change the keyword map first, then this file and content.mdx (CLAUDE.md SEO rules).
 * Simple payback only (no discounting); no "good payback" benchmark.
 */
export const meta: ToolMeta = {
  slug: 'payback-period-calculator',
  category: 'business',
  primaryKeyword: 'payback period calculator',
  secondaryKeywords: ['how to calculate payback period', 'payback period with uneven cash flows', 'investment payback calculator'],
  title: 'Payback Period Calculator – Years to Recover a Cost',
  description:
    'See how long an investment takes to pay for itself from its yearly cash flow, or enter up to 10 years of uneven cash flows for payback in years and months.',
  h1: 'Payback Period Calculator',
  subtitle: 'Find how many years and months it takes for an investment to earn back what it cost.',
  risk: 'green',
  relatedTools: ['break-even-calculator', 'straight-line-depreciation-calculator', 'runway-calculator'],
  // Keyword-map questions first (exact, same order), then 2 more.
  faq: [
    {
      q: 'How do you calculate the payback period?',
      a: 'When the cash flow is the same each year, divide the investment by the yearly cash flow. A $50,000 machine that saves $12,500 a year pays for itself in 50,000 ÷ 12,500 = 4 years. The cash flow is the extra money the investment brings in, or the cost it saves, each year. Use cash amounts, not accounting profit.',
    },
    {
      q: 'How do I work out payback with uneven cash flows?',
      a: 'Add up the cash flows year by year until the running total reaches the investment. Then work out how far into that year you got. For $40,000 with flows of $10,000, $12,000, $15,000 and $18,000, three years recover $37,000. The last $3,000 is 3,000 ÷ 18,000 of year four, so payback is 3.17 years.',
    },
    {
      q: 'What is a good payback period?',
      a: 'There is no single good number. It depends on your business, how much risk the investment carries and how long the thing you buy will last. A payback period that is longer than the useful life of an asset means it never really pays for itself. Compare the payback with your own plans and with other ways you could use the money.',
    },
    {
      q: 'What are the limits of the payback period?',
      a: 'Payback ignores everything after the investment has paid for itself, so a project that keeps earning for ten more years looks the same as one that stops. It also treats money in year five as worth the same as money today. That makes it a quick, simple check, best used alongside other measures rather than as the only reason to invest.',
    },
    {
      q: 'What is the difference between payback period and break-even?',
      a: 'Payback period measures time: how long one investment takes to earn back its cost. Break-even usually measures volume: how many sales a business needs to cover its costs in a period. They answer different questions. A new machine has a payback period, while a product line has a break-even point. The break-even calculator handles the sales question for you.',
    },
    {
      q: 'Should I count depreciation?',
      a: 'No. Payback uses cash, and depreciation is not cash leaving the business. It spreads the cost of an asset over its life in your accounts, but the money was spent when you bought it. Use the yearly cash the investment brings in or saves. The straight-line depreciation calculator shows the yearly figure for your accounts if you need it separately.',
    },
    {
      q: 'Does payback consider the time value of money?',
      a: 'No. Simple payback treats a dollar received in five years as worth the same as a dollar today, even though money now can be saved or used straight away. Some businesses use a discounted version that reduces later cash flows first. This calculator shows simple payback only, so the result is easy to check by hand with your own numbers.',
    },
  ],
};
