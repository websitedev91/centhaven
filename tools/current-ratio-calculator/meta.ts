import type { ToolMeta } from '@/lib/tool-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /business/current-ratio-calculator.
 * Change the keyword map first, then this file and content.mdx (CLAUDE.md SEO rules).
 * Never say what ratio is "good", "healthy" or "safe"; never quote a benchmark.
 */
export const meta: ToolMeta = {
  slug: 'current-ratio-calculator',
  category: 'business',
  primaryKeyword: 'current ratio calculator',
  secondaryKeywords: ['quick ratio calculator', 'acid test ratio calculator', 'how to calculate current ratio', 'working capital calculator'],
  title: 'Current Ratio Calculator – Quick Ratio and Working Capital',
  description:
    'Work out your current ratio, quick ratio and working capital from your own balance sheet: current assets, current liabilities, inventory and prepaid costs.',
  h1: 'Current Ratio Calculator',
  subtitle: 'Enter your current assets and current liabilities to see your current ratio, quick ratio and working capital.',
  risk: 'green',
  relatedTools: ['break-even-calculator', 'runway-calculator', 'margin-vs-markup-calculator'],
  // Keyword-map questions first (exact, same order), then 2 more.
  faq: [
    {
      q: 'How do you calculate the current ratio?',
      a: 'Divide your current assets by your current liabilities. Current assets are cash and anything you expect to turn into cash within a year. Current liabilities are the debts and bills due within a year. With $250,000 of current assets and $125,000 of current liabilities, the current ratio is 250,000 ÷ 125,000 = 2.00, so there are $2 of current assets for every $1 owed.',
    },
    {
      q: 'How do you calculate the quick ratio?',
      a: 'Take your current assets, subtract inventory and prepaid expenses, then divide by your current liabilities. Using $250,000 of current assets, $60,000 of inventory, $10,000 prepaid and $125,000 of liabilities, the quick assets are $180,000 and the quick ratio is 180,000 ÷ 125,000 = 1.44. It is also called the acid test ratio, and it leaves out what is slowest to turn into cash.',
    },
    {
      q: 'What is the difference between the current ratio and the quick ratio?',
      a: 'The current ratio counts every current asset, including stock on the shelves and costs paid in advance. The quick ratio leaves out inventory and prepaid expenses, because they can’t be used to pay a bill straight away. The gap between the two shows how much of your current assets is tied up in stock and prepayments. A business with little stock will see two close numbers.',
    },
    {
      q: 'What does a current ratio below 1 mean?',
      a: 'It means current liabilities are bigger than current assets. With $90,000 of current assets and $120,000 of current liabilities, the ratio is 0.75, and the debts due within a year are $30,000 more than the assets expected to turn into cash in that time. The calculator shows that gap as negative working capital. What it means for your business depends on your own cash flow and plans.',
    },
    {
      q: 'How do you calculate working capital?',
      a: 'Subtract current liabilities from current assets. With $250,000 of current assets and $125,000 of current liabilities, working capital is $125,000. It uses the same two numbers as the current ratio, but shows the gap as an amount of money instead of a ratio. A negative figure means current liabilities are larger than current assets. The calculator shows both side by side, in your currency.',
    },
    {
      q: 'What is a good current ratio?',
      a: 'There is no single good number. It depends on the business: how fast customers pay, how much stock you hold, how quickly suppliers want paying and how steady your cash flow is. A ratio that suits a shop may not suit a software company. The calculator shows your ratio from your own numbers; it does not judge it. Comparing your own ratio over several periods is often more useful.',
    },
    {
      q: 'Which numbers go into current assets?',
      a: 'Current assets are usually cash, money customers owe you (receivables), short-term investments, inventory and prepaid expenses: anything you expect to turn into cash or use up within a year. Your balance sheet lists them, often with a total. Use the figures from the same date for assets and liabilities, so the ratio compares like with like. The calculator uses only what you enter.',
    },
    {
      q: 'Why take inventory out for the quick ratio?',
      a: 'Inventory has to be sold before it becomes cash, and that can take weeks or months. Prepaid expenses, like rent paid in advance, can’t be turned back into cash at all. Taking both out shows what you could pay with money you have or will collect soon. Some books use cash plus short-term investments plus receivables instead; both give the same answer when nothing else is in current assets.',
    },
  ],
};
