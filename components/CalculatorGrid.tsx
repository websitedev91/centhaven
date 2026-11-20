'use client';

import type { ReactNode } from 'react';
import { useResultActions } from './ResultActions';

/**
 * Tool calculator layout (DESIGN.md §9): inputs on 8 columns, result on 4.
 * The result is sticky on desktop (below the 68px header) while the inputs scroll, with the
 * share / print / embed buttons right under it (from ToolLayout via ResultActions).
 * On mobile they stack; ResultCard adds the bottom result bar.
 */
export function CalculatorGrid({ inputs, result }: { inputs: ReactNode; result: ReactNode }) {
  const actions = useResultActions();
  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:items-start lg:gap-8">
      <div className="min-w-0 lg:col-span-7 xl:col-span-8">{inputs}</div>
      <div className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-[92px] lg:col-span-5 xl:col-span-4">
        {result}
        {actions}
      </div>
    </div>
  );
}

/** The white inputs panel. */
export function InputsPanel(props: { label: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <form
      className="rounded-panel border border-line bg-surface p-5 sm:p-8"
      aria-label={props.label}
      onSubmit={(e) => e.preventDefault()}
    >
      {props.children}
      {props.footer ? <div className="mt-6 border-t border-line pt-4">{props.footer}</div> : null}
    </form>
  );
}
