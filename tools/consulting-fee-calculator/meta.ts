import type { ToolMeta } from '@/lib/tool-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /freelance/consulting-fee-calculator.
 * Change the keyword map first, then this file and content.mdx (CLAUDE.md SEO rules).
 */
export const meta: ToolMeta = {
  slug: 'consulting-fee-calculator',
  category: 'freelance',
  primaryKeyword: 'consulting fee calculator',
  secondaryKeywords: ['consulting rate calculator', 'how much to charge for consulting', 'consultant hourly rate calculator'],
  title: 'Consulting Fee Calculator – Set Your Consulting Rate',
  description:
    'Calculate a consulting rate that covers your income goal, overheads, tax and unbilled time. Get hourly, daily and project fees in one place.',
  h1: 'Consulting Fee Calculator',
  subtitle: 'Work out the hourly, daily and project fee that covers your income goal, tax, overheads and unbilled days, plus a profit margin.',
  risk: 'green',
  relatedTools: ['hourly-rate-calculator', 'day-rate-to-salary-calculator', 'retainer-fee-calculator'],
  affiliateId: 'invoicing-software',
  // Keyword-map questions first (exact, same order), then 2 more from the spec.
  faq: [
    {
      q: 'How much should a consultant charge per hour?',
      a: 'Enough to cover the income you want to keep, the tax on it, your overheads and the days you cannot bill, plus a margin. Work out that number from the bottom up rather than copying someone else’s rate. Then compare it with what clients in your field pay. If the market pays more, charge more; if it pays less, look for higher-value work.',
    },
    {
      q: 'How do consultants calculate their fees?',
      a: 'Most start from a yearly income goal. They add tax and business overheads, then divide by the hours they can realistically bill, which is far fewer than the hours they work. On top of that cost rate they add a profit margin. The hourly rate then becomes a day rate or a fixed project price, depending on how the client prefers to buy.',
    },
    {
      q: 'Hourly vs project vs retainer consulting fees?',
      a: 'Hourly fees are simple and protect you when the scope is unclear. Project fees reward you for working efficiently and give clients a fixed budget, so price them from your hourly rate and estimated hours plus a buffer. Retainers suit ongoing advice: the client pays a monthly fee for a set number of hours, which gives you steady, predictable income.',
    },
    {
      q: 'What overheads should consultants include?',
      a: 'Include everything the business pays for over a year: software and subscriptions, a laptop and phone, professional insurance, accounting fees, travel that clients do not reimburse, training and certifications, marketing, a website and any office or coworking costs. Spread one-off purchases over their useful life. Missing overheads quietly reduce what you take home from every hour you bill.',
    },
    {
      q: 'How do I raise my consulting rate?',
      a: 'Start with new clients, who have no old rate to compare with. For existing clients, give written notice a month or more ahead and keep the message short and confident. Raising your rate is easier when you can point to results, a narrower specialism or higher demand. Our rate increase calculator shows how much work you could lose and still earn the same.',
    },
    {
      q: 'What profit margin should a consultant add?',
      a: 'There is no fixed number. In this calculator the margin is a share of the price: a 15% margin means 15% of every hour you bill is left after your pay, tax and overheads. It funds slow months, training, new equipment and growth. Many consultants start modestly and raise it as demand grows. Try a few values and check the rate still fits your market.',
    },
    {
      q: 'How many billable days does a consultant have?',
      a: 'Far fewer than the roughly 260 weekdays in a year. Take off holidays, public holidays and sick days, then the days spent on sales, proposals, admin and learning, plus gaps between projects. What is left is your billable days. Track your own calendar for a few months and use that number, because guessing too high makes your rate too low.',
    },
  ],
};
