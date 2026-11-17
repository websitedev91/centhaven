import type { ToolMeta } from '@/lib/tool-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /personal-finance/emergency-fund-calculator.
 * Change the keyword map first, then this file and content.mdx (CLAUDE.md SEO rules).
 */
export const meta: ToolMeta = {
  slug: 'emergency-fund-calculator',
  category: 'personal-finance',
  primaryKeyword: 'emergency fund calculator',
  secondaryKeywords: ['emergency fund calculator for freelancers', 'how much emergency fund do i need', 'emergency savings calculator'],
  title: 'Emergency Fund Calculator – How Much Should You Save?',
  description:
    'Work out how big your emergency fund should be from your monthly costs, income stability and dependants, and how long it will take to build.',
  h1: 'Emergency Fund Calculator',
  subtitle: 'Work out how much to keep for emergencies, how close you are, and how many months it will take to build the rest.',
  // Yellow: pure maths, but the suggested months are a rule of thumb (approved by Puru, 2026-11-17).
  risk: 'yellow',
  relatedTools: ['hourly-rate-calculator', 'break-even-calculator', 'hourly-to-salary-calculator'],
  rates: [],
  // Keyword-map questions first (exact, same order), then 2 more from the spec.
  faq: [
    {
      q: 'How much should my emergency fund be?',
      a: 'Enough to cover your essential costs for several months if your income stops or a big bill arrives. Start with what you must pay each month, such as rent, food, bills, insurance and loan payments, then multiply by the number of months you want covered. This calculator does that for you and suggests a number of months you can change.',
    },
    {
      q: 'How many months of expenses should I save?',
      a: 'A common rule of thumb, not a rule, is about three months for a steady salary and six for variable or self-employed income, plus a little more for each person who depends on you. Your own situation matters more: job security, health, other income, and how quickly you could cut costs. Choose a number that would let you sleep at night.',
    },
    {
      q: 'Do freelancers need a bigger emergency fund?',
      a: 'Usually, yes. Freelance income goes up and down, clients can pay late, and there is no sick pay or notice period if work dries up. A larger buffer smooths those gaps so a quiet month does not turn into debt. That is why the calculator suggests more months for self-employed and variable income than for a steady salary.',
    },
    {
      q: 'Where should I keep my emergency fund?',
      a: 'Somewhere safe and easy to reach quickly, usually a separate savings account rather than your everyday spending account. Keeping it separate makes it less tempting to dip into for non-emergencies. Avoid putting it anywhere its value can fall sharply or that takes a long time to access, because you may need it at short notice.',
    },
    {
      q: 'How fast should I build it?',
      a: 'As fast as you comfortably can without missing essential bills or taking on new debt. Even a small fixed amount each month adds up, and automatic transfers on payday make it easier to stick to. Many people aim first for one month of costs, then keep going. The calculator shows how many months your current saving rate will take.',
    },
    {
      q: 'What counts as an emergency?',
      a: 'Something unexpected and necessary: losing your job or a big client, a medical bill, an urgent car or home repair, or travel for a family emergency. Planned costs such as holidays, gifts or a new phone are not emergencies, so save for those separately. Having a clear rule makes it easier to protect the fund for when you really need it.',
    },
    {
      q: 'Should I pay off debt or build an emergency fund first?',
      a: 'It depends on the debt and your situation. Many people build a small starter fund first so an unexpected bill does not add new debt, then focus on expensive debt, then finish the full fund. High-interest debt costs a lot to keep, so it often deserves priority after that small buffer. A qualified adviser can help with your specific case.',
    },
  ],
};
