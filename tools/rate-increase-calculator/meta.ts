import type { ToolMeta } from '@/lib/tool-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /freelance/rate-increase-calculator.
 * Change the keyword map first, then this file and content.mdx (CLAUDE.md SEO rules).
 */
export const meta: ToolMeta = {
  slug: 'rate-increase-calculator',
  category: 'freelance',
  primaryKeyword: 'rate increase calculator',
  secondaryKeywords: [
    'how much to raise freelance rates',
    'price increase calculator',
    'will i lose clients if i raise my rates',
  ],
  title: 'Rate Increase Calculator – Should You Raise Your Rates?',
  description:
    'See how a rate increase changes your monthly income, even if some clients leave. Find how much work you can lose and still earn the same as today.',
  h1: 'Rate Increase Calculator',
  subtitle: 'See what raising your rate does to your monthly income, even if some work leaves, and how much you could lose and still break even.',
  risk: 'green',
  relatedTools: ['hourly-rate-calculator', 'utilization-rate-calculator', 'retainer-fee-calculator'],
  affiliateId: 'invoicing-software',
  // Keyword-map questions first (exact, same order), then 2 more from the spec.
  faq: [
    {
      q: 'How much should I raise my rates?',
      a: 'Many freelancers raise their rates by a modest amount every year, and by more when demand is high or their skills have grown. Rather than picking a number out of the air, test a few increases here with a realistic share of work you might lose. If you still earn more after losing that work, the increase is probably safe. Your own clients and market matter most.',
    },
    {
      q: 'How often should freelancers raise their rates?',
      a: 'Review your rates at least once a year, and whenever your costs rise or you start offering a new kind of work. Many freelancers raise prices for new clients first, because they have no old rate to compare with, then update existing clients once a year with notice. Small regular increases are usually easier for clients to accept than one big jump after several years.',
    },
    {
      q: 'Will I lose clients if I raise my rates?',
      a: 'You might lose some, and that is not always bad. Clients who leave over a fair increase are often the most price-sensitive ones. The break-even figure shows how much work you can lose and still earn the same. With a 20% increase you can lose about one hour in six and break even, and you get that time back for better-paid work or rest.',
    },
    {
      q: 'How do I tell clients about a rate increase?',
      a: 'Tell them in writing, a month or more before the new rate starts. Keep it short and confident: give the new rate, the date it applies and, if you like, one line about the value you bring. You do not need to apologise or justify every detail. For long-term clients, you can keep the old rate for work already agreed so nobody feels surprised.',
    },
    {
      q: 'What is the break-even point for a price increase?',
      a: 'It is the share of work you can lose before a higher rate earns you less than you earn today. The formula is the increase divided by one plus the increase. A 20% increase breaks even at 16.67% of work lost, and a 10% increase at 9.09%. If you expect to lose less than that, the increase pays off and also frees up some of your time.',
    },
    {
      q: 'Should I raise rates for existing clients?',
      a: 'Usually yes, but with care. Existing clients already know and trust your work, so they are often less likely to leave than you fear. Give them more notice than new clients, and think about a smaller step for those who send you steady work. If you never raise rates for existing clients, your oldest work slowly becomes your worst-paid work as your costs go up.',
    },
    {
      q: 'Is a bigger increase always better?',
      a: 'No. A bigger increase gives you more room to lose work and still come out ahead, but it can also push more clients away. If the share of work you lose grows faster than your rate, your income falls. Use "Compare two plans" to test, for example, a 10% rise that keeps nearly everyone against a 25% rise that loses more of your clients.',
    },
  ],
};
