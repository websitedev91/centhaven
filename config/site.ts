export const site = {
  name: 'CentHaven',
  domain: 'centhaven.com',
  url: 'https://centhaven.com',
  tagline: 'Smart tools to earn, save and grow.',
  author: 'Purushothaman',
  /** TODO(Puru): set the public contact email before launch. */
  contactEmail: '',
  gaMeasurementId: process.env.NEXT_PUBLIC_GA_ID ?? '',
  disclaimer: 'For estimates only. Not financial, tax or legal advice. Check with a qualified professional.',
  affiliateDisclosure: "We may earn a commission if you sign up. It doesn't change our results.",
} as const;

export interface CategoryInfo {
  slug: string;
  name: string;
  description: string;
}

export const categories: readonly CategoryInfo[] = [
  {
    slug: 'freelance',
    name: 'Freelance',
    description: 'Rates, pricing and income tools for freelancers and remote workers.',
  },
  {
    slug: 'fees',
    name: 'Payment & Platform Fees',
    description: 'See what PayPal, Wise, Upwork and other platforms really cost you.',
  },
];

export function getCategory(slug: string): CategoryInfo | undefined {
  return categories.find((c) => c.slug === slug);
}
