/** Internal links from the app development cost calculator UI. Must point at live tools (lib/registry.test.ts). */
export const HOURLY_RATE_TOOL = { slug: 'hourly-rate-calculator', path: '/freelance/hourly-rate-calculator' } as const;
/** "Turn this into a quote" (plain link, no pre-fill; the quote keeps nothing in the URL). */
export const QUOTE_TOOL = { slug: 'freelance-quote-generator', path: '/freelance/freelance-quote-generator' } as const;
/** Lead box "Get a quote": fixed subject only, never the user's numbers. */
export const LEAD_MAILTO = 'mailto:info@centhaven.com?subject=App%20quote%20request';
