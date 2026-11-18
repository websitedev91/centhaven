import type { ToolMeta } from '@/lib/tool-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /freelance/retainer-fee-calculator.
 * Change the keyword map first, then this file and content.mdx (CLAUDE.md SEO rules).
 */
export const meta: ToolMeta = {
  slug: 'retainer-fee-calculator',
  category: 'freelance',
  primaryKeyword: 'retainer fee calculator',
  secondaryKeywords: ['monthly retainer pricing calculator', 'how to price a retainer', 'retainer agreement pricing'],
  title: 'Retainer Fee Calculator – Price a Monthly Retainer',
  description:
    "Price a monthly retainer from the hours you'll commit, your rate and any discount. Compare the retainer with hourly billing before you send a quote.",
  h1: 'Retainer Fee Calculator',
  subtitle: 'Price a monthly retainer from your hourly rate, the hours you commit and any discount, and see what it is worth if the client uses fewer hours.',
  risk: 'green',
  relatedTools: ['hourly-rate-calculator', 'freelance-quote-generator', 'rate-increase-calculator'],
  affiliateId: 'invoicing-software',
  rates: [],
  // Keyword-map questions first (exact, same order), then 2 more from the spec.
  faq: [
    {
      q: 'How do I price a monthly retainer?',
      a: 'Start with your normal hourly rate and the number of hours you will keep free for the client each month. Multiply them to get the hourly value, then decide whether to give a discount for the guaranteed work. The result is your monthly fee. Check the effective hourly rate too, because clients often use fewer hours than they pay for.',
    },
    {
      q: 'Should a retainer be cheaper than hourly rates?',
      a: 'It can be, but it does not have to be. A retainer gives you predictable income and saves time on sales and invoicing, so a small discount can be fair. But you are also reserving time the client may not use, which has value too. Many freelancers keep the discount small, or offer none and add priority response instead.',
    },
    {
      q: 'What happens to unused retainer hours?',
      a: 'That depends on your agreement, so write the rule down before work starts. Common choices are that unused hours expire at the end of each month, or that a limited number roll over to the next month only. Expiring hours are simpler for you to plan around. Whatever you choose, the client should know it before signing.',
    },
    {
      q: 'What should a retainer include?',
      a: 'Set out the number of hours or the deliverables each month, what kind of work is covered, how quickly you will respond, how requests are made and what happens to unused hours. Add the monthly fee, the payment date, the length of the agreement and the notice period to end it. Clear terms prevent arguments about what was included.',
    },
    {
      q: 'Retainer vs project pricing?',
      a: 'Project pricing suits work with a clear start, end and deliverable, such as a new website or a report. A retainer suits ongoing work that never really finishes, such as maintenance, content, advice or support. Many freelancers do both: a project to start a relationship, then a retainer to keep looking after the client afterwards.',
    },
    {
      q: 'How many hours should a retainer include?',
      a: 'Base it on the work the client really needs each month, not on the size of the fee you would like. Look at past months if you have worked with them before. Leave yourself room for other clients. It is easier to raise the hours later than to deliver more than you promised every month at the same price.',
    },
    {
      q: 'Should I charge the retainer up front?',
      a: 'Many freelancers invoice retainers at the start of each month, before the work, because the fee pays for reserved time rather than completed tasks. Charging in advance also protects you if the client stops paying. Agree the payment date and what happens if a payment is late in the agreement, and keep the terms the same every month.',
    },
  ],
};
