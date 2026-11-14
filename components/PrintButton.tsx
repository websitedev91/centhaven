'use client';

import { track } from '@/lib/analytics';
import { actionButtonClass } from './actionButtonClass';

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
      <span aria-hidden="true">🖨️</span>
      Print / PDF
    </button>
  );
}
