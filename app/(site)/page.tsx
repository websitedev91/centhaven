import Link from 'next/link';
import type { ComponentType } from 'react';
import { HeroCalculator } from '@/components/home/HeroCalculator';
import { HomeSearch } from '@/components/home/HomeSearch';
import {
  BarChartIcon,
  BookIcon,
  BriefcaseIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  FlaskIcon,
  ShieldIcon,
  UserCheckIcon,
  WalletIcon,
} from '@/components/icons';
import { primaryButtonClass, secondaryButtonClass } from '@/components/actionButtonClass';
import { JsonLd } from '@/components/JsonLd';
import { categories, site, staticPages } from '@/config/site';
import { searchIndex } from '@/lib/nav';
import { getLiveToolBySlug, liveCategories, liveTools, liveToolsInCategory, toolPath } from '@/lib/registry';
import { absoluteUrl, buildMetadata } from '@/lib/seo';

// Same title and description as the root layout default, plus canonical URL and the home share image.
export const metadata = buildMetadata({
  title: `${site.name} – ${site.tagline}`,
  description: 'Free money and work calculators for freelancers and remote workers. Smart tools to earn, save and grow.',
  path: '/',
});

const HERO_TOOL = 'hourly-rate-calculator';

/** Short labels for the "Popular" chips under the hero search (only live tools are shown). */
const POPULAR: { slug: string; label: string }[] = [
  { slug: 'hourly-rate-calculator', label: 'Hourly rate' },
  { slug: 'hourly-to-salary-calculator', label: 'Hourly to salary' },
  { slug: 'break-even-calculator', label: 'Break-even' },
  { slug: 'emergency-fund-calculator', label: 'Emergency fund' },
];

const CATEGORY_ICON: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  freelance: BriefcaseIcon,
  salary: WalletIcon,
  business: BarChartIcon,
  'personal-finance': ShieldIcon,
};

/** Kept consistent with the Methodology page. */
const CHECKS = [
  { Icon: BookIcon, title: 'Official sources', body: 'Fees, tax rates and limits come from the page that sets them, with the link and date saved.' },
  { Icon: FlaskIcon, title: 'Tested formulas', body: 'Every formula must match at least three worked examples before it goes live.' },
  { Icon: UserCheckIcon, title: 'Expert review for tax tools', body: 'Tools that depend on tax rules are reviewed by a qualified professional.' },
  { Icon: CalendarIcon, title: 'Re-checked on a schedule', body: 'Rates are checked again on a fixed calendar and whenever the rules change.' },
];

const TRUST = ['Free, no sign-up', 'Formula shown on every page', 'Six currencies'];

