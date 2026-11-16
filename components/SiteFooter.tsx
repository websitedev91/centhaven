import Link from 'next/link';
import { site, staticPages } from '@/config/site';
import { navCategories } from '@/lib/nav';
import { Logo } from './Logo';

const COMPANY_ORDER = ['/about', '/methodology', '/contact'];

function Column({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  if (links.length === 0) return null;
  return (
    <div>
      <h2 className="type-small font-[550] text-white">{title}</h2>
      <ul className="mt-4 flex flex-col gap-3">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-[15px] text-footer-muted no-underline hover:text-white hover:underline">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Footer (DESIGN.md §7). Category links from the registry (live only); page links from config. */
export function SiteFooter() {
  const built = staticPages.filter((p) => p.built);
  const company = built
    .filter((p) => p.group === 'company')
    .sort((a, b) => COMPANY_ORDER.indexOf(a.href) - COMPANY_ORDER.indexOf(b.href));
  const legal = built.filter((p) => p.group === 'legal');
  const calculators = navCategories().map((c) => ({ href: c.href, label: c.name }));
  const methodology = built.find((p) => p.href === '/methodology');
  const year = new Date().getFullYear();

  return (
    <footer className="no-print bg-footer-bg text-white">
      <div className="wrap pb-10 pt-section">
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
          <div className="col-span-2 md:col-span-1">
            <Logo inverted />
            <p className="mt-4 max-w-xs text-footer-muted">{site.tagline}</p>
          </div>
          <Column title="Calculators" links={calculators} />
          <Column title="Company" links={company} />
          <Column title="Legal" links={legal} />
        </div>
        <div className="type-small mt-16 flex flex-col gap-2 border-t border-white/15 pt-6 text-footer-muted">
          <p>For estimates only. Not financial, tax or legal advice.</p>
          <p>
            © {year} {site.name} · Rates reviewed regularly
            {methodology ? (
              <>
                , see{' '}
                <Link href="/methodology" className="text-footer-muted underline hover:text-white">
                  Methodology
                </Link>
              </>
            ) : null}
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
