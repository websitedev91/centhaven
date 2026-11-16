import type { ToolMeta } from '@/lib/tool-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /freelance/hourly-rate-calculator.
 * Change the keyword map first, then this file and content.mdx (CLAUDE.md SEO rules).
 */
export const meta: ToolMeta = {
  slug: 'hourly-rate-calculator',
  category: 'freelance',
  primaryKeyword: 'freelance hourly rate calculator',
  secondaryKeywords: [
    'freelance rate calculator',
    'how much should i charge per hour freelance',
    'hourly rate calculator for freelancers',
    'freelance pricing calculator',
  ],
  title: 'Freelance Hourly Rate Calculator – What Should You Charge?',
  description:
    'Work out the minimum hourly rate you need as a freelancer. Add your income goal, expenses, tax and time off to see your real rate in seconds.',
  h1: 'Freelance Hourly Rate Calculator',
  subtitle: 'Find the minimum hourly rate you need to charge to reach your take-home income after tax, expenses and unpaid time.',
  risk: 'green',
  relatedTools: ['day-rate-to-salary-calculator', 'rate-increase-calculator', 'consulting-fee-calculator'],
  affiliateId: 'invoicing-software',
  rates: [],
  // Keyword-map questions first (exact, same order), then 2 more.
  faq: [
    {
      q: 'How much should I charge per hour as a freelancer?',
      a: 'Start with the income you want to take home each year. Add the tax you will owe and your business expenses. Then divide that total by the hours you can actually bill, not every hour you work. The result is your minimum rate. Many freelancers then add a buffer of 10 to 20 percent for slow months, and charge more again if their skills are in high demand.',
    },
    {
      q: 'Why is my freelance rate higher than my old salary per hour?',
      a: 'As an employee, your employer paid for your holidays, sick days, equipment, software and part of your taxes. You also got paid for meetings and admin. As a freelancer, you cover all of that yourself and only earn money in billable hours. So your hourly rate has to be much higher than your old salary divided by hours worked, often 1.5 to 2 times higher.',
    },
    {
      q: 'What is billable time?',
      a: 'Billable time is the share of your working hours that you can charge a client for. The rest goes on admin, invoicing, finding new work, emails and learning. Most freelancers bill between 60 and 80 percent of their time. If you assume 100 percent, your rate will be too low and you will fall short of your income goal, even when you feel busy every week.',
    },
    {
      q: 'Should I charge hourly or per project?',
      a: 'Hourly pricing is simple and protects you when the scope of work is unclear or keeps changing. Project pricing rewards you for working fast and lets clients budget with confidence. Many freelancers use their hourly rate to estimate a project price, then quote a fixed fee. Either way, knowing your minimum hourly rate stops you from agreeing to a price that does not cover your costs.',
    },
    {
      q: 'How do I include tax in my freelance rate?',
      a: 'Enter your rough total tax rate, including income tax and any self-employment or social security contributions. The calculator grosses up your take-home income so that, after tax is paid, you keep the amount you wanted. For example, with a 25 percent tax rate, taking home 60,000 needs 80,000 before tax. Your real rate depends on your country and situation, so check with an accountant.',
    },
    {
      q: 'What expenses should freelancers include?',
      a: 'Include everything you pay to run your business over a year. Common costs are software subscriptions, a laptop and other equipment, internet and phone, insurance, accounting fees, bank and platform fees, a coworking desk, training and marketing. Spread one-off purchases over their useful life. Leaving costs out is one of the most common reasons freelancers end up earning less than they planned.',
    },
    {
      q: 'Is a day rate better than an hourly rate?',
      a: 'A day rate suits work that fills whole days, such as on-site contracts, workshops or design sprints. It saves you tracking every hour and stops clients counting minutes. An hourly rate suits small or uneven tasks. This calculator shows both, using your hours per week divided by five as the length of a working day. Pick whichever matches how your clients buy.',
    },
  ],
};
