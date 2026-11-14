import Link from 'next/link';
import { allTools, toolPath } from '@/lib/registry';
import { toolModules } from '@/lib/tool-modules';

/**
 * Dev-only review page. The `.dev.tsx` extension is only registered in `next dev`
 * (see next.config.ts), so this route does not exist in the production build.
 */
export const metadata = { title: 'Dev: all tools', robots: { index: false, follow: false } };

const badge: Record<string, string> = {
  draft: 'bg-section text-muted border-line',
  ready: 'bg-accent/15 text-ink border-accent',
  live: 'bg-success/10 text-success border-success',
};

export default function DevTools() {
  const tools = allTools();
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl">All tools ({tools.length})</h1>
      <p className="mt-1 text-sm text-muted">Dev only. Not part of the production build.</p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="py-2 pr-4">Tool</th>
              <th className="py-2 pr-4">Category</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Risk</th>
              <th className="py-2 pr-4">Last updated</th>
              <th className="py-2 pr-4">Reviewed by</th>
              <th className="py-2">UI wired</th>
            </tr>
          </thead>
          <tbody>
            {tools.map((t) => (
              <tr key={t.slug} className="border-b border-line">
                <td className="py-2 pr-4">
                  {t.status === 'live' ? <Link href={toolPath(t)}>{t.title}</Link> : t.title}
                  <span className="block text-xs text-muted">{t.slug}</span>
                </td>
                <td className="py-2 pr-4">{t.category}</td>
                <td className="py-2 pr-4">
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${badge[t.status]}`}>{t.status}</span>
                </td>
                <td className="py-2 pr-4">{t.risk}</td>
                <td className="py-2 pr-4">{t.lastUpdated}</td>
                <td className="py-2 pr-4">{t.reviewedBy ?? '—'}</td>
                <td className="py-2">{toolModules[t.slug] ? 'yes' : 'no'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
