'use client';

import { track } from '@/lib/analytics';
import { softActionClass } from './actionButtonClass';
import { PrintIcon } from './icons';

export function PrintButton({ toolSlug }: { toolSlug: string }) {
  return (
    <button
      type="button"
      className={softActionClass}
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
