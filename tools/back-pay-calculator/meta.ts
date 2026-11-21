import type { ToolMeta } from '@/lib/tool-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /salary/back-pay-calculator.
 * Change the keyword map first, then this file and content.mdx (CLAUDE.md SEO rules).
 * Gross amounts only. Never mention legal rights, deadlines, interest, penalties or how to claim.
 */
export const meta: ToolMeta = {
  slug: 'back-pay-calculator',
  category: 'salary',
  primaryKeyword: 'back pay calculator',
  secondaryKeywords: ['retro pay calculator', 'how to calculate back pay', 'back pay for a pay raise', 'missed pay calculator'],
  title: 'Back Pay Calculator – Retro Pay From a Raise or Missed Pay',
  description:
    'Work out gross back pay from a pay rise that started late, or from pay periods you missed. Enter your own rates, hours, weeks and amounts to see the total.',
  h1: 'Back Pay Calculator',
  subtitle: 'Work out the gross back pay from an hourly or salary raise that started late, or from pay periods you missed.',
  risk: 'green',
  relatedTools: ['pay-raise-calculator', 'weekly-pay-calculator', 'hourly-to-salary-calculator'],
  // Keyword-map questions first (exact, same order), then 2 more.
  faq: [
    {
      q: 'How do I calculate back pay?',
      a: 'It depends on why the money is owed. If a raise started late, multiply the difference in pay by the time it covers: for an hourly raise, the difference per hour times your hours per week times the weeks owed. If whole pay periods were missed, multiply the pay for one period by the number of periods. The calculator does all three, using only the numbers you enter.',
    },
    {
      q: 'How do I calculate back pay for a pay raise?',
      a: 'For an hourly raise, take the new rate minus the old rate, then multiply by your hours per week and the weeks owed. Going from $20 to $22 an hour for 40 hours a week over 12 weeks is 2 × 40 × 12 = $960. For a salary raise, divide the yearly difference by 52 and multiply by the weeks owed: $50,000 to $55,000 over 10 weeks is $961.54.',
    },
    {
      q: 'How do I work out pay for missed pay periods?',
      a: 'Multiply your gross pay for one period by the number of periods you missed. If you are normally paid $1,500 every two weeks and three paychecks were missed, that is 1,500 × 3 = $4,500 before tax. You can enter part of a period too, such as 2.5 periods. The pay period setting only changes the wording; the sum is the same whichever period you choose.',
    },
    {
      q: 'What is the difference between back pay and retro pay?',
      a: 'People often use the two words for the same thing. Retro pay, short for retroactive pay, usually means the extra owed when a raise is backdated: the gap between what you were paid and what you should have been paid. Back pay can also mean pay that was missed completely. The calculator covers both cases, as a raise paid late or as missed pay periods.',
    },
    {
      q: 'Does this show back pay after tax?',
      a: 'No. Every figure is gross, before tax and any other deductions. How much is taken off depends on your own situation and how the amount is paid, so the sum you receive will be less. Your payslip will show the deductions. The calculator never estimates tax; it only multiplies the pay difference or missed pay by the time it covers.',
    },
    {
      q: 'What if my hours changed during that time?',
      a: 'Work out each stretch separately and add them together. If you worked 40 hours a week for 6 weeks and 30 hours a week for the next 6, run the calculator once with 40 hours and 6 weeks, then again with 30 hours and 6 weeks, and add the two totals. Do the same if your rate changed more than once during the period you are owed.',
    },
    {
      q: 'Can I use it if I am paid monthly?',
      a: 'Yes. For a salary raise, choose Salary raise paid late and enter the weeks owed; a month is about 4.33 weeks, so three months is about 13 weeks. If whole monthly paychecks were missed, choose Missed pay, set the pay period to Every month and enter how many were missed. Use the gross amount from your payslip or contract for each figure you enter.',
    },
  ],
};
