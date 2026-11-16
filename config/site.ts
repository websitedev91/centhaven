export const site = {
  name: 'CentHaven',
  domain: 'centhaven.com',
  url: 'https://centhaven.com',
  tagline: 'Smart tools to earn, save and grow.',
  author: 'Purushothaman',
  contactEmail: 'info@centhaven.com',
  gaMeasurementId: process.env.NEXT_PUBLIC_GA_ID ?? '',
  disclaimer: 'For estimates only. Not financial, tax or legal advice. Check with a qualified professional.',
  affiliateDisclosure: "We may earn a commission if you sign up. It doesn't change our results.",
} as const;

/**
 * Static pages (PRD §11). Header/footer/sitemap include only pages marked `built: true`, so we
 * never link to a 404. `updated` is shown on the page and used as sitemap lastmod.
 * `group` places the link in the footer's Company or Legal column (DESIGN.md §7).
 */
export const staticPages = [
  { href: '/methodology', label: 'Methodology', built: true, header: true, group: 'company', updated: '2026-11-14' },
  { href: '/about', label: 'About', built: true, header: true, group: 'company', updated: '2026-11-14' },
  { href: '/contact', label: 'Contact', built: true, header: false, group: 'company', updated: '2026-11-14' },
  { href: '/disclaimer', label: 'Disclaimer', built: true, header: false, group: 'legal', updated: '2026-11-14' },
  { href: '/privacy', label: 'Privacy', built: true, header: false, group: 'legal', updated: '2026-11-14' },
  { href: '/terms', label: 'Terms', built: true, header: false, group: 'legal', updated: '2026-11-14' },
  { href: '/affiliate-disclosure', label: 'Affiliate disclosure', built: true, header: false, group: 'legal', updated: '2026-11-14' },
] as const;

export type StaticPageHref = (typeof staticPages)[number]['href'];

export function getStaticPage(href: StaticPageHref) {
  return staticPages.find((p) => p.href === href)!;
}

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
  {
    slug: 'salary',
    name: 'Salary & Pay',
    description: 'Convert hourly pay to a salary, compare job offers and see what a pay change is worth.',
  },
  {
    slug: 'business',
    name: 'Small Business',
    description: 'Break-even, utilisation and other numbers that keep a small business or freelance practice healthy.',
  },
];

export function getCategory(slug: string): CategoryInfo | undefined {
  return categories.find((c) => c.slug === slug);
}
