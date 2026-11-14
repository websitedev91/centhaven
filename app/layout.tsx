import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { Analytics } from '@/components/Analytics';
import { site } from '@/config/site';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} – ${site.tagline}`, template: '%s' },
  description:
    'Free money and work calculators for freelancers and remote workers. Smart tools to earn, save and grow.',
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0F766E',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-field focus:bg-bg focus:px-3 focus:py-2"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
