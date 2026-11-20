import type { ToolMeta } from '@/lib/tool-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /marketing/conversion-rate-calculator.
 * Change the keyword map first, then this file and content.mdx (CLAUDE.md SEO rules).
 * Pure maths: no "average conversion rate is X%" claims or benchmarks.
 */
export const meta: ToolMeta = {
  slug: 'conversion-rate-calculator',
  category: 'marketing',
  primaryKeyword: 'conversion rate calculator',
  secondaryKeywords: [
    'how to calculate conversion rate',
    'conversions needed calculator',
    'website conversion rate calculator',
    'ecommerce conversion rate calculator',
  ],
  title: 'Conversion Rate Calculator – Rate, Visitors and Revenue',
  description:
    'Work out your conversion rate from visitors and conversions, or see the conversions a target rate means and the visitors you need. Add a value for revenue.',
  h1: 'Conversion Rate Calculator',
  subtitle: 'Find your conversion rate, the conversions a target rate means, or the visitors you need to reach a goal.',
  risk: 'green',
  relatedTools: ['cpc-calculator', 'cost-per-lead-calculator', 'roas-calculator'],
  // Keyword-map questions first (exact, same order), then 2 more.
  faq: [
    {
      q: 'How do you calculate conversion rate?',
      a: 'Divide the number of conversions by the number of visitors, then multiply by 100. If 5,000 people visited a page and 150 of them bought something, the conversion rate is 150 ÷ 5,000 × 100 = 3%. Use visitors and conversions from the same page or campaign and the same dates, so the two numbers describe the same group of people.',
    },
    {
      q: 'How many visitors do I need for my conversion goal?',
      a: 'Divide your conversions goal by your conversion rate as a decimal. For 200 sales at a 3% rate, you need 200 ÷ 0.03 = 6,666.67 visitors, which the calculator rounds up to 6,667, because you need whole visitors to reach the goal. Use a rate you have actually seen before, so the plan is based on your own results.',
    },
    {
      q: 'How many conversions does my target rate mean?',
      a: 'Multiply your visitors by the target rate as a decimal. With 5,000 visitors and a 4% target, that is 5,000 × 0.04 = 200 conversions. If the answer has a decimal, such as 99.5, it is an average: over many periods, you would expect about that many. Choose Conversions needed in the calculator to work it out for your own numbers.',
    },
    {
      q: 'How do I turn a conversion rate into revenue?',
      a: 'Multiply your conversions by what one conversion is worth to you, such as the average order value or the value of a lead. With 150 sales worth $50 each, revenue is $7,500. Divide that by your visitors to get revenue per visitor, here $1.50, which helps you compare pages and campaigns that get very different amounts of traffic.',
    },
    {
      q: 'What is a good conversion rate?',
      a: 'A good conversion rate is one that is higher than your own past rate and earns more than the traffic costs. Rates differ widely between products, prices and what counts as a conversion, so comparing with other businesses can mislead. Track your own rate over time, and use revenue per visitor to see whether a change actually earned more money.',
    },
    {
      q: 'What counts as a conversion?',
      a: 'A conversion is whatever action you want a visitor to take: a sale, a sign-up, a booking, a download or an enquiry. Pick one and count only that, so your rate means one thing. If you track several actions, work out a separate rate for each. Mixing them into one number makes it hard to see what is really changing.',
    },
    {
      q: 'Should I use visitors, sessions or clicks?',
      a: 'Use whichever count matches your conversions, and stay with it. Visitors count people, sessions count visits, and clicks count ad clicks, so each gives a different rate for the same sales. If your conversions come from an ad campaign, clicks often make sense. For a whole website, visitors or sessions usually do. The maths is the same either way.',
    },
  ],
};
