'use client';

import { useEffect, useRef, useState } from 'react';
import { track } from '@/lib/analytics';
import { dangerButtonClass, primaryButtonClass, secondaryButtonClass, textButtonClass } from '../actionButtonClass';
import { DownloadIcon, FileIcon, ResetIcon } from '../icons';

/**
 * Actions for the quote and invoice generators: Download PDF (the browser's print dialog →
 * "Save as PDF"; only the document prints), Start a new …, Clear form, and the local-rules
 * note next to the download button (Puru, 2026-11-18).
 * Clear form asks inline ("Clear everything? Yes, clear / Cancel"), not with a browser dialog.
 */
export function DocToolbar(props: { toolSlug: string; kind: 'quote' | 'invoice'; note: string; onNew: () => void; onClear: () => void }) {
  const { toolSlug, kind, note, onNew, onClear } = props;
  const [confirming, setConfirming] = useState(false);
  const clearRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  /** Move focus into the question when it opens, and back to "Clear form" when it closes. */
  const opened = useRef(false);
  useEffect(() => {
    if (confirming) cancelRef.current?.focus();
    else if (opened.current) clearRef.current?.focus();
    opened.current = confirming;
  }, [confirming]);
  return (
    <div className="no-print flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className={primaryButtonClass}
          onClick={() => {
            track('download_pdf', { tool: toolSlug });
            window.print();
          }}
        >
          <DownloadIcon size={18} />
          Download PDF
        </button>
        <button
          type="button"
          className={secondaryButtonClass}
          onClick={() => {
            track('new_document', { tool: toolSlug });
            onNew();
          }}
        >
          <FileIcon size={18} />
          Start a new {kind}
        </button>
        {confirming ? (
          <div role="group" aria-label={`Clear this ${kind}`} className="flex flex-wrap items-center gap-3 rounded-field border border-danger/40 bg-paper px-3 py-2">
            <span className="text-[15px] font-[550] text-ink">Clear everything?</span>
            <button
              type="button"
              className={dangerButtonClass}
              onClick={() => {
                setConfirming(false);
                onClear();
              }}
            >
              Yes, clear
            </button>
            <button ref={cancelRef} type="button" className={secondaryButtonClass} onClick={() => setConfirming(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button ref={clearRef} type="button" className={`${textButtonClass} ml-1`} onClick={() => setConfirming(true)}>
            <ResetIcon size={16} />
            Clear form
          </button>
        )}
      </div>
      <p className="text-[13px] leading-5 text-ink-muted">
        In the print window, choose <span className="font-[550] text-ink">Save as PDF</span>. Saved in this browser only; nothing is uploaded.
      </p>
      <p className="text-[13px] leading-5 text-ink">{note}</p>
    </div>
  );
}
