import type { ToolMeta } from '@/lib/tool-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /salary/biweekly-pay-calculator.
 * Change the keyword map first, then this file and content.mdx (CLAUDE.md SEO rules).
 * Gross pay only: no tax, deductions or rules about which years have 27 paydays.
 */
export const meta: ToolMeta = {
  slug: 'biweekly-pay-calculator',
  category: 'salary',
  primaryKeyword: 'biweekly pay calculator',
  secondaryKeywords: ['biweekly salary calculator', 'hourly to biweekly pay', 'biweekly vs semi-monthly pay'],
  title: 'Biweekly Pay Calculator – Gross Pay Every Two Weeks',
  description:
    'Work out your gross biweekly pay from an annual salary or an hourly wage. See 26 and 27 pay-period years, monthly averages and the semi-monthly comparison.',
  h1: 'Biweekly Pay Calculator',
  subtitle: 'Turn a salary or an hourly wage into gross pay every two weeks, with 27-payday years and twice-a-month pay side by side.',
  risk: 'green',
  relatedTools: ['hourly-to-salary-calculator', 'pay-raise-calculator', 'job-offer-comparison-calculator'],
  // Keyword-map questions first (exact, same order), then 2 more.
  faq: [
    {
      q: 'How do I calculate biweekly pay?',
      a: 'From a salary, divide the yearly amount by 26, the number of two-week pay periods in most years. A $52,000 salary is $2,000 every two weeks. From an hourly wage, multiply your rate by your hours per week, then by 2. At $25 an hour for 40 hours, that is also $2,000 before tax, plus any overtime you add.',
    },
    {
      q: 'How many biweekly pay periods are in a year?',
      a: 'Usually 26. A year has 52 weeks plus one or two extra days, so if you are paid every two weeks, those extra days add up over time and some years have 27 paydays instead. The calculator shows both: what each payday is worth when a salary is split 26 or 27 ways, and what an hourly wage adds up to over 27 paydays.',
    },
    {
      q: 'What is the difference between biweekly and semi-monthly pay?',
      a: 'Biweekly means every two weeks, so you get 26 paydays in most years and the day of the month moves around. Semi-monthly means twice a month on set dates, so you get 24 paydays. Each semi-monthly payment is a little bigger for the same yearly pay: $52,000 is $2,000 biweekly but $2,166.67 when paid twice a month.',
    },
    {
      q: 'How do I convert biweekly pay to annual salary?',
      a: 'Multiply your biweekly pay by 26. A gross payment of $2,000 every two weeks works out to $52,000 a year. If your year has 27 paydays, multiply by 27 instead, which gives $54,000 for that year. Use your gross pay, the amount before tax and deductions, so the yearly figure is comparable with a salary.',
    },
    {
      q: 'Does this show take-home pay?',
      a: 'No. The calculator shows gross pay, which is the amount before tax, retirement contributions and other deductions. Those depend on where you live, your situation and your employer, so we do not estimate them. Your take-home pay will be lower than these figures. Check your payslip, or ask your employer or a qualified professional, for the amount that actually reaches your bank.',
    },
    {
      q: 'Why is my paycheck smaller than this?',
      a: 'Your paycheck shows what is left after tax and deductions such as retirement savings, insurance or other items your employer takes out. This calculator works only with gross pay, before any of that, because those amounts depend on rules and choices it does not know. Compare the gross line on your payslip with the result here to see whether the two match.',
    },
    {
      q: 'What if I’m paid every week?',
      a: 'Weekly pay is half of biweekly pay, and the calculator shows it as its own line. A $52,000 salary is $2,000 every two weeks, or $1,000 a week. For an hourly wage, weekly pay is your rate multiplied by your hours in one week. If you are paid weekly, a year has 52 paydays, and some years have 53.',
    },
  ],
};
