import type { ToolMeta } from '@/lib/tool-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /personal-finance/wedding-budget-calculator.
 * Change the keyword map first, then this file and content.mdx (CLAUDE.md SEO rules).
 * The split is an example only. Never state an average or typical wedding cost.
 */
export const meta: ToolMeta = {
  slug: 'wedding-budget-calculator',
  category: 'personal-finance',
  primaryKeyword: 'wedding budget calculator',
  secondaryKeywords: ['wedding budget breakdown', 'wedding cost per guest calculator', 'how to split a wedding budget', 'wedding budget planner'],
  title: 'Wedding Budget Calculator – Split Your Budget by Category',
  description:
    'Split your wedding budget across venue, catering, photos, attire and more with an example split you can change, and see the cost per guest for your guest list.',
  h1: 'Wedding Budget Calculator',
  subtitle: 'Split your own wedding budget across 8 categories with percentages you set, and see the cost per guest.',
  risk: 'green',
  relatedTools: ['savings-goal-calculator', '50-30-20-budget-calculator', 'emergency-fund-calculator'],
  // Keyword-map questions first (exact, same order), then 2 more.
  faq: [
    {
      q: 'How do I split a wedding budget?',
      a: 'Start with your total, then give each part of the day a percentage that reflects what matters most to you. The calculator starts with an example split across eight categories, such as venue and catering, photography and attire. Change any percentage to fit your plans, keeping the total at 100%, and it shows the amount for each category in your currency, adding up exactly to your budget.',
    },
    {
      q: 'How do I work out wedding cost per guest?',
      a: 'Divide your total budget by the number of guests. A budget of $25,000 for 100 guests is $250 per guest. The calculator also shows the venue and catering share per guest, because that part usually grows with the guest list: with 45% of $25,000 on venue and catering, that is $112.50 per guest. Use Compare two guest counts to see how a longer list changes both.',
    },
    {
      q: 'Can I change the example split?',
      a: 'Yes, and you should make it yours. The starting percentages are only an example to get you going, not an average or a recommendation. Type your own percentage into any category, set the ones you don’t need to 0%, and move the rest into what matters to you. The only rule is that all eight percentages must add up to exactly 100%.',
    },
    {
      q: "What if my percentages don't add up to 100?",
      a: 'The calculator tells you the total, for example "Your percentages add up to 105%", and waits until it is exactly 100% before showing the split. Lower one category or raise another until the total is right. If you get lost, the Reset to the example split button puts all eight percentages back to the starting example, and you can change them again from there.',
    },
    {
      q: 'How do I set a wedding budget?',
      a: 'Start from what you can pay without borrowing: money you already have saved, what you can put aside each month until the date, and any gifts you know are coming. The savings goal calculator shows how much to save each month to reach a total by a date. Then enter that total here and split it across the parts of the day that matter most to you.',
    },
    {
      q: 'What should go in Other & buffer?',
      a: 'Anything that doesn’t fit the other categories, plus money kept back for surprises. That might include transport, favours, a wedding cake, fees, tips or alterations. Keeping part of the budget unassigned means a small overspend in one place doesn’t push the whole day over budget. How big a buffer to keep is your choice, so set the percentage that feels right.',
    },
    {
      q: 'Can I set a category to 0%?',
      a: 'Yes. If you are not paying for something, perhaps because a family member is giving the rings or a friend is taking the photos, set that category to 0% and give the percentage to another one. The category then shows $0.00. The total still has to be 100%, so the percentages you remove need to go somewhere else in the split.',
    },
  ],
};
