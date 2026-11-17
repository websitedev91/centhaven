import type { ToolMeta } from '@/lib/tool-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /salary/hourly-to-salary-calculator.
 * Change the keyword map first, then this file and content.mdx (CLAUDE.md SEO rules).
 */
export const meta: ToolMeta = {
  slug: 'hourly-to-salary-calculator',
  category: 'salary',
  primaryKeyword: 'hourly to salary calculator',
  secondaryKeywords: ['salary to hourly calculator', 'hourly wage to annual salary', 'annual salary to hourly rate'],
  title: 'Hourly to Salary Calculator – Wage to Yearly Pay',
  description:
    'Convert an hourly wage to yearly, monthly, bi-weekly, weekly and daily pay, or turn a salary into an hourly rate. Adjust hours and paid weeks.',
  h1: 'Hourly to Salary Calculator',
  subtitle: 'Turn an hourly wage into yearly, monthly, bi-weekly, weekly and daily pay, or a salary into an hourly rate. Before tax.',
  risk: 'green',
  relatedTools: ['hourly-rate-calculator', 'day-rate-to-salary-calculator', 'job-offer-comparison-calculator'],
  rates: [],
  // Keyword-map questions first (exact, same order), then 2 more from the spec.
  faq: [
    {
      q: 'How much is $25 an hour per year?',
      a: 'At 40 hours a week for 52 weeks, $25 an hour comes to $52,000 a year before tax. That is $4,333.33 a month, $2,000 every two weeks and $1,000 a week. If you work fewer hours or take unpaid time off, the yearly figure drops. Change the hours and paid weeks in the calculator to see your own number.',
    },
    {
      q: 'How do I convert a salary to an hourly rate?',
      a: 'Divide the yearly salary by the number of hours you are paid for in a year. With a 40-hour week and 52 paid weeks that is 2,080 hours, so a $75,000 salary works out to about $36.06 an hour. Switch the calculator to "Salary to hourly", enter your salary and your hours, and it does the division for you.',
    },
    {
      q: 'Is this before or after tax?',
      a: 'Every figure here is before tax, also called gross pay. Your take-home pay will be lower once income tax, social security or National Insurance, pension contributions and other deductions come out. Those depend on your country, income and personal situation, so this calculator does not estimate them. Check your payslip or an official tax calculator for your take-home figure.',
    },
    {
      q: 'How many working hours are in a year?',
      a: 'A full-time year is usually counted as 40 hours a week for 52 weeks, which is 2,080 hours. With 37.5-hour weeks it is 1,950 hours. If some of your holidays are unpaid, you are paid for fewer weeks, so lower the paid weeks box. Paid public holidays still count, because you are paid for those hours even though you do not work them.',
    },
    {
      q: 'How do paid holidays change the result?',
      a: 'If your holidays are paid, keep paid weeks at 52, because you earn the same amount every week of the year. If you take time off without pay, reduce the paid weeks. For example, $25 an hour at 40 hours a week drops from $52,000 to $50,000 a year with two unpaid weeks off. Hourly workers and contractors often have unpaid holidays, so check your contract.',
    },
    {
      q: 'Why are there 26 bi-weekly pay periods?',
      a: 'Bi-weekly means you are paid every two weeks. A year has 52 full weeks, so that gives 26 paydays. Because a calendar year is a day or two longer than 52 weeks, some years end up with 27 paydays, depending on when the first payday falls. This calculator uses 26, the figure most employers and payroll systems quote when they describe bi-weekly pay.',
    },
    {
      q: 'Does overtime count?',
      a: 'Only if you add it. By default the calculator uses your regular hours at your regular rate. Tick Include overtime to add extra hours each week at a higher pay rate, such as 1.5 for time and a half. Overtime rules and rates differ by country, employer and contract, so check yours. The result then shows your regular pay and overtime pay separately.',
    },
  ],
};
