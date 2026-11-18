import type { ToolMeta } from '@/lib/tool-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /business/break-even-calculator.
 * Change the keyword map first, then this file and content.mdx (CLAUDE.md SEO rules).
 */
export const meta: ToolMeta = {
  slug: 'break-even-calculator',
  category: 'business',
  primaryKeyword: 'break even calculator',
  secondaryKeywords: [
    'break even point calculator',
    'how many sales to break even',
    'break even revenue calculator',
    'freelance break even calculator',
  ],
  title: 'Break-Even Calculator – Sales Needed to Cover Costs',
  description:
    'Find your break-even point in units and revenue from fixed costs, price and variable costs. Add a profit target and see the sales you need each month.',
  h1: 'Break-Even Calculator',
  subtitle: 'Find how many sales you need each month to cover your costs, the revenue that takes, and the sales needed to hit a profit target.',
  risk: 'green',
  relatedTools: ['utilization-rate-calculator', 'hourly-rate-calculator', 'straight-line-depreciation-calculator'],
  affiliateId: 'accounting-software',
  // Keyword-map questions first (exact, same order), then 2 more from the spec.
  faq: [
    {
      q: 'What is a break-even point?',
      a: 'It is the number of sales at which your income exactly covers your costs, so you make neither a profit nor a loss. Below it you lose money each month, and every sale above it adds profit. Knowing your break-even point tells you the minimum you must sell, and helps you judge whether a price, a new cost or a new product makes sense.',
    },
    {
      q: 'How do I calculate break-even?',
      a: 'First work out your contribution per sale: the price minus the variable cost of that sale. Then divide your fixed costs by that contribution. With fixed costs of 10,000, a price of 50 and a variable cost of 30, each sale contributes 20, so you need 10,000 ÷ 20 = 500 sales a month to break even. Round up to whole sales.',
    },
    {
      q: 'What are fixed and variable costs?',
      a: 'Fixed costs stay the same however much you sell, such as rent, software subscriptions, insurance and salaries. Variable costs rise with each sale, such as materials, payment fees, shipping or a contractor you pay per project. Some costs are a mix. For this calculator, put a cost under variable if it goes up when you make one more sale, and under fixed if it does not.',
    },
    {
      q: 'What is contribution margin?',
      a: 'Contribution margin is what each sale leaves over after its own variable cost, ready to pay your fixed costs and then make a profit. It can be shown as an amount, such as 20 per sale, or as a share of the price, such as 40%. The higher it is, the fewer sales you need to break even, which is why price and variable cost matter so much.',
    },
    {
      q: 'How can I lower my break-even point?',
      a: 'There are three levers. Raise your price, so each sale contributes more. Cut variable costs, such as cheaper suppliers, lower payment fees or less rework. Or cut fixed costs, such as unused software or expensive premises. Small changes add up: in the default example, raising the price from 50 to 55 lowers break-even from 500 to 400 sales a month.',
    },
    {
      q: 'Why does the calculator round up?',
      a: 'Because you cannot make part of a sale. If the exact answer is 50.42, then 50 sales still leave you slightly short, and you need the 51st sale to cover all your costs. The calculator shows the exact figure in small text so you can see how close you are, but the main result is always the whole number of sales you really need.',
    },
    {
      q: 'Break-even in units or in revenue?',
      a: 'Both describe the same point. Break-even in units tells you how many sales you need, which is useful for planning work or stock. Break-even revenue tells you how much money must come in, which is easier to compare with your accounts or bank statements. Revenue is simply the break-even units multiplied by the price, so use whichever helps you plan.',
    },
    {
      q: 'What is a margin of safety?',
      a: 'It is how far your sales could fall before you stop covering your costs, shown as a share of your current sales. If you break even at 500 sales and sell 600 today, your margin of safety is about 17%. A bigger margin gives you more room for a bad month. A negative margin means you are below break-even and losing money each month.',
    },
  ],
};
