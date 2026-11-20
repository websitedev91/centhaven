'use client';

import { useId, useState } from 'react';
import { track } from '@/lib/analytics';
import { site } from '@/config/site';
import { primaryButtonClass, softActionClass } from './actionButtonClass';
import { CheckIcon, CodeIcon } from './icons';

/** Default height fits the calculator + result at typical blog widths (checked at 700px: ~1,130px). */
export function embedCode(slug: string, title: string, height = 1200): string {
  return `<iframe src="${site.url}/embed/${slug}" title="${title} by ${site.name}" width="100%" height="${height}" style="border:0;max-width:100%" loading="lazy"></iframe>`;
}

/** "Show embed code" toggle with a read-only code box and copy button. */
export function EmbedCodeBox({ toolSlug, title }: { toolSlug: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const id = useId();
  const code = embedCode(toolSlug, title);

  return (
    <>
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)} className={softActionClass}>
        <CodeIcon />
        {open ? 'Hide embed code' : 'Show embed code'}
      </button>
      <div id={id} hidden={!open} className="basis-full rounded-panel border border-line bg-surface p-5">
        <label htmlFor={`${id}-code`} className="type-small mb-2 block font-[550] text-ink">
          Paste this on your website
        </label>
        <textarea
          id={`${id}-code`}
          readOnly
          rows={3}
          value={code}
          onFocus={(e) => e.currentTarget.select()}
          className="w-full rounded-field border border-line bg-paper p-3 font-mono text-[13px] leading-5 text-ink focus-visible:border-haven focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-haven"
        />
        <button
          type="button"
          className={`${primaryButtonClass} mt-3`}
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
          {copied ? <CheckIcon /> : null}
          <span aria-live="polite">{copied ? 'Embed code copied' : 'Copy embed code'}</span>
        </button>
      </div>
    </>
  );
}
