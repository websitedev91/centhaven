import type { ToolMeta } from '@/lib/tool-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /salary/pay-raise-calculator.
 * Change the keyword map first, then this file and content.mdx (CLAUDE.md SEO rules).
 * Pure maths: no "typical" or "average" raise figures anywhere.
 */
export const meta: ToolMeta = {
  slug: 'pay-raise-calculator',
  category: 'salary',
  primaryKeyword: 'pay raise calculator',
  secondaryKeywords: ['salary increase calculator', 'raise percentage calculator', 'how much is a 5% raise', 'new salary after raise'],
  title: 'Pay Raise Calculator – New Salary and Raise Percentage',
  description:
    'Work out your new pay after a raise, or the raise percentage between your old and new pay. Works for hourly, monthly or yearly pay in any currency.',
  h1: 'Pay Raise Calculator',
  subtitle: 'See your new pay after a raise, or the raise percentage between your old and new pay, per hour, week, month or year.',
  risk: 'green',
  relatedTools: ['hourly-to-salary-calculator', 'job-offer-comparison-calculator', 'rate-increase-calculator'],
  // Keyword-map questions first (exact, same order), then 2 more.
  faq: [
    {
      q: 'How do I calculate a pay raise percentage?',
      a: 'Subtract your old pay from your new pay, divide the result by your old pay, then multiply by 100. If your salary goes from $50,000 to $54,000, the difference is $4,000, and $4,000 divided by $50,000 is 0.08, so the raise is 8%. Choose "My new pay" in the calculator and it does this for you, for any pay period.',
    },
    {
      q: 'How much is a 5% raise?',
      a: 'Multiply your current pay by 0.05 to get the raise, or by 1.05 to get your new pay. On a $60,000 salary, a 5% raise is $3,000 a year, so your new salary is $63,000. On a $5,000 monthly salary, it is $250 a month. The calculator works this out for any pay and any percentage, including pay per hour or per week.',
    },
    {
      q: 'How does inflation affect my raise?',
      a: 'If prices rise while your pay rises, part of the raise only keeps up with higher costs. The calculator can show your raise after inflation if you enter an inflation figure you trust. It divides one plus your raise by one plus inflation and takes away one. A 5% raise with 3% inflation is a real raise of about 1.94%.',
    },
    {
      q: 'Should I ask for a raise as a percentage or an amount?',
      a: 'Either can work, so use the one that makes your request clear. A percentage is easy to compare with past raises, while an amount shows exactly what you are asking for. Many people find it helpful to know both. Enter your current pay and the percentage you have in mind, and the calculator shows the matching amount per period and per year.',
    },
    {
      q: 'How do I work out a raise on an hourly wage?',
      a: 'Multiply your hourly wage by one plus the raise percentage. A 4% raise on $25 an hour gives $26 an hour. To see the yearly effect, multiply the extra $1 by the hours you work each year. At 40 hours a week for 52 weeks, that is $2,080 more a year. Choose "Per hour" and enter your weekly hours to see it.',
    },
    {
      q: 'What is a real raise?',
      a: 'A real raise is your raise after allowing for rising prices. If your pay rises by 5% but prices rise by 3%, you can buy only about 1.94% more than before. If inflation is higher than your raise, your real pay falls even though the number on your payslip goes up. Enter an inflation figure you trust to see your real raise.',
    },
    {
      q: 'How do I compare a raise with a new job offer?',
      a: 'Work out your new pay here first, then compare it with the offer on a like-for-like basis. Pay is only part of the picture: hours, commute, benefits and time off all change what a job is worth to you. The job offer comparison calculator lets you put two offers side by side, so use the raised pay as one of them.',
    },
  ],
};
