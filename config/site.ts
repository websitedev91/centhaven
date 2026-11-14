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

/**
 * Static pages (PRD §11). Header/footer link only to pages marked `built: true`, so we never
 * link to a 404. Flip each to true when its page is added (Day 2).
 */
export const staticPages = [
  { href: '/about', label: 'About', built: false, header: true },
  { href: '/methodology', label: 'Methodology', built: false, header: true },
  { href: '/disclaimer', label: 'Disclaimer', built: false, header: false },
  { href: '/privacy', label: 'Privacy', built: false, header: false },
  { href: '/terms', label: 'Terms', built: false, header: false },
  { href: '/affiliate-disclosure', label: 'Affiliate disclosure', built: false, header: false },
  { href: '/contact', label: 'Contact', built: false, header: false },
] as const;

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
