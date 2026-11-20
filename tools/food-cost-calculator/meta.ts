import type { ToolMeta } from '@/lib/tool-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /business/food-cost-calculator.
 * Change the keyword map first, then this file and content.mdx (CLAUDE.md SEO rules).
 * Never state an "ideal", "typical" or "industry" food cost %. The target % is the user's own.
 */
export const meta: ToolMeta = {
  slug: 'food-cost-calculator',
  category: 'business',
  primaryKeyword: 'food cost calculator',
  secondaryKeywords: ['food cost percentage calculator', 'menu price calculator', 'how to calculate food cost percentage', 'plate cost calculator'],
  title: 'Food Cost Calculator – Food Cost % and Menu Price',
  description:
    'Work out the food cost percentage of a dish, set a menu price from your own target food cost %, or find your food cost % for a period from inventory and sales.',
  h1: 'Food Cost Calculator',
  subtitle: 'Find the food cost percentage of a dish, price a menu item from your own target, or check your food cost for a week or month.',
  risk: 'green',
  relatedTools: ['margin-vs-markup-calculator', 'break-even-calculator', 'payment-processing-fee-calculator'],
  // Keyword-map questions first (exact, same order), then 2 more.
  faq: [
    {
      q: 'How do you calculate food cost percentage?',
      a: 'Divide the cost of the ingredients in one portion by the menu price, then multiply by 100. A dish with $3.50 of ingredients that sells for $12.00 has a food cost of 3.50 ÷ 12.00 × 100 = 29.17%. Cost the ingredients at the prices you pay now, and use the menu price before any sales tax you add on top.',
    },
    {
      q: 'How do I price a menu item from food cost?',
      a: 'Divide the ingredient cost by your target food cost percentage as a decimal. With $4.00 of ingredients and a 32% target, the price is 4.00 ÷ 0.32 = $12.50. The target is your own choice, based on your other costs and your prices. Choose Menu price in the calculator, then round the result to a price that suits your menu.',
    },
    {
      q: 'How do I calculate food cost for a week or month?',
      a: 'Add your opening inventory to the food you bought in the period, then take away your closing inventory. That gives the cost of the food you used. Divide it by your food sales for the same period and multiply by 100. With $12,500 of food used and $40,000 of food sales, your food cost for the period is 31.25%.',
    },
    {
      q: 'What is a good food cost percentage?',
      a: 'There is no single good number. It depends on your menu, your prices, your labour and rent, and the kind of place you run. A higher food cost can work when other costs are low, and the other way round. Set your own target from your numbers, then use the calculator to check each dish and each period against it.',
    },
    {
      q: 'What is the difference between food cost and margin?',
      a: 'Food cost percentage is the share of the menu price spent on ingredients. Gross margin on the dish is the share left over after ingredients. They always add up to 100%, so a 29.17% food cost means a 70.83% gross margin before labour and other costs. The margin vs markup calculator shows the same price as margin and markup.',
    },
    {
      q: 'Why does my period food cost differ from my recipe costs?',
      a: 'Recipe costs assume every portion is made exactly to the recipe and sold. The period figure counts all food that left your stock, including waste, spoilage, staff meals, free items and portions that were a little too big. A gap between the two shows where food is going. Checking both each month helps you spot where to look.',
    },
    {
      q: 'Should I include drinks?',
      a: 'Track food and drinks separately if you can. Drinks often have a very different cost share from food, so mixing them into one number makes it hard to see what is changing. Use the same calculator for each: enter drink stock and drink sales for a drinks figure, and food stock and food sales for a food figure.',
    },
  ],
};
