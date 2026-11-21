import type { ToolMeta } from '@/lib/tool-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /personal-finance/unit-price-calculator.
 * Change the keyword map first, then this file and content.mdx (CLAUDE.md SEO rules).
 * Rows are "Item 1–4", no names. Never name stores or brands or quote typical prices.
 */
export const meta: ToolMeta = {
  slug: 'unit-price-calculator',
  category: 'personal-finance',
  primaryKeyword: 'unit price calculator',
  secondaryKeywords: ['price per unit calculator', 'price per ounce calculator', 'price per kg calculator', 'which is cheaper calculator'],
  title: 'Unit Price Calculator – Compare Price per Ounce or Kg',
  description:
    'Compare up to 4 items by price per unit, in g, kg, oz, lb, ml, l, fl oz or count. See which is cheapest per unit and how much more each of the others costs.',
  h1: 'Unit Price Calculator',
  subtitle: 'Compare up to 4 items by price per unit, even in different sizes and units, and see which is cheapest.',
  risk: 'green',
  relatedTools: ['50-30-20-budget-calculator', 'savings-rate-calculator', 'savings-goal-calculator'],
  // Keyword-map questions first (exact, same order), then 2 more.
  faq: [
    {
      q: 'How do you calculate unit price?',
      a: 'Divide the price by the quantity. A 16 oz pack for $4.99 costs 4.99 ÷ 16 = $0.31 per ounce. A 32 oz pack for $7.49 costs $0.23 per ounce, so the bigger pack is cheaper per unit. When the sizes use different units, convert them to the same one first. The calculator does the conversion for you and shows every item per the same unit.',
    },
    {
      q: 'How do I compare prices with different units?',
      a: 'Convert everything to one unit, then divide. A pound is 453.59 grams and a kilogram is 1,000 grams, so $3.00 for 1 lb works out at $6.61 per kg, while $6.00 for 1 kg is $6.00 per kg. Enter each item in the unit on its label and the calculator converts them. You can only compare like with like: weights with weights, volumes with volumes.',
    },
    {
      q: 'Is the bigger pack always cheaper?',
      a: 'No. Bigger packs are often cheaper per unit, but not always, especially when the smaller one is on offer. In one example, 1.5 litres for $1.80 costs $1.20 per litre, while a 330 ml can for $0.65 costs $1.97 per litre, so the can costs 64% more. Checking the unit price is the only way to know which is cheaper for you.',
    },
    {
      q: 'How do I work out price per ounce?',
      a: 'Divide the price by the number of ounces. A 16 oz jar for $4.99 is 4.99 ÷ 16 = about $0.31 per ounce. If the size is in pounds, multiply by 16 first, because a pound is 16 ounces. For drinks, check whether the label means US or UK fluid ounces: a US fl oz is 29.57 ml and a UK fl oz is 28.41 ml.',
    },
    {
      q: 'How do I work out price per kg?',
      a: 'Divide the price by the weight in kilograms. A 500 g pack for £2.50 is 2.50 ÷ 0.5 = £5.00 per kg. For small packs, price per 100 g is often easier to read: the same pack is £0.50 per 100 g. Choose per kg or per 100 g under Show price in the calculator, and every item is shown in the same way.',
    },
    {
      q: 'How do I compare multipacks?',
      a: 'Multiply to get the total size, then compare. A pack of 6 cans of 330 ml holds 6 × 330 = 1,980 ml. Enter 1,980 ml as the size and the full pack price. For things you count, such as eggs or rolls, choose items as the unit and enter how many are in the pack. The calculator then shows the price per item or per litre.',
    },
    {
      q: 'Why does every item need the same kind of unit?',
      a: 'Because a weight and a volume can’t be compared directly. A gram of rice and a millilitre of oil measure different things, and turning one into the other would need the density of the food, which we don’t guess. The calculator uses Item 1’s kind of unit, weight, volume or count, and asks you to use the same kind for the others.',
    },
  ],
};
