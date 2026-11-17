import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Schibsted_Grotesk } from 'next/font/google';
import { site } from '@/config/site';
import './globals.css';

// DESIGN.md §3: one family, variable weight axis (400–900), latin only.
const schibsted = Schibsted_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-schibsted',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} – ${site.tagline}`, template: '%s' },
  description: site.homeDescription,
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FFFFFF',
};

/**
 * html and font only. Header, footer and Google Tag Manager live in SiteChrome (app/(site)/layout.tsx
 * and the 404), so /embed/* pages load none of them.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={schibsted.variable}>
      <body className="flex min-h-screen flex-col">
        {children}
      </body>
    </html>
  );
}
