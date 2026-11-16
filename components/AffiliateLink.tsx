'use client';

import { track } from '@/lib/analytics';
import { primaryButtonClass } from './actionButtonClass';

export function AffiliateLink(props: { href: string; affiliateId: string; toolSlug: string; partner: string }) {
  return (
    <a
      href={props.href}
      rel="sponsored nofollow noopener"
      target="_blank"
      onClick={() => track('affiliate_click', { affiliate: props.affiliateId, tool: props.toolSlug })}
      className={`${primaryButtonClass} mt-4`}
    >
      Try {props.partner}
    </a>
  );
}
