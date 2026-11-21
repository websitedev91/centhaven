import type { ToolMeta } from '@/lib/tool-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /salary/part-time-salary-calculator.
 * Change the keyword map first, then this file and content.mdx (CLAUDE.md SEO rules).
 * Gross pay only. Full-time hours come from the user; never state legal hour thresholds.
 */
export const meta: ToolMeta = {
  slug: 'part-time-salary-calculator',
  category: 'salary',
  primaryKeyword: 'part time salary calculator',
  secondaryKeywords: ['pro rata salary calculator', 'part time pay calculator', 'fte salary calculator', 'how to calculate part time salary'],
  title: 'Part Time Salary Calculator – Pro Rata Pay From Hours',
  description:
    'Work out a part-time salary from a full-time salary and your hours, or from an hourly wage. See your yearly, monthly and weekly pay and your share of full time.',
  h1: 'Part Time Salary Calculator',
  subtitle: 'Turn a full-time salary and your hours, or an hourly wage, into yearly, monthly and weekly part-time pay.',
  risk: 'green',
  relatedTools: ['hourly-to-salary-calculator', 'weekly-pay-calculator', 'pay-raise-calculator'],
  // Keyword-map questions first (exact, same order), then 2 more.
  faq: [
    {
      q: 'How do I calculate a part-time salary?',
      a: 'Divide your part-time hours by the full-time hours for the job, then multiply the full-time salary by that share. If the full-time job pays $50,000 for 40 hours a week and you work 24 hours, your share is 24 ÷ 40 = 60%, and your part-time salary is $30,000 a year before tax. If you are paid by the hour, multiply your rate by your hours and paid weeks instead.',
    },
    {
      q: 'What is a pro rata salary?',
      a: 'Pro rata means in proportion. A pro rata salary is the full-time salary scaled down to the hours you actually work. Job ads often show the full-time figure with “pro rata” next to it, so a $50,000 pro rata job at 24 of 40 hours pays $30,000. The calculator uses the full-time hours you enter, because the full-time week differs between employers and contracts.',
    },
    {
      q: 'How do I work out my part-time hourly rate?',
      a: 'Divide the full-time salary by the full-time hours per week, then by 52 weeks. A $50,000 salary for 40 hours a week works out at 50,000 ÷ (40 × 52) = $24.04 an hour. On a pro rata basis your hourly rate stays the same as a full-time colleague’s; you simply work fewer hours. The calculator shows this hourly figure under the result.',
    },
    {
      q: 'What does 0.6 FTE mean?',
      a: 'FTE stands for full-time equivalent. 0.6 FTE means you work 60% of the full-time hours, for example 24 hours when full time is 40. Your pro rata salary is then 60% of the full-time salary. The calculator shows this share as a percentage of full time, so 0.6 FTE appears as 60%, and 0.8 FTE as 80%. Use your contract’s full-time hours for the right figure.',
    },
    {
      q: 'Does this show take-home pay?',
      a: 'No. The calculator shows gross pay, before tax, insurance, pension or other deductions. What is taken off depends on where you live, your total income and your employer’s schemes, so your payslip will show less. We never estimate tax or deductions. Use the gross figure to compare jobs or hours on the same basis, then check your payslip for what you actually receive.',
    },
    {
      q: 'Do part-timers get the same hourly rate?',
      a: 'With pro rata pay, the maths gives the same hourly rate as full time: the salary falls in step with the hours. In the example, both a full-time and a 24-hour worker earn $24.04 an hour. Whether your employer pays that way, and how holidays and benefits are handled, depends on your contract. The calculator only does the maths with the numbers you enter.',
    },
    {
      q: 'What if I work different hours each week?',
      a: 'Use your average hours. Add up your hours over a few typical weeks and divide by the number of weeks. If you worked 20, 28, 24 and 24 hours over four weeks, your average is 24 hours a week. In hourly mode you can also lower the paid weeks per year if some weeks are unpaid, for example in school holidays, to get a truer yearly figure.',
    },
  ],
};
