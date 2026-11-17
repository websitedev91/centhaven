import type { Metadata } from 'next';
import { site } from '@/config/site';
import { OG_HOME } from './og-paths';

export interface FaqItem {
  q: string;
  a: string;
}

export interface Crumb {
  name: string;
  path: string; // site-relative, e.g. '/freelance'
}

export function absoluteUrl(path: string): string {
  if (path === '/' || path === '') return site.url;
  return `${site.url}${path.startsWith('/') ? path : `/${path}`}`;
}

export function buildMetadata(opts: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  /** Site-relative share image; defaults to the homepage image (lib/og-paths.ts). */
  ogImage?: string;
}): Metadata {
  const url = absoluteUrl(opts.path);
  const image = absoluteUrl(opts.ogImage ?? OG_HOME);
  const images = [{ url: image, width: 1200, height: 630, alt: opts.title }];
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    robots: opts.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: 'website',
      url,
      siteName: site.name,
      title: opts.title,
      description: opts.description,
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: opts.title,
      description: opts.description,
      images: [image],
    },
  };
}

/** Authorship is the brand only (Puru, 2026-11-18): author and publisher are never a Person. */
export function organizationRef() {
  return { '@type': 'Organization', name: site.name, url: site.url } as const;
}

export function webApplicationJsonLd(opts: { name: string; description: string; path: string; dateModified: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: opts.name,
    description: opts.description,
    url: absoluteUrl(opts.path),
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    isAccessibleForFree: true,
    dateModified: opts.dateModified,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    author: organizationRef(),
    publisher: organizationRef(),
  };
}

export function breadcrumbJsonLd(crumbs: readonly Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

export function faqJsonLd(faqs: readonly FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

/** Category hub: CollectionPage with an ItemList of its live tools (SEO.md §4). */
export function collectionPageJsonLd(opts: {
  name: string;
  description: string;
  path: string;
  items: readonly { name: string; path: string }[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: opts.name,
    description: opts.description,
    url: absoluteUrl(opts.path),
    isPartOf: { '@type': 'WebSite', name: site.name, url: site.url },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: opts.items.length,
      itemListElement: opts.items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        url: absoluteUrl(item.path),
      })),
    },
  };
}

/** Serialise JSON-LD safely for a <script> tag (escapes `<` so content can't close the tag). */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
