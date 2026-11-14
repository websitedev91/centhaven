import { getEnabledAffiliate } from '@/lib/affiliates';
import { site } from '@/config/site';
import { AffiliateLink } from './AffiliateLink';

/** One relevant offer after the result. Renders NOTHING unless the partner is enabled. */
export function AffiliateSlot({ affiliateId, toolSlug }: { affiliateId?: string; toolSlug: string }) {
  const a = getEnabledAffiliate(affiliateId);
  if (!a) return null;
  return (
    <aside aria-label="Partner offer" className="no-print rounded-card border border-line bg-section p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Partner</p>
      <p className="mt-1 font-semibold text-ink">{a.partner}</p>
      <p className="mt-1 text-sm text-muted">{a.pitch}</p>
      <AffiliateLink href={a.url} affiliateId={a.id} toolSlug={toolSlug} partner={a.partner} />
      <p className="mt-3 text-xs text-muted">{site.affiliateDisclosure}</p>
    </aside>
  );
}
