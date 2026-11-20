import type { ToolMeta } from '@/lib/tool-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /salary/weekly-pay-calculator.
 * Change the keyword map first, then this file and content.mdx (CLAUDE.md SEO rules).
 * Gross pay only: no tax, deductions, overtime multipliers or rules about 53-payday years.
 */
export const meta: ToolMeta = {
  slug: 'weekly-pay-calculator',
  category: 'salary',
  primaryKeyword: 'weekly pay calculator',
  secondaryKeywords: ['weekly salary calculator', 'hourly to weekly pay', 'how much is my weekly pay'],
  title: 'Weekly Pay Calculator – Gross Pay Every Week',
  description:
    'Work out your gross weekly pay from an annual salary or an hourly wage with overtime. See your yearly, biweekly and monthly pay, and a 53-payday year.',
  h1: 'Weekly Pay Calculator',
  subtitle: 'Turn a salary or an hourly wage, with overtime, into gross pay every week, plus your yearly, biweekly and monthly figures.',
  risk: 'green',
  relatedTools: ['biweekly-pay-calculator', 'hourly-to-salary-calculator', 'pay-raise-calculator'],
  // Keyword-map questions first (exact, same order), then 2 more.
  faq: [
    {
      q: 'How do I calculate my weekly pay?',
      a: 'If you are paid by the hour, multiply your hourly rate by the hours you work in a week, then add any overtime hours multiplied by your overtime rate. At $25 an hour for 40 hours, that is $1,000 a week before tax. If you are on a salary, divide the yearly amount by 52 instead. The calculator does either one for you.',
    },
    {
      q: 'How do I work out weekly pay from a salary?',
      a: 'Divide your annual salary by 52, the number of weeks in a year. A $52,000 salary is $1,000 a week before tax. Some years have 53 weekly paydays, so some employers split the salary 53 ways in those years instead, which gives $981.13 a week. Ask your employer how they handle it; the calculator shows both figures side by side.',
    },
    {
      q: 'How is overtime added to weekly pay?',
      a: 'Overtime pay is the extra hours you worked that week multiplied by your overtime rate, added to your normal pay. Five overtime hours at $37.50 an hour add $187.50, so a $1,000 week becomes $1,187.50. Enter the overtime rate your employer actually pays you. The calculator never assumes a multiplier, because overtime rules and rates differ between jobs and places.',
    },
    {
      q: 'How many weekly paydays are in a year?',
      a: 'Usually 52. A year has 52 weeks plus one or two extra days, so if you are paid every week, those extra days add up and some years have 53 paydays instead. For an hourly wage, a 53-payday year simply adds one more week of pay. For a salary, it depends on how your employer splits it, so the calculator shows both ways.',
    },
    {
      q: 'Does this show take-home pay?',
      a: 'No. The calculator shows gross pay, the amount before tax, retirement contributions and other deductions. Those depend on where you live, your situation and your employer, so we do not estimate them. Your take-home pay will be lower than these figures. Check your payslip, or ask your employer or a qualified professional, for the amount that actually reaches your bank.',
    },
    {
      q: 'Why is my paycheck smaller than this?',
      a: 'Your paycheck shows what is left after tax and deductions such as retirement savings, insurance or other items your employer takes out. This calculator works only with gross pay, before any of that, because those amounts depend on rules and choices it does not know. Compare the gross line on your payslip with the result here to see whether the two match.',
    },
    {
      q: 'What if I am paid every two weeks?',
      a: 'Biweekly pay is twice your weekly pay, and the calculator shows it as its own line. A $1,000 week is $2,000 every two weeks, with 26 paydays in most years. If you want the full picture for biweekly pay, including 27-payday years and the twice-a-month comparison, the biweekly pay calculator covers it in detail with the same inputs.',
    },
  ],
};
