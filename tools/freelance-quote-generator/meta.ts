import type { ToolMeta } from '@/lib/tool-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /freelance/freelance-quote-generator.
 * Change the keyword map first, then this file and content.mdx (CLAUDE.md SEO rules).
 */
export const meta: ToolMeta = {
  slug: 'freelance-quote-generator',
  category: 'freelance',
  primaryKeyword: 'freelance quote generator',
  secondaryKeywords: ['project quote calculator', 'free estimate generator for freelancers', 'freelance project price calculator'],
  title: 'Freelance Quote Generator – Create a Project Quote',
  description:
    'Build a clear project quote with tasks, hours and rates, then download it as a PDF. Free quote and estimate maker for freelancers and small agencies.',
  h1: 'Freelance Quote Generator',
  subtitle:
    'Build a clear project quote with line items, contingency, discount and tax, then download it as a PDF. Free, no sign-up, saved only in your browser.',
  risk: 'green',
  relatedTools: ['freelance-invoice-generator', 'website-design-cost-calculator', 'hourly-rate-calculator'],
  affiliateId: 'invoicing-software',
  document: true,
  // Keyword-map questions first (exact, same order), then 2 more from the spec.
  faq: [
    {
      q: 'How do I write a freelance quote?',
      a: "Start with your details and the client's, a quote number, the date and how long the quote is valid. List the work as clear deliverables, each with a quantity or hours and a rate. Add any contingency, discount or tax, then the total. Finish with what is not included, the number of revision rounds and your payment terms, so the client knows exactly what they are agreeing to.",
    },
    {
      q: 'What is the difference between a quote and an estimate?',
      a: 'A quote is a fixed price for a defined piece of work: if the client accepts it, that is what they pay, unless the scope changes. An estimate is your best guess and can change as the work goes on. Clients usually prefer quotes because they know the cost up front. If the scope is unclear, send an estimate or quote a smaller first stage instead.',
    },
    {
      q: 'How long should a quote be valid?',
      a: "Thirty days is a common choice, and it is the default here. A validity date protects you if the client comes back months later, when your rates, your availability or the costs behind the work may have changed. For short, simple jobs 14 days can be enough. For large projects that need approval inside the client's company, 60 or 90 days may be more realistic.",
    },
    {
      q: 'Should I add a buffer to my quote?',
      a: 'Yes, in some form. Projects nearly always take longer than planned because of feedback rounds, delays and small changes. You can build the extra time into each line item, which keeps the quote clean, or show it as a separate contingency line, which is open about the risk. Either way, also limit the number of revision rounds, so the buffer is not used up by endless changes.',
    },
    {
      q: 'How do I price a freelance project?',
      a: 'Estimate the hours for each part of the work, multiply by an hourly rate that covers your income, tax, costs and unpaid time, then add a buffer. Compare the result with the value of the work to the client and with what you know of the market. For websites, the website design cost calculator does the hours math for you, and the hourly rate calculator helps you set the rate.',
    },
    {
      q: 'Is my quote saved or sent anywhere?',
      a: "No. Everything you type stays in this browser on this device, so you can close the page and carry on later. Nothing you type is uploaded to CentHaven or anyone else, and nothing is sent to your client: you download the PDF and send it yourself. To remove the saved quote, use Clear form. Clearing your browser's site data removes it too.",
    },
    {
      q: 'Do I need to add tax to a quote?',
      a: 'It depends on where you work and whether you are registered for a sales tax such as GST or VAT. This is a simple quote. If you add tax, some countries have rules on how it must be shown (for example GST in India or VAT in the UK/EU). Check your local rules. Enter your own label and rate; the tool never suggests one, and the tax line starts at 0%.',
    },
  ],
};
