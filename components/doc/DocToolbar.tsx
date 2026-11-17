'use client';

import { track } from '@/lib/analytics';
import { primaryButtonClass, secondaryButtonClass, textButtonClass } from '../actionButtonClass';
import { DownloadIcon, FileIcon, ResetIcon } from '../icons';

/**
 * Actions for the quote and invoice generators: Download PDF (the browser's print dialog →
 * "Save as PDF"; only the document prints), Start a new …, Clear form, and the local-rules
 * note next to the download button (Puru, 2026-11-18).
 */
export function DocToolbar(props: { toolSlug: string; kind: 'quote' | 'invoice'; note: string; onNew: () => void; onClear: () => void }) {
  const { toolSlug, kind, note, onNew, onClear } = props;
  return (
    <div className="no-print flex flex-col gap-4 rounded-panel border border-line bg-surface p-5 sm:p-6">
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
        <button
          type="button"
          className={`${textButtonClass} ml-1`}
          onClick={() => {
            if (window.confirm(`Clear this ${kind}? Everything you've entered on this device will be deleted.`)) onClear();
          }}
        >
          <ResetIcon size={16} />
          Clear form
        </button>
      </div>
      <p className="type-small text-ink-muted">
        In the print window, choose <span className="font-[550] text-ink">Save as PDF</span>. Your {kind} is saved in this browser only; nothing is uploaded.
      </p>
      <p className="type-small rounded-field border border-line bg-paper px-4 py-3 text-ink">{note}</p>
    </div>
  );
}
