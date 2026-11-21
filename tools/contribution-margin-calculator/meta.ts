import type { ToolMeta } from '@/lib/tool-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /business/contribution-margin-calculator.
 * Change the keyword map first, then this file and content.mdx (CLAUDE.md SEO rules).
 * Never say what margin is "good" or quote industry margins.
 */
export const meta: ToolMeta = {
  slug: 'contribution-margin-calculator',
  category: 'business',
  primaryKeyword: 'contribution margin calculator',
  secondaryKeywords: [
    'contribution margin ratio calculator',
    'how to calculate contribution margin',
    'contribution margin per unit',
    'unit contribution margin calculator',
  ],
  title: 'Contribution Margin Calculator – Per Unit, Ratio and Total',
  description:
    'Work out contribution margin per unit, the contribution margin ratio and the total from your price, variable cost and units sold. Add fixed costs to break even.',
  h1: 'Contribution Margin Calculator',
  subtitle: 'See what each sale adds after its variable costs: the margin per unit, the ratio, the total and your break-even point.',
  risk: 'green',
  relatedTools: ['break-even-calculator', 'margin-vs-markup-calculator', 'food-cost-calculator'],
  // Keyword-map questions first (exact, same order), then 2 more.
  faq: [
    {
      q: 'How do you calculate contribution margin?',
      a: 'Take the price of one unit and subtract the variable cost of making or delivering it. If you sell something for $50 and each one costs $30 in materials and fees, the contribution margin is $20 per unit. Multiply by the units sold for the total: 1,000 units give $20,000. That money is what is left to cover fixed costs and, after that, profit.',
    },
    {
      q: 'What is the contribution margin ratio?',
      a: 'It is the contribution margin per unit divided by the price, shown as a percentage. With a $50 price and a $20 margin, the ratio is 20 ÷ 50 = 40%. It tells you how much of every sale goes towards fixed costs and profit, whatever the number of units. A ratio also lets you compare products with very different prices on the same basis.',
    },
    {
      q: 'What is the difference between contribution margin and gross margin?',
      a: 'Contribution margin takes off only the costs that rise with each unit sold, the variable costs. Gross margin takes off the cost of goods sold, which can include some fixed production costs, such as factory rent, depending on how the accounts are kept. Contribution margin is the one to use for break-even and pricing decisions, because it shows what one more sale really adds.',
    },
    {
      q: 'How does contribution margin help find break-even?',
      a: 'Divide your fixed costs by the contribution margin per unit. With $12,000 of fixed costs and a $20 margin, you need 12,000 ÷ 20 = 600 units to break even. When the answer is not whole, round up, because part of a sale doesn’t exist. Break-even revenue is fixed costs divided by the ratio: 12,000 ÷ 40% = $30,000. Enter fixed costs to see both.',
    },
    {
      q: 'Can contribution margin be negative?',
      a: 'Yes. If the variable cost of a unit is higher than its price, every sale loses money before fixed costs are even counted. Selling at $50 with a $55 variable cost gives a margin of −$5 per unit, so 1,000 sales lose $5,000. There is then no break-even point, because selling more only makes the loss bigger. The calculator shows the negative figures as they are.',
    },
    {
      q: 'What counts as a variable cost?',
      a: 'Anything that goes up when you sell one more unit: raw materials, packaging, shipping, card processing fees per sale, sales commission or contractor time per job. Costs that stay the same however much you sell, such as rent, software subscriptions and salaried staff, are fixed costs. Some costs are a mix; split them as best you can, and use the same rule each time you compare.',
    },
    {
      q: 'What is total contribution margin?',
      a: 'It is the contribution margin per unit multiplied by the number of units sold in a period. At $20 a unit and 1,000 units a month, the total is $20,000 a month. Take your fixed costs away from it to get profit: with $12,000 of fixed costs, that leaves $8,000. If the total is smaller than your fixed costs, the difference is a loss.',
    },
  ],
};
