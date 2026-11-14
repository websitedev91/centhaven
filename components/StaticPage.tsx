import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getStaticPage, site, type StaticPageHref } from '@/config/site';
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo';
import { Breadcrumbs } from './Breadcrumbs';
import { JsonLd } from './JsonLd';
import { LastUpdated } from './LastUpdated';

export function staticPageMetadata(href: StaticPageHref, description: string): Metadata {
  const page = getStaticPage(href);
  return buildMetadata({ title: `${page.label} | ${site.name}`, description, path: href });
}

/** Shared layout for About, Methodology, legal pages and Contact. */
export function StaticPage(props: { href: StaticPageHref; title?: string; intro?: string; children: ReactNode }) {
  const page = getStaticPage(props.href);
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: page.label, path: page.href },
  ];
  return (
    <article className="mx-auto max-w-6xl px-4 pb-12 pt-6">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs crumbs={crumbs} />
      <header className="mt-4">
        <h1 className="text-3xl sm:text-4xl">{props.title ?? page.label}</h1>
        {props.intro ? <p className="mt-2 max-w-[65ch] text-lg text-muted">{props.intro}</p> : null}
      </header>
      <div className="prose-ch mt-8">{props.children}</div>
      <div className="mt-10">
        <LastUpdated date={page.updated} />
      </div>
    </article>
  );
}
