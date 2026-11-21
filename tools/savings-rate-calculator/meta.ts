import type { ToolMeta } from '@/lib/tool-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /personal-finance/savings-rate-calculator.
 * Change the keyword map first, then this file and content.mdx (CLAUDE.md SEO rules).
 * No tax maths. Never say what % anyone should save; no average rates.
 */
export const meta: ToolMeta = {
  slug: 'savings-rate-calculator',
  category: 'personal-finance',
  primaryKeyword: 'savings rate calculator',
  secondaryKeywords: ['savings percentage calculator', 'personal savings rate calculator', 'how much of my income do i save', 'percent of income saved'],
  title: 'Savings Rate Calculator – What Share of Income You Save',
  description:
    'Work out your savings rate: the share of your take-home or gross income you save each month. Add your own target percent to see the monthly amount it means.',
  h1: 'Savings Rate Calculator',
  subtitle: 'See what share of your take-home or gross income you save each month, and what your own target would mean.',
  risk: 'green',
  relatedTools: ['50-30-20-budget-calculator', 'savings-goal-calculator', 'emergency-fund-calculator'],
  // Keyword-map questions first (exact, same order), then 2 more.
  faq: [
    {
      q: 'How do I calculate my savings rate?',
      a: 'Divide what you save each month by your monthly income, then multiply by 100. If you take home $4,000 a month and save $600, your savings rate is 600 ÷ 4,000 × 100 = 15%. Use the same period for both numbers. Monthly is easiest, but a year works just as well, as long as savings and income cover the same months.',
    },
    {
      q: 'Should I use take-home or gross income?',
      a: 'Either works, as long as you stay consistent when you compare. Take-home pay shows the share of the money you can actually spend or save. Gross income, before tax, is easier to compare between jobs or years when tax changes. The same savings give a lower rate against gross income, because the income is bigger. The calculator lets you choose, and we never work out tax.',
    },
    {
      q: 'How much of my income am I saving?',
      a: 'Enter your monthly income and everything you put aside in a month: money into savings accounts, investments and, if you count them, extra payments on debt. The calculator shows the share as a percentage, plus what you save in a year and what is left. Saving $450 from £3,000 take-home pay, for example, is 15%, or £5,400 a year.',
    },
    {
      q: 'How much do I need to save to reach my target rate?',
      a: 'Multiply your income by your target percentage and divide by 100. With $4,000 a month and a 20% target of your own, you would save $800 a month. If you save $600 now, that is $200 more a month. Enter your target in the optional box and the calculator shows both the amount and the gap from what you save today.',
    },
    {
      q: 'What is a good savings rate?',
      a: 'There is no single good number. It depends on your income, your costs, your goals and how soon you need the money, so a rate that suits one person may not suit another. The calculator shows your own rate from your own numbers; it does not judge it. Tracking your rate month by month is often more useful than comparing it with anyone else’s.',
    },
    {
      q: 'Should I count paying off debt as saving?',
      a: 'That is your choice. Some people count extra payments on a loan or credit card as saving, because they improve what they own minus what they owe. Others count only money set aside. Whichever you pick, use it every time, so your rate from one month is comparable with the next. The calculator simply uses the savings figure you enter.',
    },
    {
      q: 'Why does my rate change between take-home and gross?',
      a: 'Because the income in the sum changes while your savings stay the same. Saving $600 from $4,000 take-home pay is 15%. If your gross income is $5,250, the same $600 is 7.62% of it. Neither number is wrong; they answer slightly different questions. Pick the one that fits what you want to track, and compare like with like.',
    },
  ],
};
