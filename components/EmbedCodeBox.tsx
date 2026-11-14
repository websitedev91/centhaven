'use client';

import { useId, useState } from 'react';
import { track } from '@/lib/analytics';
import { site } from '@/config/site';
import { actionButtonClass } from './actionButtonClass';

export function embedCode(slug: string, title: string, height = 720): string {
  return `<iframe src="${site.url}/embed/${slug}" title="${title} by ${site.name}" width="100%" height="${height}" style="border:0;max-width:100%" loading="lazy"></iframe>`;
}

/** "Get embed code" toggle with a read-only code box and copy button. */
export function EmbedCodeBox({ toolSlug, title }: { toolSlug: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const id = useId();
  const code = embedCode(toolSlug, title);

  return (
    <>
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)} className={actionButtonClass}>
        <span aria-hidden="true">{'</>'}</span>
        Get embed code
      </button>
      <div id={id} hidden={!open} className="basis-full">
        <label htmlFor={`${id}-code`} className="mb-1.5 block text-sm font-semibold text-ink">
          Paste this on your website
        </label>
        <textarea
          id={`${id}-code`}
          readOnly
          rows={3}
          value={code}
          onFocus={(e) => e.currentTarget.select()}
          className="w-full rounded-field border border-line bg-section p-3 font-mono text-xs text-ink"
        />
        <button
          type="button"
          className={`${actionButtonClass} mt-2`}
          onClick={async () => {
            track('embed_copy', { tool: toolSlug });
            try {
              await navigator.clipboard.writeText(code);
              setCopied(true);
              setTimeout(() => setCopied(false), 2500);
            } catch {
              /* user can still copy from the box */
            }
          }}
        >
          <span aria-live="polite">{copied ? 'Copied' : 'Copy code'}</span>
        </button>
      </div>
    </>
  );
}
