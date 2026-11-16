import { getEnabledAffiliate } from '@/lib/affiliates';
import { site } from '@/config/site';
import { AffiliateLink } from './AffiliateLink';

/** One relevant offer after the result. Renders NOTHING unless the partner is enabled. */
export function AffiliateSlot({ affiliateId, toolSlug }: { affiliateId?: string; toolSlug: string }) {
  const a = getEnabledAffiliate(affiliateId);
  if (!a) return null;
  return (
    <aside aria-label="Partner offer" className="no-print rounded-panel border border-line bg-surface p-5 sm:p-6">
      <p className="type-small text-ink-muted">Partner offer</p>
      <p className="type-h3 mt-1 text-ink">{a.partner}</p>
      <p className="mt-1 text-ink-muted">{a.pitch}</p>
      <AffiliateLink href={a.url} affiliateId={a.id} toolSlug={toolSlug} partner={a.partner} />
      <p className="type-small mt-4 text-ink-muted">{site.affiliateDisclosure}</p>
    </aside>
  );
}
