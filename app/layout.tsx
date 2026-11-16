import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Schibsted_Grotesk } from 'next/font/google';
import { Analytics } from '@/components/Analytics';
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
  description:
    'Free money and work calculators for freelancers and remote workers. Smart tools to earn, save and grow.',
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FFFFFF',
};

/** html, font and analytics only. Header/footer live in app/(site)/layout.tsx so embeds can omit them. */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={schibsted.variable}>
      <body className="flex min-h-screen flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
