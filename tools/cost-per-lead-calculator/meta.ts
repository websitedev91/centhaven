import type { ToolMeta } from '@/lib/tool-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /marketing/cost-per-lead-calculator.
 * Change the keyword map first, then this file and content.mdx (CLAUDE.md SEO rules).
 * Pure maths: no industry cost-per-lead figures.
 */
export const meta: ToolMeta = {
  slug: 'cost-per-lead-calculator',
  category: 'marketing',
  primaryKeyword: 'cost per lead calculator',
  secondaryKeywords: ['cpl calculator', 'how to calculate cost per lead', 'lead conversion rate calculator'],
  title: 'Cost Per Lead Calculator – CPL and Cost Per Customer',
  description:
    'Divide your campaign spend by the leads it brought in to find your cost per lead. Add your lead-to-customer rate to see what each new customer really costs.',
  h1: 'Cost Per Lead Calculator',
  subtitle: 'See what each lead costs you, and what each paying customer costs once you know how many leads buy.',
  risk: 'green',
  relatedTools: ['cac-calculator', 'roas-calculator', 'break-even-calculator'],
  // Keyword-map questions first (exact, same order), then 2 more.
  faq: [
    {
      q: 'How do you calculate cost per lead?',
      a: 'Divide what you spent on a campaign by the number of leads it brought in. If you spent $2,000 and got 80 leads, your cost per lead is $2,000 ÷ 80 = $25. Use spend and leads from the same campaign and the same dates, so you know exactly which money produced which leads. Then you can compare channels fairly.',
    },
    {
      q: 'What counts as a lead?',
      a: 'A lead is anyone who shows interest and gives you a way to follow up: a contact form, a quote request, a call, a free trial or a newsletter sign-up. What matters is that you count the same thing every time. Decide what a lead means for your business, write it down and use that definition for every channel you compare.',
    },
    {
      q: 'How do I turn cost per lead into cost per customer?',
      a: 'Add your lead-to-customer rate, the share of leads who go on to buy. If 10 out of every 100 leads become customers, 80 leads give you 8 customers, and $2,000 of spend means each customer cost $250. The calculator shows this when you enter a rate. When the maths gives a part customer, it shows an average, such as about 7.5 customers.',
    },
    {
      q: 'How can I lower my cost per lead?',
      a: 'Move budget to the channels and ads that bring leads most cheaply, and test new headlines, offers and landing pages. A clearer form with fewer fields often lifts sign-ups. Target the people most likely to be interested rather than the widest audience. Use Compare two channels in the calculator to see how a change in spend, leads or rate would affect your costs.',
    },
    {
      q: 'Is a low cost per lead always better?',
      a: 'Not always. Cheap leads that rarely buy can cost more per customer than expensive leads that often do. A channel with a $40 cost per lead and a 20% close rate costs $200 per customer, while $25 leads that close at 5% cost $500 each. Compare channels by cost per customer, not only cost per lead, before you move your budget.',
    },
    {
      q: 'What is the difference between cost per lead and CAC?',
      a: 'Cost per lead counts every enquiry or sign-up. Customer acquisition cost counts only the leads who become paying customers, and usually adds sales costs such as salaries and commissions. For the same spend, CAC is always higher than cost per lead. Use cost per lead to compare campaigns quickly, and CAC to see what growth really costs the whole business.',
    },
    {
      q: 'How do I find my lead-to-customer rate?',
      a: 'Count the leads from a period, then count how many of them became paying customers. Divide customers by leads and multiply by 100. If 120 leads produced 9 customers, your rate is 7.5%. A CRM, a spreadsheet or even a notebook works. If leads take weeks to decide, wait until most have made up their minds before you count.',
    },
  ],
};
