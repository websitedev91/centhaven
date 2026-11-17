/**
 * Analytics events (PRD §9), sent to Google Tag Manager's dataLayer as `{ event, ...params }`.
 * In GTM, use a Custom Event trigger with the event name (e.g. `calculate`) to forward them to GA4.
 * Safe to call when GTM is not loaded (no-op).
 */

export type AnalyticsEvent =
  | 'calculate'
  | 'affiliate_click'
  | 'share_click'
  | 'print_click'
  | 'embed_copy'
  | 'scenario_compare'
  | 'download_csv';

type Params = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function track(event: AnalyticsEvent, params: Params = {}): void {
  if (typeof window === 'undefined' || !Array.isArray(window.dataLayer)) return;
  window.dataLayer.push({ event, ...params });
}
