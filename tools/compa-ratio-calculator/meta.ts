import type { ToolMeta } from '@/lib/tool-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /salary/compa-ratio-calculator.
 * Change the keyword map first, then this file and content.mdx (CLAUDE.md SEO rules).
 * Never say what ratio is "good"; never quote market pay data. The pay range comes from the user.
 */
export const meta: ToolMeta = {
  slug: 'compa-ratio-calculator',
  category: 'salary',
  primaryKeyword: 'compa ratio calculator',
  secondaryKeywords: [
    'salary midpoint calculator',
    'range penetration calculator',
    'how to calculate compa ratio',
    'salary range position calculator',
  ],
  title: 'Compa Ratio Calculator – Salary Midpoint and Range Position',
  description:
    'Work out a compa ratio from a salary and a pay range midpoint. See the salary midpoint, the range penetration and how far the salary is from the middle.',
  h1: 'Compa Ratio Calculator',
  subtitle: 'See where a salary sits in its pay range: the compa ratio, the midpoint and how far into the range it is.',
  risk: 'green',
  relatedTools: ['pay-raise-calculator', 'job-offer-comparison-calculator', 'hourly-to-salary-calculator'],
  // Keyword-map questions first (exact, same order), then 2 more.
  faq: [
    {
      q: 'How do you calculate a compa ratio?',
      a: 'Divide the salary by the midpoint of its pay range. A salary of $72,000 in a range with a $75,000 midpoint has a compa ratio of 72,000 ÷ 75,000 = 0.96, often written as 96%. A ratio of 1.00 means the salary is exactly at the midpoint. Below 1.00 is below the midpoint, and above 1.00 is above it.',
    },
    {
      q: 'How do I find the midpoint of a salary range?',
      a: 'Add the range minimum and maximum together and divide by 2. For a range of $60,000 to $90,000, the midpoint is (60,000 + 90,000) ÷ 2 = $75,000. Some employers publish a midpoint that is not exactly halfway. If yours does, choose My own midpoint in the calculator and enter it, so the ratio matches your employer’s own figures.',
    },
    {
      q: 'What is range penetration?',
      a: 'Range penetration shows how far a salary has moved from the bottom of its range towards the top, as a percentage. Take the salary minus the minimum, and divide by the maximum minus the minimum. A $72,000 salary in a $60,000 to $90,000 range is 12,000 ÷ 30,000 = 40% of the way through. Below 0% or above 100% means outside the range.',
    },
    {
      q: 'What is the difference between compa ratio and range penetration?',
      a: 'Compa ratio compares a salary with the midpoint only. Range penetration compares it with the whole range, from the minimum to the maximum. Two people can share a compa ratio but sit differently in their ranges if one range is much wider. Looking at both gives a fuller picture, which is why the calculator shows them side by side.',
    },
    {
      q: 'What is a good compa ratio?',
      a: 'There is no single good number. Each employer decides where it wants pay to sit, often based on experience, performance and how long someone has been in the role. A new starter may sit below the midpoint and an expert above it. The calculator shows where a salary sits in its range; it does not say where it should be.',
    },
    {
      q: 'Where do I find my pay range?',
      a: 'Look in your employer’s pay band or grade documents, your contract or offer letter, or ask HR or your manager. Many job postings now show a range too. The calculator uses only the range you enter. It does not look up market pay data, so the answer is only as accurate as the range you put in.',
    },
    {
      q: 'Can I use it for an hourly wage?',
      a: 'Yes. Enter the hourly rate as the salary, and the hourly minimum and maximum as the range. The compa ratio and range penetration come out the same as with yearly figures, because they are ratios. Just make sure all the numbers use the same period: all hourly, all monthly or all yearly, never a mix of them.',
    },
  ],
};
