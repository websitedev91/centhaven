import type { ToolMeta } from '@/lib/tool-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /marketing/roas-calculator.
 * Change the keyword map first, then this file and content.mdx (CLAUDE.md SEO rules).
 * Pure maths: "good ROAS" is answered with the user's own break-even ROAS, never an industry number.
 */
export const meta: ToolMeta = {
  slug: 'roas-calculator',
  category: 'marketing',
  primaryKeyword: 'roas calculator',
  secondaryKeywords: ['return on ad spend calculator', 'break even roas calculator', 'how to calculate roas', 'target roas calculator'],
  title: 'ROAS Calculator – Return on Ad Spend and Break-Even ROAS',
  description:
    'Calculate return on ad spend as a ratio and a percentage. Add your profit margin to find your break-even ROAS, or work out the revenue a target ROAS needs.',
  h1: 'ROAS Calculator',
  subtitle: 'See how much revenue each unit of ad spend brings back, and the ROAS your margin needs to break even.',
  risk: 'green',
  relatedTools: ['cac-calculator', 'cost-per-lead-calculator', 'break-even-calculator'],
  // Keyword-map questions first (exact, same order), then 2 more.
  faq: [
    {
      q: 'How do you calculate ROAS?',
      a: 'Divide the revenue that came from your ads by what you spent on them. If ads costing $3,000 brought in $15,000 of sales, your ROAS is 15,000 ÷ 3,000 = 5, written as 5x or 500%. That means every $1 of ad spend brought back $5 of revenue. Use revenue and spend from the same period and the same campaign or channel.',
    },
    {
      q: 'What is break-even ROAS?',
      a: 'Break-even ROAS is the return at which your ad spend uses up all the profit from the sales it brings in. It is 1 divided by your profit margin before ad costs. With a 40% margin, break-even ROAS is 1 ÷ 0.40 = 2.5x. Below that, each sale from the ads loses money. Above it, the ads add profit.',
    },
    {
      q: 'What is a good ROAS?',
      a: 'A good ROAS is one above your own break-even ROAS, because that is the point where ads start adding profit. It depends on your margin, so a number that works well for one business can lose money for another. Enter your profit margin and the calculator shows your break-even ROAS, so you can set a target that fits your prices and costs.',
    },
    {
      q: 'What is the difference between ROAS and ROI?',
      a: 'ROAS compares revenue with ad spend only. ROI compares profit with the whole cost of an investment. A campaign can have a high ROAS and still lose money if product, delivery and other costs eat most of the revenue. That is why this calculator adds profit after ad spend when you enter a margin: it gets you closer to the real return.',
    },
    {
      q: 'How much revenue do I need for my target ROAS?',
      a: 'Multiply your ad spend by your target ROAS. If you plan to spend $3,000 and want a ROAS of 4x, the ads need to bring in $12,000 of revenue. Choose Revenue needed in the calculator to work it out. Add your margin and it also warns you if the target is below your break-even ROAS, so you do not plan for a loss.',
    },
    {
      q: 'Should I use revenue or profit for ROAS?',
      a: 'ROAS is normally worked out from revenue, so results can be compared between campaigns and ad platforms. Profit is what matters in the end, though. The calculator keeps ROAS on revenue and then uses your margin to show break-even ROAS and profit after ad spend. That way you get the standard figure and a clear view of whether the ads make money.',
    },
    {
      q: 'Why is my ROAS high but I am not making money?',
      a: 'ROAS only looks at ad spend. If your margin is thin, even a ROAS that looks strong may sit below break-even. Costs outside the ads, such as staff, software, returns or discounts, also reduce what is left. Enter your margin to see profit after ad spend, and check your customer acquisition cost to include the other costs of winning customers.',
    },
  ],
};
