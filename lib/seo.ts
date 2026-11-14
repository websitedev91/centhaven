import type { Metadata } from 'next';
import { site } from '@/config/site';

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

/** `{Tool name} – Free Calculator | CentHaven` (CLAUDE.md content rules). */
export function toolTitle(toolName: string, kind: 'Calculator' | 'Generator' | 'Checker' = 'Calculator'): string {
  const stripped = toolName.replace(new RegExp(`\\s+${kind}$`, 'i'), '');
  return `${stripped} – Free ${kind} | ${site.name}`;
}

export function buildMetadata(opts: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  ogImage?: string;
}): Metadata {
  const url = absoluteUrl(opts.path);
  const images = opts.ogImage ? [{ url: opts.ogImage, width: 1200, height: 630 }] : undefined;
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
      images: opts.ogImage ? [opts.ogImage] : undefined,
    },
  };
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
    author: { '@type': 'Person', name: site.author },
    publisher: { '@type': 'Organization', name: site.name, url: site.url },
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

/** Serialise JSON-LD safely for a <script> tag (escapes `<` so content can't close the tag). */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
