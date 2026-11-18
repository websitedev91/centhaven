import type { ToolMeta } from '@/lib/tool-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /freelance/website-design-cost-calculator.
 * Change the keyword map first, then this file and content.mdx (CLAUDE.md SEO rules).
 */
export const meta: ToolMeta = {
  slug: 'website-design-cost-calculator',
  category: 'freelance',
  primaryKeyword: 'website design cost calculator',
  secondaryKeywords: ['how much to charge for a website', 'web design pricing calculator', 'website cost estimate'],
  title: 'Website Design Cost Calculator – Estimate a Web Project',
  description:
    'Estimate what a website should cost by picking pages, features and design level. A practical pricing guide for clients and freelance web designers.',
  h1: 'Website Design Cost Calculator',
  subtitle:
    'Estimate a website project from the pages, design level and features it needs, priced at your own hourly rate, with a buffer and optional monthly maintenance.',
  risk: 'green',
  relatedTools: ['freelance-quote-generator', 'hourly-rate-calculator', 'freelance-invoice-generator'],
  // Keyword-map questions first (exact, same order), then 2 more from the spec.
  faq: [
    {
      q: 'How much does a website cost?',
      a: 'It depends on the number of pages, the design level, the features and the rate of the person building it. A small template site and a custom online shop can differ many times over. Rather than trust a single average, estimate the hours each part takes and multiply by the rate you charge or are being quoted. This calculator does that and shows where the hours go.',
    },
    {
      q: 'How much should I charge to design a website?',
      a: 'Start from your own hourly rate, one that covers your income, tax, costs and unpaid time. Estimate the hours for setup, each page, each feature and any copywriting, then add a buffer for feedback and project management. Hours times rate gives a fair project price. Quote that as one fixed price for clearly listed deliverables, and keep the hours as your private working.',
    },
    {
      q: 'What affects website design cost?',
      a: 'The biggest factors are the number of unique pages, how custom the design is and the features: an online shop, bookings or several languages each add a lot of work. Who writes the content matters too, as does the number of revision rounds. Finally, the rate of the designer or agency changes the price as much as the scope does, which is why this tool uses your own rate.',
    },
    {
      q: 'Is a template site cheaper than custom design?',
      a: 'Usually, yes. A template gives you a tested layout, so most of the design work is already done and the time goes into adapting it and adding content. A custom design starts from a blank page, with more planning, drafts and feedback rounds. In this calculator, Template halves the page hours and Premium adds half again, but you can set the hours per page to match how you work.',
    },
    {
      q: 'Should I charge monthly for website maintenance?',
      a: 'Many freelancers do, because sites need updates, backups, security patches and small edits after launch. A monthly plan turns that work into steady income and stops small requests from becoming free favors. Agree how many hours are included, what counts as maintenance and what is new work. Enter the hours here to see the monthly fee, or price a fuller plan with the retainer fee calculator.',
    },
    {
      q: 'How many hours does a website take?',
      a: 'It varies with the scope and with how fast you work, so track your own projects and use those numbers. A small site with a few pages, a contact form and basic SEO might take a few dozen hours from first call to launch. Add an online shop, a booking system or a second language and it can grow several times over. The defaults here are only a starting point.',
    },
    {
      q: 'Should I charge per page or per project?',
      a: 'Per-page pricing is easy to explain, but pages are not equal: a home page or a shop takes far longer than a simple contact page. Many freelancers estimate by page and feature behind the scenes, as this calculator does, then quote one fixed project price. That protects you from arguments about what counts as a page and lets the client compare quotes simply.',
    },
  ],
};
