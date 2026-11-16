import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { JsonLd } from '@/components/JsonLd';
import { getCategory } from '@/config/site';
import { liveCategories, liveToolsInCategory, toolPath } from '@/lib/registry';
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo';
import { PLACEHOLDER, withPlaceholder } from '@/lib/static-params';

export const dynamicParams = false;

type Params = { category: string };

/** Only categories with at least one live tool get a hub page. */
export function generateStaticParams(): Params[] {
  return withPlaceholder(
    liveCategories().map((category) => ({ category })),
    { category: PLACEHOLDER },
  );
}

function resolve(slug: string) {
  const category = getCategory(slug);
  const tools = liveToolsInCategory(slug);
  if (!category || tools.length === 0) return undefined;
  return { category, tools };
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const r = resolve((await params).category);
  if (!r) return { title: 'Not found', robots: { index: false } };
  return buildMetadata({
    title: `${r.category.name} Calculators – Free Tools | CentHaven`,
    description: r.category.description,
    path: `/${r.category.slug}`,
  });
}

// Placeholder hub (cards only). Full hub with 300–500 word intro is Day 2 work (PRD §13).
export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const r = resolve((await params).category);
  if (!r) notFound();
  const { category, tools } = r;
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: category.name, path: `/${category.slug}` },
  ];
  return (
    <div className="wrap py-6">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs crumbs={crumbs} />
      <h1 className="mt-4 text-3xl sm:text-4xl">{category.name} calculators</h1>
      <p className="mt-2 measure text-lg text-ink-muted">{category.description}</p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((t) => (
          <li key={t.slug}>
            <Link href={toolPath(t)} className="block h-full rounded-panel border border-line p-5 no-underline hover:border-haven">
              <span className="text-lg font-semibold text-ink">{t.title}</span>
              <span className="mt-1 block text-sm text-ink-muted">{t.meta.subtitle}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
