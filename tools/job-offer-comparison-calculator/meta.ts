import type { ToolMeta } from '@/lib/tool-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /salary/job-offer-comparison-calculator.
 * Change the keyword map first, then this file and content.mdx (CLAUDE.md SEO rules).
 */
export const meta: ToolMeta = {
  slug: 'job-offer-comparison-calculator',
  category: 'salary',
  primaryKeyword: 'job offer comparison calculator',
  secondaryKeywords: ['compare two job offers calculator', 'remote job offer comparison', 'job offer total compensation calculator'],
  title: 'Job Offer Comparison Calculator – Compare Two Offers',
  description:
    'Compare two job offers side by side: salary, bonus, benefits, commute and remote days. See which offer is really worth more to you each year.',
  h1: 'Job Offer Comparison Calculator',
  subtitle:
    'Compare two job offers on salary, bonus, retirement contributions, benefits, leave and commute, and see which is worth more each year before tax.',
  risk: 'green',
  relatedTools: ['hourly-to-salary-calculator', '1099-vs-w2-calculator', 'day-rate-to-salary-calculator'],
  // Keyword-map questions first (exact, same order), then 1 more from the spec.
  faq: [
    {
      q: 'How do I compare two job offers?',
      a: 'Put both offers on the same yearly basis before you decide. Add the base salary, the target bonus, what the employer pays into your retirement plan and the value of other benefits. Then take off what each job costs you to get to work, in money and in time. This calculator does that for you and shows both the yearly value and the effective pay per hour.',
    },
    {
      q: 'What should I include besides salary?',
      a: "Include the target bonus, the employer's retirement contribution, health insurance or other benefits the employer pays for, and the number of paid leave days. Then look at the costs: office days, commute time and fares, parking or fuel. Stock, sign-on bonuses and career growth matter too, but they are harder to value, so weigh them separately after you have compared the yearly numbers.",
    },
    {
      q: 'How do I value remote work?',
      a: 'Remote work saves you the commute in two ways: money and time. Set office days to 0 for a remote offer and the commute costs disappear. To count the time as well, enter what an hour of your free time is worth to you. Many people use their own after-tax hourly pay as a starting point, but the number is personal, so try a few values.',
    },
    {
      q: 'How much is a commute worth?',
      a: 'Multiply the round-trip cost of one office day by the number of office days in a year, then add the time. A 50-minute commute five days a week over 240 working days is 400 hours a year, about ten 40-hour weeks. Even at a modest value for your time, that can outweigh a few thousand in extra salary, as the worked example shows.',
    },
    {
      q: 'Should I take the higher salary?',
      a: 'Not always. A higher salary can come with fewer benefits, less leave, longer hours or a daily commute, and those can cancel out the difference. Compare the yearly value and the effective pay per hour of both offers. If the numbers are close, let the work itself, the team, your growth and your health decide, because they will matter more than a small gap.',
    },
    {
      q: 'Does this include tax?',
      a: 'No. Every figure is before tax. If both jobs are in the same country, tax usually affects them in a similar way, so the pre-tax comparison still shows which offer is worth more. Benefits can be taxed differently from salary, though, and a move between countries changes everything. Check an official tax calculator for your take-home pay before you decide.',
    },
  ],
};
