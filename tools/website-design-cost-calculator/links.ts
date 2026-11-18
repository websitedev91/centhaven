/** Internal links from the website design cost calculator UI. Must point at live tools (lib/registry.test.ts). */
export const HOURLY_RATE_TOOL = { slug: 'hourly-rate-calculator', path: '/freelance/hourly-rate-calculator' } as const;
/** "Turn this into a quote" (spec: plain link, no pre-fill in v1; the quote keeps nothing in the URL). */
export const QUOTE_TOOL = { slug: 'freelance-quote-generator', path: '/freelance/freelance-quote-generator' } as const;
/** Lead box "Get a quote" (Puru, 2026-11-18): fixed subject only, never the user's numbers. */
export const LEAD_MAILTO = 'mailto:info@centhaven.com?subject=Website%20quote%20request';
