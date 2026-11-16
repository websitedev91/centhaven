'use client';

import { track } from '@/lib/analytics';
import { actionButtonClass } from './actionButtonClass';
import { PrintIcon } from './icons';

export function PrintButton({ toolSlug }: { toolSlug: string }) {
  return (
    <button
      type="button"
      className={actionButtonClass}
      onClick={() => {
        track('print_click', { tool: toolSlug });
        window.print();
      }}
    >
      <PrintIcon />
      Print or save as PDF
    </button>
  );
}