/** Homepage (DESIGN.md §8). Categories and tool lists come from the registry: live tools only. */
export default function Home() {
  const hero = getLiveToolBySlug(HERO_TOOL);
  const live = new Set(liveCategories());
  const groups = categories.filter((c) => live.has(c.slug)).map((c) => ({ ...c, tools: liveToolsInCategory(c.slug) }));
  const toolCount = liveTools().length;
  const popular = POPULAR.flatMap((p) => {
    const tool = getLiveToolBySlug(p.slug);
    return tool ? [{ ...p, href: toolPath(tool) }] : [];
  });
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

      {/* 1. Hero: search for what you want, or try a live calculation right away */}
      <section className="wrap grid gap-12 pb-section pt-10 md:pt-16 lg:grid-cols-12 lg:items-center lg:gap-12">
        <div className="lg:col-span-6">
          {toolCount > 0 ? (
            <p className="type-small inline-flex items-center gap-2 rounded-pill border border-line bg-surface px-3 py-1 font-[550] text-ink">
              <span className="inline-block h-2 w-2 rounded-full bg-haven" aria-hidden="true" />
              {toolCount} free money calculators
            </p>
          ) : null}
          <h1 className="type-display mt-5 max-w-[14ch] text-ink">Know your numbers before you decide.</h1>
          <p className="mt-5 max-w-[46ch] text-[19px] leading-[30px] text-ink-muted">
            Clear, honest calculators for freelancers and anyone managing money. Every formula explained, every rate checked
            against official sources.
          </p>

          {toolCount > 0 ? (
            <div className="mt-8 max-w-[600px]">
              <HomeSearch items={searchIndex()} />
              {popular.length > 0 ? (
                <div className="mt-4 flex flex-wrap items-center gap-1.5">
                  <span className="type-small mr-1 text-ink-muted">Popular:</span>
                  {popular.map((p) => (
                    <Link
                      key={p.slug}
                      href={p.href}
                      className="type-small rounded-pill border border-line bg-surface px-2.5 py-1.5 font-[550] text-ink no-underline hover:border-haven hover:text-haven"
                    >
                      {p.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-8">
              <a href="#calculators" className={primaryButtonClass}>
                Browse calculators
              </a>
            </div>
          )}

          <ul className="type-small mt-8 flex flex-wrap gap-x-6 gap-y-2 text-ink-muted">
            {TRUST.map((t) => (
              <li key={t} className="inline-flex items-center gap-2">
                <CheckCircleIcon size={18} className="text-haven" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-6 xl:col-span-5 xl:col-start-8">
          <HeroCalculator toolHref={hero ? toolPath(hero) : undefined} />
        </div>
      </section>

      {/* 2. Find the right calculator: every live tool, grouped by goal */}
      <section id="calculators" aria-labelledby="calculators-heading" className="scroll-mt-24 border-t border-line bg-surface">
        <div className="wrap py-section">
          <div className="max-w-2xl">
            <h2 id="calculators-heading" className="type-h2">
              Find the right calculator
            </h2>
            <p className="mt-3 text-ink-muted">Pick what you&apos;re working on. Each tool gives you an answer in seconds and shows how it got there.</p>
          </div>

          {groups.length > 0 ? (
            // CSS columns: natural order on phones, balanced heights on desktop (no empty, stretched panels).
            <div className="mt-10 gap-6 md:columns-2">
              {groups.map((g) => {
                const Icon = CATEGORY_ICON[g.slug] ?? WalletIcon;
                return (
                  <article key={g.slug} className="mb-6 flex break-inside-avoid flex-col rounded-panel border border-line bg-paper p-6 sm:p-7">
                    <div className="flex items-start gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-field bg-mint text-haven" aria-hidden="true">
                        <Icon size={22} />
                      </span>
                      <div className="min-w-0">
                        <h3 className="type-h3">
                          <Link href={`/${g.slug}`} className="text-ink no-underline hover:text-haven">
                            {g.name}
                          </Link>
                        </h3>
                        <p className="type-small mt-1 text-ink-muted">{g.description}</p>
                      </div>
                    </div>
                    <ul className="mt-5 border-t border-line">
                      {g.tools.slice(0, 6).map((t) => (
                        <li key={t.slug} className="border-b border-line last:border-b-0">
                          <Link href={toolPath(t)} className="group flex items-center justify-between gap-4 py-3.5 text-ink no-underline">
                            <span className="min-w-0">
                              <span className="block font-[550] group-hover:text-haven">{t.title}</span>
                              <span className="type-small mt-0.5 line-clamp-1 text-ink-muted">{t.meta.subtitle}</span>
                            </span>
                            <ChevronRightIcon
                              size={16}
                              className="shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-haven"
                            />
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link href={`/${g.slug}`} className="type-small mt-4 self-start font-[550] text-haven no-underline hover:underline">
                      All {g.name.toLowerCase()} calculators
                    </Link>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="mt-6 measure text-ink-muted">Our first calculators are being checked now and will appear here soon.</p>
          )}
        </div>
      </section>

      {/* 3. Trust: how every number is checked */}
      <section aria-labelledby="checks-heading" className="border-t border-line">
        <div className="wrap grid gap-10 py-section lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <h2 id="checks-heading" className="type-h2 max-w-[18ch]">
              Numbers you can check, not just trust
            </h2>
            <p className="mt-4 max-w-[46ch] text-ink-muted">
              Every calculator shows its formula and worked examples with real numbers, and the examples are tested against
              the calculator before it goes live.
            </p>
            {methodology ? (
              <div className="mt-8">
                <Link href="/methodology" className={secondaryButtonClass}>
                  Read our methodology
                </Link>
              </div>
            ) : null}
          </div>
          <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:col-span-7">
            {CHECKS.map(({ Icon, title, body }) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-field border border-line bg-surface text-haven" aria-hidden="true">
                  <Icon />
                </span>
                <div>
                  <h3 className="text-[17px] font-[650] leading-6 text-ink">{title}</h3>
                  <p className="type-small mt-1.5 text-ink-muted">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 4. Closing call to action */}
      {toolCount > 0 ? (
        <section aria-labelledby="cta-heading" className="wrap pb-section">
          <div className="flex flex-col gap-6 rounded-panel border border-line bg-mint p-8 sm:p-10 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 id="cta-heading" className="type-h3 text-ink">
                Every calculator is free. No sign-up, no paywall.
              </h2>
              <p className="type-small mt-1.5 text-ink-muted">Share a result with one link, print it, or embed the calculator on your own site.</p>
            </div>
            <a href="#calculators" className={`${primaryButtonClass} shrink-0`}>
              Browse all {toolCount} calculators
            </a>
          </div>
        </section>
      ) : null}
    </>
  );
}
