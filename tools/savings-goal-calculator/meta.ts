import type { ToolMeta } from '@/lib/tool-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /personal-finance/savings-goal-calculator.
 * Change the keyword map first, then this file and content.mdx (CLAUDE.md SEO rules).
 * Interest is optional and the user's own; never suggest a rate.
 */
export const meta: ToolMeta = {
  slug: 'savings-goal-calculator',
  category: 'personal-finance',
  primaryKeyword: 'savings goal calculator',
  secondaryKeywords: ['how much to save per month', 'monthly savings calculator', 'savings plan calculator'],
  title: 'Savings Goal Calculator – How Much to Save Each Month',
  description:
    'Find out how much to save each month to reach your savings goal by the date you choose. Add what you have already saved and an optional interest rate.',
  h1: 'Savings Goal Calculator',
  subtitle: 'See how much to save each month to reach your goal in the time you choose, after what you have already saved.',
  risk: 'green',
  relatedTools: ['emergency-fund-calculator', 'pay-raise-calculator', 'hourly-to-salary-calculator'],
  // Keyword-map questions first (exact, same order), then 2 more.
  faq: [
    {
      q: 'How much should I save each month?',
      a: 'Take what you still need, after the money you already have, and divide it by the number of months until your deadline. To save $10,000 in 24 months from nothing, that is $416.67 a month. If your savings earn interest, you need a little less each month. Enter your own goal, deadline and savings, and the calculator shows the exact monthly amount.',
    },
    {
      q: 'How do I set a savings goal?',
      a: 'Decide what you are saving for, find out roughly what it costs, and pick a date you would like to reach it. A clear amount and a deadline turn a vague wish into a monthly number you can plan around. If the monthly amount feels too high, move the deadline or lower the goal until it fits your budget, then review it every few months.',
    },
    {
      q: 'Does interest make a big difference?',
      a: 'It depends on the rate, the amount and how long you save. Over a few months interest changes little, but over several years it can cover a noticeable part of your goal. Saving $10,000 over 24 months at 4% a year needs $400.92 a month instead of $416.67. Enter your own account’s rate to see the difference it makes for you.',
    },
    {
      q: 'Should I build an emergency fund first?',
      a: 'Many people do, because an emergency fund stops an unexpected bill from wiping out the savings for your goal. If you do not have one yet, consider building it before, or alongside, your other goals. The emergency fund calculator helps you work out how much you might want to keep aside and how long it would take to save it.',
    },
    {
      q: "What if I can't afford the monthly amount?",
      a: 'Try a longer deadline first. Use "Compare two timelines" to see how much the monthly amount drops if you give yourself more months. You can also lower the goal, start with a smaller amount and raise it later, or put any pay rise or bonus towards the goal. Even a smaller regular amount gets you closer than waiting for a perfect moment.',
    },
    {
      q: 'How is the monthly amount worked out with interest?',
      a: 'The calculator assumes you save the same amount at the end of each month and that interest is added monthly at your yearly rate divided by 12. It first works out what your current savings will grow to, then finds the monthly amount that fills the rest of the gap by your deadline. Without interest, it simply divides the gap by the months.',
    },
    {
      q: 'Can I use this for a house deposit or a holiday?',
      a: 'Yes. It works for any goal with a target amount and a deadline, such as a house deposit, a holiday, a car, a wedding or a new laptop. Enter the amount you need, what you have already saved and the months you have. For several goals at once, work out each one separately and add the monthly amounts together.',
    },
  ],
};
