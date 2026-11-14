import Link from 'next/link';
import { site, staticPages } from '@/config/site';

export function SiteFooter() {
  const links = staticPages.filter((p) => p.built);
  return (
    <footer className="no-print mt-16 border-t border-line bg-section">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted">
        <p className="font-semibold text-ink">{site.name}</p>
        <p className="mt-1">{site.tagline}</p>
        {links.length > 0 ? (
          <nav aria-label="Footer" className="mt-4">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-muted hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
        <p className="mt-6">
          © {site.name}. {site.disclaimer}
        </p>
      </div>
    </footer>
  );
}
