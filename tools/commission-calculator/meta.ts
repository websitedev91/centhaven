import type { ToolMeta } from '@/lib/tool-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /salary/commission-calculator.
 * Change the keyword map first, then this file and content.mdx (CLAUDE.md SEO rules).
 * Tiers are marginal only (Puru, 2026-11-18); the other method is explained in an FAQ, no maths.
 */
export const meta: ToolMeta = {
  slug: 'commission-calculator',
  category: 'salary',
  primaryKeyword: 'commission calculator',
  secondaryKeywords: ['sales commission calculator', 'tiered commission calculator', 'commission rate calculator', 'how to calculate commission'],
  title: 'Commission Calculator – Flat and Tiered Sales Commission',
  description:
    'Calculate sales commission at a flat rate or with tiered rates you set. Add base pay to see your total earnings and the effective commission rate on sales.',
  h1: 'Commission Calculator',
  subtitle: 'Work out your commission at a flat rate or with tiered rates you set, plus your total earnings with base pay.',
  risk: 'green',
  relatedTools: ['pay-raise-calculator', 'hourly-to-salary-calculator', 'break-even-calculator'],
  // Keyword-map questions first (exact, same order), then 2 more (the second explains the other tier method, no maths).
  faq: [
    {
      q: 'How do I calculate commission?',
      a: 'For a flat rate, multiply your sales by your commission rate. Sales of $50,000 at 5% earn $2,500 in commission. If you also get base pay, add it to the commission to see your total earnings for the period. For tiered plans, each rate applies to a slice of your sales, and the calculator adds the slices together for you.',
    },
    {
      q: 'How does tiered commission work?',
      a: 'A tiered plan pays different rates on different slices of your sales. In this calculator, each rate applies only to the sales inside its tier. With 3% up to $20,000, 5% from $20,000 to $50,000 and 8% above that, sales of $60,000 earn $600, $1,500 and $800, so $2,900 in total. Higher tiers reward bigger months without changing earlier slices.',
    },
    {
      q: 'What is an effective commission rate?',
      a: 'It is your total commission divided by your total sales, shown as a percentage. On a tiered plan it tells you what you really earned on every sale. In the example above, $2,900 of commission on $60,000 of sales is an effective rate of about 4.83%. It is the easiest way to compare a tiered plan with a simple flat rate.',
    },
    {
      q: 'How do base pay and commission work together?',
      a: 'Base pay is a fixed amount you receive whatever you sell, and commission is added on top of it for the same period. The calculator adds the two to show your total earnings. A higher base pay usually comes with a lower commission rate, so try both parts of an offer here to see which one pays more at your usual sales level.',
    },
    {
      q: 'How can I compare two commission plans?',
      a: 'Enter your current plan in the calculator, then open "Compare two commission plans" and enter a flat rate to compare it with. The calculator shows the commission, total earnings and effective rate for both on the same sales. Try a quiet month and a busy month too, because a plan that pays more on big months can pay less on small ones.',
    },
    {
      q: 'What if my plan pays one rate on all my sales?',
      a: 'Some plans work differently from the tiers in this calculator. Once you reach a tier, they pay that tier’s rate on all of your sales, not only on the sales inside the tier. This calculator does not work out that method. If your plan works this way, check its exact rules with your employer, and use the flat-rate mode with the rate you reached.',
    },
    {
      q: 'Which sales count toward my commission?',
      a: 'That depends on your plan, so check its rules. Some plans count every sale when it is made, while others only count sales once the customer has paid, or take off refunds and returns. Enter the sales figure your plan actually uses for the period. If you are not sure, ask for the rules in writing so you can check your pay each month.',
    },
  ],
};
