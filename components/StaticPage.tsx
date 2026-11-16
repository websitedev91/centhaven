import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getStaticPage, site, type StaticPageHref } from '@/config/site';
import { absoluteUrl, breadcrumbJsonLd, buildMetadata } from '@/lib/seo';
import { Breadcrumbs } from './Breadcrumbs';
import { JsonLd } from './JsonLd';
import { LastUpdated } from './LastUpdated';

export function staticPageMetadata(href: StaticPageHref, description: string): Metadata {
  const page = getStaticPage(href);
  return buildMetadata({ title: `${page.label} | ${site.name}`, description, path: href });
}

/**
 * Shared layout for About, Methodology, legal pages and Contact (DESIGN.md §9): a single 68ch
 * column, clear headings and a "Last updated" date. JSON-LD per SEO.md §4: AboutPage for About,
 * WebPage for the rest, plus BreadcrumbList.
 */
export function StaticPage(props: { href: StaticPageHref; title?: string; intro?: string; children: ReactNode }) {
  const page = getStaticPage(props.href);
  const title = props.title ?? page.label;
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: page.label, path: page.href },
  ];
  return (
    <article className="wrap pb-section pt-6">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': page.href === '/about' ? 'AboutPage' : 'WebPage',
          name: title,
          url: absoluteUrl(page.href),
          dateModified: page.updated,
          isPartOf: { '@type': 'WebSite', name: site.name, url: site.url },
        }}
      />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs crumbs={crumbs} />
      <header className="mt-6 measure">
        <h1 className="type-h1">{title}</h1>
        {props.intro ? <p className="mt-3 text-[19px] leading-[30px] text-ink-muted">{props.intro}</p> : null}
      </header>
      <div className="prose-ch mt-10">{props.children}</div>
      <div className="mt-12 measure border-t border-line pt-6">
        <LastUpdated date={page.updated} />
      </div>
    </article>
  );
}
