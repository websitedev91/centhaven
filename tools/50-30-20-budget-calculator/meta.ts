import type { ToolMeta } from '@/lib/tool-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /personal-finance/50-30-20-budget-calculator.
 * Change the keyword map first, then this file and content.mdx (CLAUDE.md SEO rules).
 * Take-home pay comes from the user (no tax maths). 50/30/20 is "a popular budgeting guideline, not a rule".
 */
export const meta: ToolMeta = {
  slug: '50-30-20-budget-calculator',
  category: 'personal-finance',
  primaryKeyword: '50/30/20 budget calculator',
  secondaryKeywords: ['50 30 20 rule calculator', 'budget calculator', 'how to split my income', 'needs wants savings calculator'],
  title: '50/30/20 Budget Calculator – Needs, Wants and Savings',
  description:
    'Split your monthly take-home pay into needs, wants and savings with the 50/30/20 guideline. Change the percentages and compare the plan with what you spend.',
  h1: '50/30/20 Budget Calculator',
  subtitle: 'Split your take-home pay into needs, wants and savings, change the percentages to fit your life, and compare with what you spend.',
  risk: 'green',
  relatedTools: ['savings-goal-calculator', 'emergency-fund-calculator', 'debt-snowball-calculator'],
  // Keyword-map questions first (exact, same order), then 2 more.
  faq: [
    {
      q: 'How does the 50/30/20 rule work?',
      a: 'It splits your monthly take-home pay into three parts: about half for needs, about a third for wants and the rest for savings. With $4,000 a month after tax, that is $2,000 for needs, $1,200 for wants and $800 for savings. It is a popular budgeting guideline, not a rule, so many people adjust the split to fit their life.',
    },
    {
      q: 'What counts as needs, wants and savings?',
      a: 'Needs are the costs you must pay to live and work: rent or mortgage, bills, food, transport, insurance and minimum debt payments. Wants are things you choose, such as eating out, hobbies, holidays and most subscriptions. Savings covers money you put aside and any extra payments on debt above the minimum. Where a cost sits is your call.',
    },
    {
      q: 'Can I change the 50/30/20 percentages?',
      a: 'Yes. Type your own percentages in the three boxes, and the calculator updates the amounts straight away. They need to add up to 100%, so if they do not, it tells you the total and waits until you fix it. A split such as 60/30/10 or 50/20/30 is fine; the calculator only does the maths for the split you choose.',
    },
    {
      q: 'What if my needs are more than 50%?',
      a: 'That is common, especially where rent is high or pay is low. Enter what you really spend on needs to see how far it is from the plan, then change the percentages to something you can keep to. Over time you might lower needs or raise income, but a budget you can follow is more useful than one that only looks neat.',
    },
    {
      q: 'Is the 50/30/20 rule right for everyone?',
      a: 'No single split suits everyone. Someone paying off debt may save more, someone with high rent may spend more on needs, and someone saving for a home may cut wants for a while. The 50/30/20 split is a simple starting point. Use the calculator to try other splits and pick the one that fits your income, costs and goals.',
    },
    {
      q: 'Does debt repayment count as needs or savings?',
      a: 'In this split, the minimum payment on each debt counts as a need, because you must pay it. Anything you pay above the minimum counts as savings, because it improves your finances just like putting money aside. If you are paying off several debts, the debt snowball calculator shows how an extra payment each month changes how long it takes.',
    },
    {
      q: 'Should I use my pay before or after tax?',
      a: 'Use your take-home pay: the amount that actually reaches your bank account each month after tax and other deductions. That is the money you can split between needs, wants and savings. The calculator does not work out tax, so enter the figure from your payslip or bank statement. If your pay changes each month, use a typical or lower month.',
    },
  ],
};
