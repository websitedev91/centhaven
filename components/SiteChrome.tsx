import type { ReactNode } from 'react';
import { Analytics } from './Analytics';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

/**
 * Skip link + header + main + footer + Google Tag Manager. Used by app/(site)/layout.tsx and the
 * root 404 page. Embeds (app/(embed)) don't use it, so they never load GTM.
 */
export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-field focus:bg-surface focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <Analytics />
    </>
  );
}
