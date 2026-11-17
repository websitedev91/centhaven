import type { ToolMeta } from '@/lib/tool-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /business/straight-line-depreciation-calculator.
 * Change the keyword map first, then this file and content.mdx (CLAUDE.md SEO rules).
 */
export const meta: ToolMeta = {
  slug: 'straight-line-depreciation-calculator',
  category: 'business',
  primaryKeyword: 'straight line depreciation calculator',
  secondaryKeywords: ['equipment depreciation calculator', 'depreciation schedule calculator', 'laptop depreciation'],
  title: 'Straight-Line Depreciation Calculator – Yearly Schedule',
  description:
    'Calculate straight-line depreciation for any asset and see a full year-by-year schedule. Enter cost, salvage value and useful life to start.',
  h1: 'Straight-Line Depreciation Calculator',
  subtitle: 'See how much an asset loses in value each year and its book value at the end of every year, using the straight-line method.',
  risk: 'green',
  relatedTools: ['break-even-calculator', 'utilization-rate-calculator', 'freelance-invoice-generator'],
  affiliateId: 'accounting-software',
  rates: [],
  // Keyword-map questions first (exact, same order), then 2 more from the spec.
  faq: [
    {
      q: 'What is straight-line depreciation?',
      a: 'It is the simplest way to spread the cost of an asset over the years you use it. You take the cost, subtract what it will be worth at the end, and divide the rest evenly across its useful life. The asset loses the same amount of value every full year, which makes it easy to plan and to explain in your accounts.',
    },
    {
      q: 'How do I calculate depreciation per year?',
      a: 'Subtract the salvage value from the cost to get the amount to depreciate, then divide by the useful life in years. A laptop that cost 1,500, will be worth 300 at the end and lasts 3 years loses 1,200 ÷ 3 = 400 a year. Divide the yearly figure by 12 if you want the amount per month instead.',
    },
    {
      q: 'What is salvage value?',
      a: 'Salvage value, also called residual or scrap value, is what you expect the asset to be worth when you stop using it, for example what you could sell it for second-hand. It is not depreciated, so the book value never falls below it. If the asset will be worth nothing at the end, enter zero and the whole cost is spread over its life.',
    },
    {
      q: 'How long is an asset\'s useful life?',
      a: 'It is how long you expect to use the asset in your business, not how long it could physically last. Laptops and phones are often used for a few years, vans and machinery for longer, and buildings for decades. Base it on your own experience and replacement plans. Your accountant may use different periods for tax, which is a separate calculation.',
    },
    {
      q: 'Straight-line vs declining balance?',
      a: 'Straight-line takes the same amount each full year. Declining balance takes a fixed percentage of the remaining value each year, so the amount is largest at the start and shrinks over time. Declining balance can better match assets that lose value quickly early on. Straight-line is simpler and is the method this calculator uses.',
    },
    {
      q: 'Is this the same as tax depreciation?',
      a: 'No. This calculator shows the straight-line accounting method. Tax depreciation follows each country’s own rules, such as MACRS in the US, capital allowances in the UK or the written-down value rates in India, and the amounts and timing can be quite different. Use this for planning and your own accounts, and check the tax side with an accountant.',
    },
    {
      q: 'Can I change the useful life later?',
      a: 'In accounting, you can revise an estimate such as useful life or salvage value when you have good reason, for example if you plan to keep an asset longer. The usual approach is to spread the remaining book value over the new remaining life from that point on, rather than redoing past years. Your accountant can tell you how to record it.',
    },
  ],
};
