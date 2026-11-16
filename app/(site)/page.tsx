import Link from 'next/link';
import { HeroCalculator } from '@/components/home/HeroCalculator';
import { ChevronRightIcon } from '@/components/icons';
import { primaryButtonClass, secondaryButtonClass } from '@/components/actionButtonClass';
import { JsonLd } from '@/components/JsonLd';
import { categories, site, staticPages } from '@/config/site';
import { liveCategories, liveTools, liveToolsInCategory, getLiveToolBySlug, toolPath } from '@/lib/registry';
import { absoluteUrl, buildMetadata } from '@/lib/seo';

// Same title and description as the root layout default, plus canonical URL and the home share image.
export const metadata = buildMetadata({
  title: `${site.name} – ${site.tagline}`,
  description: 'Free money and work calculators for freelancers and remote workers. Smart tools to earn, save and grow.',
  path: '/',
});

const HERO_TOOL = 'hourly-rate-calculator';

const STEPS = [
  {
    title: 'Official sources',
    body: 'Fees, tax rates and limits come from the official page that sets them. We save the link, the exact line and the date.',
  },
  {
    title: 'Tested against official calculators',
    body: 'Every formula must match at least three worked examples before it goes live, checked against an official calculator where one exists, or a careful manual calculation.',
  },
  {
    title: 'Expert review for tax tools',
    body: 'Tools that depend on tax rules are reviewed by a qualified professional, and the reviewer’s name is shown on the page.',
  },
  {
    title: 'Updated on a published calendar',
    body: 'Rates are re-checked on a fixed schedule and whenever the rules change, and every test is run again before an update goes out.',
  },
];

function toolCount(n: number) {
  return `${n} ${n === 1 ? 'tool' : 'tools'}`;
}

/** Homepage (DESIGN.md §8). Categories and tool lists come from the registry: live tools only. */
export default function Home() {
  const hero = getLiveToolBySlug(HERO_TOOL);
  const live = new Set(liveCategories());
  const categoryRows = categories.filter((c) => live.has(c.slug));
  const featured = liveTools().slice(0, 6);
  const methodology = staticPages.find((p) => p.href === '/methodology')?.built;

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: site.name,
          url: absoluteUrl('/'),
          description: site.tagline,
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: site.name,
          url: absoluteUrl('/'),
          email: site.contactEmail,
        }}
      />

      {/* Hero: a live calculation */}
      <section className="wrap grid gap-12 pb-section pt-12 md:pt-section lg:grid-cols-12 lg:items-center lg:gap-16">
        <div className="lg:col-span-6">
          <h1 className="type-display max-w-[14ch] text-ink">Know your numbers before you decide.</h1>
          <p className="mt-6 max-w-[44ch] text-[19px] leading-[30px] text-ink-muted">
            Free calculators for freelancers and anyone managing money. Every rate checked against official sources.
          </p>
          <div className="mt-8">
            <a href="#calculators" className={primaryButtonClass}>
              Browse calculators
            </a>
          </div>
        </div>
        <div className="lg:col-span-6 xl:col-span-5 xl:col-start-8">
          <HeroCalculator toolHref={hero ? toolPath(hero) : undefined} />
        </div>
      </section>

      {/* Calculators by category: an index list */}
      <section id="calculators" aria-labelledby="categories-heading" className="scroll-mt-24 border-t border-line bg-surface">
        <div className="wrap py-section">
          <h2 id="categories-heading" className="type-h2">
            Calculators by category
          </h2>
          {categoryRows.length > 0 ? (
            <ul className="mt-8 border-t border-line">
              {categoryRows.map((c) => (
                <li key={c.slug} className="border-b border-line">
                  <Link
                    href={`/${c.slug}`}
                    className="group grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 gap-y-1 py-6 text-ink no-underline md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_auto]"
                  >
                    <span className="type-h3 group-hover:text-haven">{c.name}</span>
                    <span className="col-span-2 row-start-2 text-ink-muted md:col-span-1 md:row-start-auto">{c.description}</span>
                    <span className="type-small col-start-2 row-start-1 inline-flex items-center gap-1 text-ink-muted tabular-nums md:col-start-auto md:row-start-auto">
                      {toolCount(liveToolsInCategory(c.slug).length)}
                      <ChevronRightIcon size={16} className="text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-haven" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 measure text-ink-muted">Our first calculators are being checked now and will appear here soon.</p>
          )}
        </div>
      </section>

      {/* Featured calculators (rename to "Most used" once GA4 has real usage data) */}
      {featured.length > 0 ? (
        <section aria-labelledby="featured-heading" className="border-t border-line bg-surface">
          <div className="wrap pb-section pt-12">
            <h2 id="featured-heading" className="type-h2">
              Featured calculators
            </h2>
            <ul className="mt-8 grid gap-x-8 border-t border-line sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((t) => (
                <li key={t.slug} className="border-b border-line">
                  <Link href={toolPath(t)} className="group flex items-center justify-between gap-4 py-5 text-ink no-underline">
                    <span className="font-[550] group-hover:text-haven">{t.title}</span>
                    <ChevronRightIcon size={16} className="shrink-0 text-ink-muted group-hover:text-haven" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* How we check every number */}
      <section aria-labelledby="checks-heading" className="wrap py-section">
        <h2 id="checks-heading" className="type-h2 max-w-[24ch]">
          How we check every number
        </h2>
        <ol className="mt-10 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="border-t border-line pt-5">
              <span className="type-figure text-haven">{i + 1}</span>
              <h3 className="type-h3 mt-3">{s.title}</h3>
              <p className="type-small mt-2 text-ink-muted">{s.body}</p>
            </li>
          ))}
        </ol>
        {methodology ? (
          <div className="mt-10">
            <Link href="/methodology" className={secondaryButtonClass}>
              Read our methodology
            </Link>
          </div>
        ) : null}
      </section>
    </>
  );
}
