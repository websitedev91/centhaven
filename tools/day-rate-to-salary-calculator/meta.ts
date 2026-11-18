import type { ToolMeta } from '@/lib/tool-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /freelance/day-rate-to-salary-calculator.
 * Change the keyword map first, then this file and content.mdx (CLAUDE.md SEO rules).
 */
export const meta: ToolMeta = {
  slug: 'day-rate-to-salary-calculator',
  category: 'freelance',
  primaryKeyword: 'day rate to salary calculator',
  secondaryKeywords: [
    'freelance day rate calculator',
    'contractor day rate calculator',
    'salary to day rate calculator',
    'contractor vs permanent salary',
  ],
  title: 'Day Rate to Salary Calculator for Contractors | CentHaven',
  description:
    'Convert a contractor day rate to a yearly salary, or find the day rate you need to match a job. Includes holidays, sick days and gaps between contracts.',
  h1: 'Day Rate to Salary Calculator',
  subtitle: 'See what a contractor day rate adds up to over a year, the permanent salary it equals, or the day rate you need to match a job.',
  risk: 'green',
  relatedTools: ['hourly-rate-calculator', 'hourly-to-salary-calculator', 'consulting-fee-calculator'],
  affiliateId: 'invoicing-software',
  // Keyword-map questions first (exact, same order), then 2 more from the spec.
  faq: [
    {
      q: 'How do I convert a day rate to a salary?',
      a: 'Multiply your day rate by the days you actually bill in a year. Start with 260 working days, then take off holidays, public holidays, sick days and gaps between contracts. With the defaults that leaves 212 days, so £500 a day is £106,000 a year. To compare with a permanent job, divide by one plus your benefits uplift: at 20% that is about £88,333.',
    },
    {
      q: 'What is a good contractor day rate?',
      a: 'There is no single good rate. It depends on your skills, industry, location and how much demand there is for your work. A useful floor is the rate that matches the permanent salary you could earn instead, once you allow for unpaid holidays, gaps and benefits. Switch the calculator to salary to day rate to find that floor, then check contract listings in your field for the market range.',
    },
    {
      q: 'How many billable days are in a year?',
      a: 'A year has about 260 weekdays. Contractors are not paid for holidays, public holidays, sick days or the gaps between contracts, so their billable days are lower. With 25 days of holiday, 8 public holidays, 5 sick days and 10 days between contracts you bill 212 days. Your own history of time off and gaps between contracts is the best guide to your number.',
    },
    {
      q: 'Why should contractors earn more than employees?',
      a: 'Employees are paid for holidays, public holidays and sick days, and often get a pension, insurance and training on top of their salary. Contractors pay for all of that themselves and earn nothing while they are between contracts. A contractor on the same yearly pay as an employee is usually worse off, so the day rate has to cover the unpaid days and the missing benefits.',
    },
    {
      q: 'Is this before or after tax?',
      a: 'Every figure is before tax. Contractors are often taxed differently from employees, and the rules depend on your country, how you are set up and the contract itself. This calculator leaves tax out so you can compare gross pay on equal terms. Tax rules for contractors differ by country, so check with an accountant before you compare what you would actually take home.',
    },
    {
      q: 'What is a benefits uplift?',
      a: 'It is your estimate of the extra value an employee gets on top of salary, such as employer pension contributions, paid leave, health or life insurance, training and equipment. Enter it as a percentage of salary. The calculator divides contractor income by one plus the uplift to give a fair salary comparison. It is your own assumption, so try a few values and see how much the answer moves.',
    },
    {
      q: 'Should I include days between contracts?',
      a: 'Yes, if you expect them. Few contractors move from one contract straight into the next every time. Days spent finding work, waiting for a start date or between projects earn nothing. Leaving them out makes your yearly income look higher than it will really be. If you have contracted before, use your actual gaps from the last year or two as a guide.',
    },
  ],
};
