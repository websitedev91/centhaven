import type { ToolMeta } from '@/lib/tool-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /business/margin-vs-markup-calculator.
 * Change the keyword map first, then this file and content.mdx (CLAUDE.md SEO rules).
 * Pure maths: no typical margins by industry.
 */
export const meta: ToolMeta = {
  slug: 'margin-vs-markup-calculator',
  category: 'business',
  primaryKeyword: 'margin vs markup calculator',
  secondaryKeywords: ['markup to margin calculator', 'margin to markup calculator', 'markup calculator', 'selling price from margin'],
  title: 'Margin vs Markup Calculator – Convert and Find a Price',
  description:
    'Convert profit margin to markup and back, or enter your cost and a margin or markup to find the selling price. See the profit on every sale in one place.',
  h1: 'Margin vs Markup Calculator',
  subtitle: 'See your margin and markup side by side, find a selling price from either one, or convert between them.',
  risk: 'green',
  relatedTools: ['payment-processing-fee-calculator', 'break-even-calculator', 'roas-calculator'],
  // Keyword-map questions first (exact, same order), then 2 more.
  faq: [
    {
      q: 'What is the difference between margin and markup?',
      a: 'Both describe the same profit, measured against different numbers. Margin is profit as a share of the selling price. Markup is profit as a share of the cost. An item that costs $60 and sells for $100 makes $40 profit: that is a 40% margin, because 40 is 40% of 100, and a 66.67% markup, because 40 is 66.67% of 60.',
    },
    {
      q: 'How do I convert markup to margin?',
      a: 'Divide the markup by one plus the markup, using decimals. A 25% markup is 0.25, so the margin is 0.25 ÷ 1.25 = 0.20, or 20%. A 50% markup becomes 0.5 ÷ 1.5, which is a 33.33% margin. Margin is always the smaller of the two numbers whenever there is a profit, because the price is bigger than the cost.',
    },
    {
      q: 'How do I convert margin to markup?',
      a: 'Divide the margin by one minus the margin, using decimals. A 25% margin is 0.25, so the markup is 0.25 ÷ 0.75 = 0.3333, or 33.33%. A 50% margin needs a 100% markup, which means doubling the cost. Choose Convert % in the calculator and enter either number to see the matching one straight away.',
    },
    {
      q: 'How do I set a price from a margin?',
      a: 'Divide your cost by one minus the margin you want. For an item that costs ₹800 and a 20% margin, the price is 800 ÷ 0.80 = ₹1,000, leaving ₹200 of profit. Adding 20% to the cost would only give ₹960, which is a 16.67% margin, so pricing from a margin needs this division rather than a simple add-on.',
    },
    {
      q: 'Why can margin never be 100% or more?',
      a: 'Margin is profit divided by the price, and profit is the price minus the cost. Profit can only equal the whole price if the cost is zero. Any real cost keeps the margin below 100%, and pricing for a 100% margin would need an infinitely high price. Markup has no such limit: a 300% markup simply means a price four times the cost.',
    },
    {
      q: 'Which should I use for pricing?',
      a: 'Use whichever one your team and your reports already use, and say which it is. Markup is handy when you start from a cost and add to it. Margin is handy when you look at profit as a share of sales, as most accounts do. Problems start when one person means margin and another means markup, so a 40% target can mean very different prices.',
    },
    {
      q: 'Do payment fees change my margin?',
      a: 'Yes. Card and payment fees come out of the price your customer pays, so they reduce the profit you keep on each sale. If you include them in your cost, your real margin is lower than the one worked out from the product cost alone. The payment processing fee calculator shows what a sale costs you in fees, using the rates you enter.',
    },
  ],
};
