'use client';

import { track } from '@/lib/analytics';

export function AffiliateLink(props: { href: string; affiliateId: string; toolSlug: string; partner: string }) {
  return (
    <a
      href={props.href}
      rel="sponsored nofollow noopener"
      target="_blank"
      onClick={() => track('affiliate_click', { affiliate: props.affiliateId, tool: props.toolSlug })}
      className="mt-3 inline-flex rounded-field bg-haven px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-haven-deep hover:text-white"
    >
      Try {props.partner}
    </a>
  );
}
