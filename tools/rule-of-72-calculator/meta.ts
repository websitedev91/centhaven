import type { ToolMeta } from '@/lib/tool-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /personal-finance/rule-of-72-calculator.
 * Change the keyword map first, then this file and content.mdx (CLAUDE.md SEO rules).
 * The rate is always the user's own: never suggest, rank or quote a typical rate.
 */
export const meta: ToolMeta = {
  slug: 'rule-of-72-calculator',
  category: 'personal-finance',
  primaryKeyword: 'rule of 72 calculator',
  secondaryKeywords: ['doubling time calculator', 'how long to double my money', 'rule of 72 formula', 'years to double calculator'],
  title: 'Rule of 72 Calculator – Years to Double Your Money',
  description:
    'Use the rule of 72 to see how many years it takes to double money at your own rate, or the rate needed to double it in a set time, with the exact answer.',
  h1: 'Rule of 72 Calculator',
  subtitle: 'See how many years it takes to double at your own rate, or the rate needed to double in a set time, with the exact answer beside it.',
  risk: 'green',
  relatedTools: ['savings-goal-calculator', 'debt-snowball-calculator', 'emergency-fund-calculator'],
  // Keyword-map questions first (exact, same order), then 2 more.
  faq: [
    {
      q: 'What is the rule of 72?',
      a: 'The rule of 72 is a quick way to estimate how long it takes for something to double when it grows at a steady yearly rate. Divide 72 by the rate. If your rate is 8% a year, 72 ÷ 8 = 9 years. The exact answer for yearly growth is 9.01 years, so the shortcut is very close. It works for any amount, because doubling depends only on the rate.',
    },
    {
      q: 'How do you use the rule of 72?',
      a: 'To find the years to double, divide 72 by your yearly rate as a plain number: at 6%, 72 ÷ 6 = 12 years. To find the rate you need, divide 72 by the number of years: to double in 10 years, you need 72 ÷ 10 = 7.2% a year. The calculator does both, and shows the exact answer next to the shortcut so you can see how close it is.',
    },
    {
      q: 'How accurate is the rule of 72?',
      a: 'It is close for rates between about 6% and 10% and drifts further away outside that range. At 8%, the rule says 9 years and the exact answer is 9.01 years. At 1%, the rule says 72 years but the exact answer is 69.66 years. At 100%, the rule says 0.72 years, while the exact answer is 1 year. The calculator always shows both numbers.',
    },
    {
      q: 'How do I find the rate needed to double my money?',
      a: 'Divide 72 by the number of years you have. To double in 6 years, the rule of 72 says you need 72 ÷ 6 = 12% a year. The exact rate for yearly growth is 12.25%. Choose Rate needed in the calculator and enter your years to see both. The calculator never suggests whether a rate is realistic; that depends on where your money is.',
    },
    {
      q: 'Does the rule of 72 work for debt and inflation?',
      a: 'The maths is the same for anything that grows at a steady yearly rate. If a debt grows at your own rate of 18% a year with nothing paid, 72 ÷ 18 says it doubles in about 4 years. If prices rise at a steady rate you choose, the same sum shows how long until they double. Enter your own rate; the calculator never assumes one for you.',
    },
    {
      q: 'Why 72 and not 70?',
      a: 'The exact doubling maths uses 69.3 for growth that is added continuously. 72 is used because it is close and divides evenly by many numbers: 2, 3, 4, 6, 8, 9 and 12. That makes mental maths easy. For growth added once a year at everyday rates, 72 also tends to land nearer the exact answer than 70 or 69 do. The calculator shows the exact figure anyway.',
    },
    {
      q: 'Does the amount I start with matter?',
      a: 'No. Doubling time depends only on the rate. $1,000 and $100,000 both double in the same number of years at the same rate; only the size of the doubled amount is different. That is why the calculator has no amount box and no currency. If you want to plan towards a set amount by a certain date, the savings goal calculator is the better tool.',
    },
  ],
};
