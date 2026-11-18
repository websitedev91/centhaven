import type { ToolMeta } from '@/lib/tool-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /freelance/freelance-invoice-generator.
 * Change the keyword map first, then this file and content.mdx (CLAUDE.md SEO rules).
 */
export const meta: ToolMeta = {
  slug: 'freelance-invoice-generator',
  category: 'freelance',
  primaryKeyword: 'free invoice generator for freelancers',
  secondaryKeywords: ['freelance invoice template', 'multi currency invoice generator', 'invoice generator with gst'],
  title: 'Free Invoice Generator for Freelancers – PDF Download',
  description:
    'Create a professional invoice in any currency and download it as a PDF. Add your logo, tax lines and payment details. Free, no sign-up needed.',
  h1: 'Free Invoice Generator for Freelancers',
  subtitle:
    "Create a professional invoice in your client's currency, with your logo, a tax line, payment details and amount paid, then download it as a PDF. Free, no sign-up.",
  risk: 'green',
  relatedTools: ['freelance-quote-generator', 'payoneer-vs-wise-fees', 'hourly-rate-calculator'],
  affiliateId: 'invoicing-software',
  document: true,
  // Keyword-map questions first (exact, same order), then 3 more from the spec.
  faq: [
    {
      q: 'What should a freelance invoice include?',
      a: "Include your name or business, contact details and any tax or business ID, the client's details, a unique invoice number and the issue date. List the work with quantities, rates and amounts, then any discount, tax and the total. Add the due date or payment terms and how to pay you. A clear invoice gets paid faster because the client has nothing to ask about.",
    },
    {
      q: 'How do I invoice a client in another currency?',
      a: "Pick the client's currency at the top, and every amount on the invoice uses it. Agree the currency before you start work, and check what it will cost you to receive the money, because banks and payment apps can charge transfer and conversion fees. Put payment details that suit that currency on the invoice, such as an account that can receive it without an expensive conversion.",
    },
    {
      q: 'Do I need to add tax to my invoice?',
      a: 'That depends on where you and your client are, and whether you are registered for a sales tax such as GST or VAT. If you are, there are usually rules on when to charge it and how to show it. This is a simple invoice. Some countries require extra details on tax invoices (for example GST in India or VAT in the UK/EU). Check your local rules.',
    },
    {
      q: 'What payment terms should I use?',
      a: 'Many freelancers use 14 or 30 days, and some ask for payment on receipt for small jobs. Shorter terms help your cash flow, but big clients may have fixed payment cycles you have to accept. Whatever you choose, agree it before the work starts, show the due date as a real date on the invoice, and for larger projects ask for a deposit up front.',
    },
    {
      q: 'Is this invoice generator really free?',
      a: 'Yes. There is no sign-up, no limit on the number of invoices and no watermark or CentHaven branding on the PDF. You can add your logo, use any of the six currencies and download as many invoices as you like. The page may show a clearly marked partner offer, which never changes what the generator does or what it costs you.',
    },
    {
      q: 'Is my invoice saved or sent anywhere?',
      a: 'No. Everything you type, including your logo and bank details, stays in this browser on this device, so you can close the page and carry on later. Nothing you type is uploaded to CentHaven or anyone else, and nothing is sent to your client: you download the PDF and send it yourself. Use Clear form to delete the saved invoice from this device.',
    },
    {
      q: 'Can I add my logo?',
      a: 'Yes. Click Add a logo and pick a PNG, JPG or SVG image of up to 500 KB. It appears at the top of the invoice and on the PDF. The image is read by your browser and kept with your saved invoice on this device only; it is never uploaded. Start a new invoice keeps the logo, so you only add it once.',
    },
    {
      q: "What's the difference between an invoice and a tax invoice?",
      a: 'An invoice asks for payment. A tax invoice is a specific document that tax-registered businesses in some countries must issue, with details set by law, such as registration numbers and how the tax is shown. This is a simple invoice. Some countries require extra details on tax invoices (for example GST in India or VAT in the UK/EU). Check your local rules.',
    },
  ],
};
