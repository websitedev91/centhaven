import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { FaqList } from '@/components/FaqList';
import { ChevronRightIcon } from '@/components/icons';
import { JsonLd } from '@/components/JsonLd';
import { getCategory } from '@/config/site';
import { hubContent } from '@/lib/hub-content';
import { getHub } from '@/lib/hubs';
import { liveCategories, liveToolsInCategory, toolPath } from '@/lib/registry';
import { breadcrumbJsonLd, buildMetadata, collectionPageJsonLd, faqJsonLd } from '@/lib/seo';
import { ogHubPath } from '@/lib/og-paths';
import { PLACEHOLDER, withPlaceholder } from '@/lib/static-params';

export const dynamicParams = false;

type Params = { category: string };

/** Only categories with at least one live tool (and a hub entry) get a hub page. */
export function generateStaticParams(): Params[] {
  return withPlaceholder(
    liveCategories().map((category) => ({ category })),
    { category: PLACEHOLDER },
  );
}

function resolve(slug: string) {
  const category = getCategory(slug);
  const hub = getHub(slug);
  const Guide = hubContent[slug];
  const tools = liveToolsInCategory(slug);
  if (!category || !hub || !Guide || tools.length === 0) return undefined;
  return { category, hub, Guide, tools };
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const r = resolve((await params).category);
  if (!r) return { title: 'Not found', robots: { index: false } };
  return buildMetadata({ title: r.hub.title, description: r.hub.description, path: `/${r.category.slug}`, ogImage: ogHubPath(r.category.slug) });
}

/**
 * Category hub (DESIGN.md §9): H1 + short intro → tool index rows → 300–500 word guide → FAQ.
 * Title, meta and H1 come from the keyword map's hub entry. Works with one tool or many.
 */
export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const r = resolve((await params).category);
  if (!r) notFound();
  const { category, hub, Guide, tools } = r;
  const path = `/${category.slug}`;
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: category.name, path },
  ];

  return (
    <article className="wrap pb-section pt-6">
      <JsonLd
        data={collectionPageJsonLd({
          name: hub.h1,
          description: hub.description,
          path,
          items: tools.map((t) => ({ name: t.title, path: toolPath(t) })),
        })}
      />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      {hub.faq.length > 0 ? <JsonLd data={faqJsonLd(hub.faq)} /> : null}

      <Breadcrumbs crumbs={crumbs} />
      <header className="mt-6">
        <h1 className="type-h1 measure">{hub.h1}</h1>
        <p className="mt-3 measure text-[19px] leading-[30px] text-ink-muted">{hub.intro}</p>
      </header>

      <section aria-labelledby="tools-heading" className="mt-12">
        <h2 id="tools-heading" className="type-small font-[550] text-ink-muted">
          {tools.length} {tools.length === 1 ? 'calculator' : 'calculators'}
        </h2>
        <ul className="mt-3 border-t border-line">
          {tools.map((t) => (
            <li key={t.slug} className="border-b border-line">
              <Link
                href={toolPath(t)}
                className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-1 py-5 text-ink no-underline md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)_auto]"
              >
                <span className="type-h3 group-hover:text-haven">{t.title}</span>
                <span className="col-span-2 row-start-2 text-ink-muted md:col-span-1 md:row-start-auto">{t.meta.subtitle}</span>
                <ChevronRightIcon
                  className="col-start-2 row-start-1 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-haven md:col-start-auto md:row-start-auto"
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-section flex flex-col gap-section">
        <div className="prose-ch">
          <Guide />
        </div>
        <FaqList faqs={hub.faq} />
      </div>
    </article>
  );
}
