import type { ToolMeta } from '@/lib/tool-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /personal-finance/debt-snowball-calculator.
 * Change the keyword map first, then this file and content.mdx (CLAUDE.md SEO rules).
 * Interest rates come from the user; never suggest typical rates or call one method best.
 */
export const meta: ToolMeta = {
  slug: 'debt-snowball-calculator',
  category: 'personal-finance',
  primaryKeyword: 'debt snowball calculator',
  secondaryKeywords: ['debt avalanche calculator', 'snowball vs avalanche calculator', 'debt payoff calculator', 'how long to pay off debt'],
  title: 'Debt Snowball Calculator – Snowball vs Avalanche Payoff',
  description:
    'Compare the debt snowball and debt avalanche methods for up to five debts. See your debt-free date, total interest and the order each debt gets paid off.',
  h1: 'Debt Snowball Calculator',
  subtitle: 'Pay off up to five debts two ways, side by side, and see how long each takes and what it costs in interest.',
  risk: 'green',
  relatedTools: ['savings-goal-calculator', 'emergency-fund-calculator', 'pay-raise-calculator'],
  // Keyword-map questions first (exact, same order), then 2 more.
  faq: [
    {
      q: 'How does the debt snowball method work?',
      a: 'You pay the minimum on every debt, then put any extra money towards the debt with the smallest balance. When that one is cleared, its minimum and your extra roll over to the next smallest, so the payment grows like a snowball. Many people like it because small debts disappear quickly, which can make it easier to keep going.',
    },
    {
      q: 'What is the debt avalanche method?',
      a: 'With the avalanche method you still pay every minimum, but the extra money goes to the debt with the highest interest rate first. When that debt is gone, its payment moves to the next highest rate. Because the dearest debt shrinks first, the avalanche usually costs less interest in total, although the first debt may take longer to clear.',
    },
    {
      q: 'Which saves more, snowball or avalanche?',
      a: 'With the same monthly payment, the avalanche saves the same or more interest, because it attacks the highest rate first. How much more depends on your balances and rates. In the example here the avalanche saves $403.43 over 31 months. When your smallest debt also has the highest rate, both methods follow the same order and give exactly the same result.',
    },
    {
      q: 'How much extra should I pay each month?',
      a: 'Whatever you can keep up every month without missing other bills. Even a small extra amount shortens the time to debt-free, because it rolls over as each debt clears. Try a few amounts in the calculator to see how the months and the interest change. It can also help to keep a small emergency fund so a surprise cost does not mean new debt.',
    },
    {
      q: 'What if my payment does not cover the interest?',
      a: 'If your total monthly payment is no more than the interest added in the first month, the balance never goes down, and the calculator says so instead of showing a date. Add to the extra payment until the result appears. If a single debt’s minimum is below its own interest, the calculator warns you, and that debt is cleared once others free up money.',
    },
    {
      q: 'Should I pay off debt or save first?',
      a: 'Many people keep a small emergency fund first, so a car repair or a lost week of work does not push them back into debt, and then put extra money towards their debts. The right split depends on your situation and your rates. The emergency fund calculator helps you set a savings target from your own monthly costs.',
    },
    {
      q: 'Does the order matter if I pay the same total?',
      a: 'Yes, because interest is added to each balance every month. Paying the high-rate debt down first means less interest builds up, so more of each payment goes to the balance. Paying the small debt first costs a little more interest but clears whole debts sooner. The calculator shows both orders with the same monthly payment, so you can see the difference.',
    },
  ],
};
