'use client';

import { useId, useState } from 'react';
import { primaryButtonClass } from '@/components/actionButtonClass';
import { fieldClass } from '@/components/FieldShell';
import { CheckIcon } from '@/components/icons';
import { track } from '@/lib/analytics';
import { formatIsoDate } from '@/lib/dates';
import { clientNotice } from './notice';

/** Copyable client notice that fills in the new rate and an effective date the user picks (review C8). */
export function ClientNotice({ oldRate, newRate, toolSlug }: { oldRate: string; newRate: string; toolSlug: string }) {
  const id = useId();
  const [date, setDate] = useState('');
  const [copied, setCopied] = useState(false);
  const text = clientNotice({ oldRate, newRate, effectiveDate: date ? formatIsoDate(date) : undefined });

  return (
    <section aria-labelledby={`${id}-h`} className="no-print rounded-panel border border-line bg-surface p-5 sm:p-8">
      <h2 id={`${id}-h`} className="type-h3 text-ink">
        Tell your clients
      </h2>
      <p className="type-small mt-1 text-ink-muted">
        A short, friendly notice with your new rate filled in. Pick the date it starts, then copy it into an email.
      </p>
      <div className="mt-6 flex max-w-xs flex-col gap-2">
        <label htmlFor={`${id}-date`} className="type-small font-[550] text-ink">
          Effective date
        </label>
        <input id={`${id}-date`} type="date" value={date} onChange={(e) => setDate(e.target.value)} className={fieldClass} />
      </div>
      <label htmlFor={`${id}-text`} className="sr-only">
        Client notice
      </label>
      <textarea
        id={`${id}-text`}
        readOnly
        rows={11}
        value={text}
        onFocus={(e) => e.currentTarget.select()}
        className="mt-6 w-full rounded-field border border-line bg-paper p-4 text-[15px] leading-6 text-ink focus-visible:border-haven focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-haven"
      />
      <button
        type="button"
        className={`${primaryButtonClass} mt-4`}
        onClick={async () => {
          track('share_click', { tool: toolSlug, kind: 'client_notice' });
          try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
          } catch {
            /* the text can still be selected and copied by hand */
          }
        }}
      >
        {copied ? <CheckIcon /> : null}
        <span aria-live="polite">{copied ? 'Notice copied' : 'Copy notice'}</span>
      </button>
    </section>
  );
}
