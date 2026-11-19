'use client';

import { primaryButtonClass } from '@/components/actionButtonClass';
import { useEmbed } from '@/components/EmbedMode';
import { track } from '@/lib/analytics';

export interface LeadBoxProps {
  /** e.g. "Want this website built?" */
  heading: string;
  /** Full mailto link with a FIXED subject only: never the user's numbers (GTM/GA record URLs). */
  mailto: string;
  /** Tool slug for the lead_click event. */
  tool: string;
}

/**
 * "Get a quote" lead box under a cost estimate (Puru, 2026-11-18): website and app cost tools.
 * Hidden in embeds and when printing.
 */
export function LeadBox({ heading, mailto, tool }: LeadBoxProps) {
  const embed = useEmbed();
  if (embed) return null;
  return (
    <section aria-labelledby="lead-heading" className="no-print flex flex-col gap-4 rounded-panel border border-line bg-surface p-5 sm:flex-row sm:items-center sm:justify-between sm:p-8">
      <div>
        <h2 id="lead-heading" className="type-h3 text-ink">
          {heading}
        </h2>
        <p className="mt-1 text-ink-muted">Send us your estimate and we&apos;ll reply with a quote.</p>
      </div>
      <a href={mailto} onClick={() => track('lead_click', { tool })} className={`${primaryButtonClass} shrink-0 self-start sm:self-auto`}>
        Get a quote
      </a>
    </section>
  );
}
