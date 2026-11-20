import Link from 'next/link';
import type { ComponentType } from 'react';
import { HeroCalculator } from '@/components/home/HeroCalculator';
import { HomeSearch } from '@/components/home/HomeSearch';
import { BarChartIcon, BriefcaseIcon, CheckCircleIcon, ChevronRightIcon, MegaphoneIcon, ShieldIcon, WalletIcon } from '@/components/icons';
import { primaryButtonClass, secondaryButtonClass } from '@/components/actionButtonClass';
import { JsonLd } from '@/components/JsonLd';
import { categories, site, staticPages } from '@/config/site';
import { CURRENCIES } from '@/lib/format';
import { searchIndex } from '@/lib/nav';
import { getLiveToolBySlug, liveCategories, liveTools, liveToolsInCategory, toolPath } from '@/lib/registry';
import { absoluteUrl, buildMetadata } from '@/lib/seo';

// Same title and description as the root layout default, plus canonical URL and the home share image.
export const metadata = buildMetadata({
  title: `${site.name} – ${site.tagline}`,
  description: site.homeDescription,
  path: '/',
});

const HERO_TOOL = 'hourly-rate-calculator';

/** Short labels for the "Popular" chips under the hero search (only live tools are shown). */
const POPULAR: { slug: string; label: string }[] = [
  { slug: 'hourly-rate-calculator', label: 'Hourly rate' },
  { slug: 'hourly-to-salary-calculator', label: 'Hourly to salary' },
  { slug: 'break-even-calculator', label: 'Break-even' },
  { slug: 'debt-snowball-calculator', label: 'Debt payoff' },
];

/** "Most used" cards: one or two per goal, so the first screen of tools shows the range. */
const FEATURED = [
  'hourly-rate-calculator',
  'freelance-invoice-generator',
  'hourly-to-salary-calculator',
  'break-even-calculator',
  'roas-calculator',
  'debt-snowball-calculator',
];

const CATEGORY_ICON: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  freelance: BriefcaseIcon,
  salary: WalletIcon,
  business: BarChartIcon,
  marketing: MegaphoneIcon,
  'personal-finance': ShieldIcon,
};

/** The four steps of the Methodology page (same order and wording). Pure maths only, so no tax or rate checks. */
const CHECKS = [
  { title: 'Your numbers, clear maths', body: 'Every result comes from what you enter, using the formula shown on the page.' },
  { title: 'Tested formulas', body: 'Each formula must match at least three worked examples, checked by hand, before it goes live.' },
  { title: 'No hidden rates', body: 'We don’t build tools that depend on tax rates, company fees or legal limits. Nothing goes out of date.' },
  { title: 'Checked before publishing', body: 'Every tool is tested on phones and desktops, with empty, zero and very large values.' },
];

const TRUST = ['Free, no sign-up', 'Formula on every page', 'Share, print or embed'];

