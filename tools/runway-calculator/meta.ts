import type { ToolMeta } from '@/lib/tool-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /business/runway-calculator.
 * Change the keyword map first, then this file and content.mdx (CLAUDE.md SEO rules).
 * Pure maths: no statistics on how many months of runway a business "needs".
 */
export const meta: ToolMeta = {
  slug: 'runway-calculator',
  category: 'business',
  primaryKeyword: 'runway calculator',
  secondaryKeywords: ['burn rate calculator', 'cash runway calculator', 'startup runway calculator', 'how long will my cash last'],
  title: 'Runway Calculator – Burn Rate and Months of Cash Left',
  description:
    'See how many months your cash will last at your current burn rate. Add monthly revenue for net burn, and find the spending cut that reaches your target.',
  h1: 'Runway Calculator',
  subtitle: 'See how many months your cash will last at your burn rate, and what it takes to reach the runway you want.',
  risk: 'green',
  relatedTools: ['break-even-calculator', 'emergency-fund-calculator', 'utilization-rate-calculator'],
  affiliateId: 'accounting-software',
  // Keyword-map questions first (exact, same order), then 2 more.
  faq: [
    {
      q: 'How do I calculate runway?',
      a: 'Divide the cash you have by your net burn, which is your monthly costs minus your monthly revenue. With $120,000 in the bank, $25,000 of costs and $10,000 of revenue each month, net burn is $15,000, so the cash lasts 8 months. If you have no revenue, divide the cash by your costs alone. The calculator does both.',
    },
    {
      q: 'What is burn rate?',
      a: 'Burn rate is how fast a business spends its cash, usually measured per month. Gross burn is everything you spend in a month. Net burn is what you lose after revenue comes in, so it is the number that shrinks your bank balance. Knowing both helps you see how long your cash lasts and how much difference new revenue makes.',
    },
    {
      q: 'What is the difference between gross and net burn?',
      a: 'Gross burn is your total monthly spending, with no revenue counted. Net burn is gross burn minus monthly revenue. If you spend $25,000 a month and earn $10,000, gross burn is $25,000 and net burn is $15,000. Net burn sets your real runway, while gross burn shows how long you would last if revenue stopped suddenly.',
    },
    {
      q: 'How can I extend my runway?',
      a: 'There are three levers: spend less, earn more, or add cash. Cutting monthly costs and growing revenue both lower your net burn, and every reduction stretches the cash further. Enter a target runway and the calculator shows the highest burn that reaches it and the cut you would need. Use "Compare two plans" to test different costs and revenue side by side.',
    },
    {
      q: 'What happens when revenue covers my costs?',
      a: 'If your monthly revenue is equal to or higher than your monthly costs, you are not burning cash, so your runway is not limited by spending. The calculator shows "Not burning" instead of a number of months. It still shows your gross burn, so you can see how long your cash would last if revenue dropped away for a while.',
    },
    {
      q: 'Is runway useful for freelancers and small businesses?',
      a: 'Yes. Any business with cash in the bank and regular costs has a runway, not only startups. A freelancer between projects, a shop in a quiet season or an agency waiting for a big invoice can all use it. Enter your business cash, your usual monthly costs and any revenue you expect, and you will see how many months you have.',
    },
    {
      q: 'Should I count money I am owed as cash?',
      a: 'It is safer not to. Runway is about cash you can actually spend, so count only money that is already in the bank. Unpaid invoices may arrive late or not at all. You can run a second plan that includes expected payments to see the difference, but plan your spending around the cash you already have, and treat the rest as a bonus.',
    },
  ],
};
