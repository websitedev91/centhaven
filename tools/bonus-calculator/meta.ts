import type { ToolMeta } from '@/lib/tool-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /salary/bonus-calculator.
 * Change the keyword map first, then this file and content.mdx (CLAUDE.md SEO rules).
 * Gross bonus only: no tax, withholding rules or "typical" bonus percentages.
 */
export const meta: ToolMeta = {
  slug: 'bonus-calculator',
  category: 'salary',
  primaryKeyword: 'bonus calculator',
  secondaryKeywords: [
    'bonus percentage calculator',
    'target bonus calculator',
    'how to calculate bonus percentage of salary',
    'annual bonus calculator',
  ],
  title: 'Bonus Calculator – Percent, Fixed or Target Bonus',
  description:
    'Work out a bonus as a percent of salary, a fixed amount or a target percent times your achievement. See the gross bonus, the per-paycheck amount and total pay.',
  h1: 'Bonus Calculator',
  subtitle: 'Work out a gross bonus from a percent of salary, a fixed amount or a target times achievement, with your total pay.',
  risk: 'green',
  relatedTools: ['commission-calculator', 'pay-raise-calculator', 'job-offer-comparison-calculator'],
  // Keyword-map questions first (exact, same order), then 2 more.
  faq: [
    {
      q: 'How do I calculate a bonus as a percentage of salary?',
      a: 'Multiply your annual salary by the bonus percentage, then divide by 100. A 10% bonus on a $60,000 salary is 60,000 × 10 ÷ 100 = $6,000 before tax, which makes your total pay for the year $66,000. If you were given a fixed amount instead, divide it by your salary and multiply by 100 to see it as a percentage. The calculator does both.',
    },
    {
      q: 'How does a target bonus work?',
      a: 'A target bonus is the bonus you get if you hit 100% of your goals, set as a percentage of salary. The amount paid then moves up or down with how you score. On a $60,000 salary with a 10% target, hitting your goals exactly pays $6,000. Your plan decides how achievement turns into a payout, so check its rules and enter the payout percentage it gives.',
    },
    {
      q: 'How do I calculate a bonus at 120% achievement?',
      a: 'Multiply your salary by the target percentage, then by the achievement or payout percentage. On a $60,000 salary with a 10% target, 120% achievement pays 60,000 × 10% × 120% = $7,200 before tax. That is 12% of salary. Some plans pay a different percentage than you achieved, for example with a cap or a curve, so use the payout figure from your plan.',
    },
    {
      q: 'How much is my bonus per paycheck?',
      a: 'If your bonus is spread across paychecks instead of paid as one lump sum, divide it by the number of paychecks. A $6,000 bonus spread over 12 paychecks is $500 each. Enter the number of paychecks in the calculator to see the bonus per paycheck and your pay per paycheck with the bonus included, assuming your salary is paid over the same number of paychecks.',
    },
    {
      q: 'Does this show my bonus after tax?',
      a: 'No. The calculator shows the gross bonus, before any tax, insurance or other deductions. How much is taken off depends on where you live, your other income and how your employer pays the bonus, so the amount in your bank will be less. Your payslip or your payroll team can tell you what was deducted. We never estimate tax for you.',
    },
    {
      q: 'What if my plan caps the bonus?',
      a: 'Enter the payout percentage your plan actually pays. If your plan caps payouts at 150% of target and you achieved 170%, enter 150% as the achievement. The calculator does not know your plan’s rules, caps or thresholds, so it uses only the numbers you give it. Your bonus plan document or your manager can tell you how your payout is worked out.',
    },
    {
      q: 'Can I compare two achievement levels?',
      a: 'Yes. In Target × achievement mode, open Compare two achievement levels under the calculator and enter a second payout percentage, for example 100% next to your 120%. You will see both bonuses and both totals side by side, using the same salary and target. In % of salary mode, the same button compares two bonus percentages, for example 10% and 15%.',
    },
  ],
};