/** Homepage (DESIGN.md §8). Categories and tool lists come from the registry: live tools only. */
export default function Home() {
  const hero = getLiveToolBySlug(HERO_TOOL);
  const live = new Set(liveCategories());
  const groups = categories.filter((c) => live.has(c.slug)).map((c) => ({ ...c, tools: liveToolsInCategory(c.slug) }));
  const categoryName = new Map(categories.map((c) => [c.slug, c.name]));
  const toolCount = liveTools().length;
  const popular = POPULAR.flatMap((p) => {
    const tool = getLiveToolBySlug(p.slug);
    return tool ? [{ ...p, href: toolPath(tool) }] : [];
  });
  const featured = FEATURED.flatMap((slug) => getLiveToolBySlug(slug) ?? []);
  const methodology = staticPages.find((p) => p.href === '/methodology')?.built;
  // Real figures only (DESIGN.md §8): all four come from the code.
  const stats = [
    { value: String(toolCount), label: 'free calculators' },
    { value: String(groups.length), label: 'money goals' },
    { value: String(CURRENCIES.length), label: 'currencies' },
    { value: '0', label: 'sign-ups or paywalls' },
  ];

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

      {/* 1. Hero (ink): the promise, search, and a live calculation on a white "instrument" card */}
      <section className="bg-footer-bg text-white">
        <div className="wrap grid gap-12 pb-28 pt-12 md:pt-20 lg:grid-cols-12 lg:items-center lg:gap-12 lg:pb-36">
          <div className="lg:col-span-6 [&_a:focus-visible]:outline-white">
            {toolCount > 0 ? (
              <p className="type-small inline-flex items-center gap-2 rounded-pill border border-white/15 bg-white/[0.06] px-3 py-1 font-[550] text-white">
                <span className="inline-block h-2 w-2 rounded-full bg-mint" aria-hidden="true" />
                {toolCount} free money calculators
              </p>
            ) : null}
            <h1 className="type-display mt-6 max-w-[14ch] text-white md:text-[64px] md:leading-[68px]">
              Know your{' '}
              <span className="underline decoration-brass decoration-[4px] underline-offset-[10px] md:decoration-[5px] md:underline-offset-[12px]">
                numbers
              </span>{' '}
              before you decide.
            </h1>
            <p className="mt-6 max-w-[46ch] text-[19px] leading-[30px] text-footer-muted">
              Clear, honest calculators for freelancers and anyone managing money. Every formula explained, every result worked
              out from the numbers you enter.
            </p>

            {toolCount > 0 ? (
              <div className="mt-9 max-w-[600px]">
                <HomeSearch items={searchIndex()} onDark />
                {popular.length > 0 ? (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="type-small mr-1 text-footer-muted">Popular:</span>
                    {popular.map((p) => (
                      <Link
                        key={p.slug}
                        href={p.href}
                        className="type-small rounded-pill border border-white/20 px-3 py-1.5 font-[550] text-white no-underline transition-colors hover:border-white hover:bg-white hover:text-ink"
                      >
                        {p.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="mt-9">
                <a href="#calculators" className={primaryButtonClass}>
                  Browse calculators
                </a>
              </div>
            )}

            <ul className="type-small mt-9 flex flex-wrap gap-x-6 gap-y-2 text-footer-muted">
              {TRUST.map((t) => (
                <li key={t} className="inline-flex items-center gap-2">
                  <CheckCircleIcon size={18} className="text-mint" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="text-ink lg:col-span-6 xl:col-span-5 xl:col-start-8">
            <HeroCalculator toolHref={hero ? toolPath(hero) : undefined} />
          </div>
        </div>
      </section>

      {/* 2. Real figures, on a panel that overlaps the hero edge */}
      {toolCount > 0 ? (
        <section aria-label="CentHaven in numbers" className="wrap relative -mt-16 lg:-mt-20">
          <dl className="grid grid-cols-2 overflow-hidden rounded-panel border border-line bg-surface md:grid-cols-4">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`flex flex-col-reverse gap-1 px-4 py-4 sm:p-7 ${i % 2 === 1 ? 'border-l border-line' : ''} ${i >= 2 ? 'border-t border-line md:border-t-0' : ''} ${i === 2 ? 'md:border-l' : ''}`}
              >
                <dt className="type-small text-ink-muted">{s.label}</dt>
                <dd className="text-[30px] font-bold leading-[34px] tracking-[-0.03em] text-ink tabular sm:text-[48px] sm:leading-[52px]">{s.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {/* 3. Most used: a few big, readable cards */}
      {featured.length > 0 ? (
        <section aria-labelledby="featured-heading" className="wrap pt-section">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <h2 id="featured-heading" className="type-h2">
                Most used calculators
              </h2>
              <p className="mt-3 text-ink-muted">Start here. Each one gives you an answer in seconds and shows how it got there.</p>
            </div>
            <a href="#calculators" className="type-small font-[550] text-haven no-underline hover:underline">
              See all {toolCount}
            </a>
          </div>
          {/* Phones: a swipeable row (scroll-snap, no JS) with the next card peeking in. sm and up: a grid. */}
          <ul className="-mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:mt-10 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
            {featured.map((t) => {
              const Icon = CATEGORY_ICON[t.category] ?? WalletIcon;
              return (
                <li key={t.slug} className="flex w-[84%] shrink-0 snap-start sm:w-auto">
                  <Link
                    href={toolPath(t)}
                    className="group flex w-full flex-col rounded-panel border border-line bg-surface p-5 text-ink no-underline transition-colors hover:border-haven hover:text-ink sm:p-7"
                  >
                    <span className="type-small inline-flex items-center gap-1.5 self-start rounded-pill bg-mint px-2.5 py-1 font-[550] text-haven-deep">
                      <Icon size={16} />
                      {categoryName.get(t.category)}
                    </span>
                    <span className="type-h3 mt-5 block">{t.title}</span>
                    <span className="type-small mt-2 block flex-1 text-ink-muted">{t.meta.subtitle}</span>
                    <span className="mt-6 flex items-center justify-between border-t border-line pt-4 text-[15px] font-[550]">
                      {t.meta.document ? 'Open generator' : 'Open calculator'}
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-pill border border-line text-ink transition-colors group-hover:border-haven group-hover:bg-haven group-hover:text-white"
                        aria-hidden="true"
                      >
                        <ChevronRightIcon size={16} />
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {/* 4. Every calculator: a clean index by goal (names only, nothing cut off) */}
      <section id="calculators" aria-labelledby="calculators-heading" className="mt-section scroll-mt-24 border-y border-line bg-surface">
        <div className="wrap py-section">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <h2 id="calculators-heading" className="type-h2">
                Every calculator, by goal
              </h2>
              <p className="mt-3 text-ink-muted">Pick what you&apos;re working on. All free, all built on the numbers you enter.</p>
            </div>
          </div>

          {groups.length > 0 ? (
            // CSS columns: natural order on phones, balanced heights on desktop.
            <div className="mt-12 gap-x-12 sm:columns-2 lg:columns-3">
              {groups.map((g) => {
                const Icon = CATEGORY_ICON[g.slug] ?? WalletIcon;
                return (
                  <div key={g.slug} className="mb-12 break-inside-avoid border-t-2 border-ink pt-5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-field bg-mint text-haven" aria-hidden="true">
                        <Icon size={18} />
                      </span>
                      <h3 className="type-h3 min-w-0 flex-1">
                        <Link href={`/${g.slug}`} className="text-ink no-underline hover:text-haven">
                          {g.name}
                        </Link>
                      </h3>
                      <span className="type-small tabular text-ink-muted">
                        {g.tools.length} {g.tools.length === 1 ? 'tool' : 'tools'}
                      </span>
                    </div>
                    <ul className="mt-4">
                      {g.tools.map((t) => (
                        <li key={t.slug}>
                          <Link
                            href={toolPath(t)}
                            className="group flex items-center justify-between gap-3 border-b border-line py-2.5 text-[15px] leading-[22px] text-ink no-underline hover:text-haven"
                          >
                            <span className="min-w-0">{t.title}</span>
                            <ChevronRightIcon
                              size={16}
                              className="shrink-0 text-line transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-haven"
                            />
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link href={`/${g.slug}`} className="type-small mt-4 inline-block font-[550] text-haven no-underline hover:underline">
                      About {g.name.toLowerCase()} calculators
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-6 measure text-ink-muted">Our first calculators are being checked now and will appear here soon.</p>
          )}
        </div>
      </section>

      {/* 5. Trust: how every number is checked (a real sequence, so it is numbered) */}
      <section aria-labelledby="checks-heading">
        <div className="wrap grid gap-12 py-section lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <h2 id="checks-heading" className="type-h2 max-w-[18ch]">
              Numbers you can check, not just trust
            </h2>
            <p className="mt-4 max-w-[46ch] text-ink-muted">
              Every calculator shows its formula and worked examples with real numbers, and the examples are tested against the
              calculator before it goes live.
            </p>
            {methodology ? (
              <div className="mt-8">
                <Link href="/methodology" className={secondaryButtonClass}>
                  Read our methodology
                </Link>
              </div>
            ) : null}
          </div>
          <ol className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:col-span-7">
            {CHECKS.map(({ title, body }, i) => (
              <li key={title} className="border-t border-line pt-5">
                <span className="block text-[32px] font-bold leading-[36px] tracking-[-0.02em] text-haven tabular" aria-hidden="true">
                  0{i + 1}
                </span>
                <h3 className="mt-3 text-[17px] font-[650] leading-6 text-ink">{title}</h3>
                <p className="type-small mt-1.5 text-ink-muted">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 6. Closing call to action (ink band) */}
      {toolCount > 0 ? (
        <section aria-labelledby="cta-heading" className="wrap pb-section">
          <div className="flex flex-col gap-8 rounded-panel bg-footer-bg p-8 text-white sm:p-12 md:flex-row md:items-center md:justify-between">
            <div className="max-w-[52ch]">
              <h2 id="cta-heading" className="type-h2 text-white">
                Every calculator is free. No sign-up, no paywall.
              </h2>
              <p className="mt-3 text-footer-muted">Share a result with one link, print it, or embed the calculator on your own site.</p>
            </div>
            <a
              href="#calculators"
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-field bg-white px-6 text-[15px] font-[600] text-ink no-underline transition-colors hover:bg-mint hover:text-ink focus-visible:outline-white"
            >
              Browse all {toolCount} calculators
            </a>
          </div>
        </section>
      ) : null}
    </>
  );
}
