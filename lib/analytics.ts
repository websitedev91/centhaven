/** GA4 event helpers — PRD §9. Safe to call when GA is not loaded (no-op). */

export type AnalyticsEvent =
  | 'calculate'
  | 'affiliate_click'
  | 'share_click'
  | 'print_click'
  | 'embed_copy'
  | 'scenario_compare';

type Params = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (command: 'event' | 'config' | 'js', target: string | Date, params?: Params) => void;
    dataLayer?: unknown[];
  }
}

export function track(event: AnalyticsEvent, params: Params = {}): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', event, params);
}
