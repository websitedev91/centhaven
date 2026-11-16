'use client';

import { useId } from 'react';

/**
 * Two-to-four option toggle (e.g. "Hourly → Salary" / "Salary → Hourly").
 * A native radio group: arrow keys move between options, one tab stop.
 */
export function SegmentedControl<T extends string>(props: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  const { label, value, options, onChange } = props;
  const name = useId();
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="type-small mb-2 font-[550] text-ink">{label}</legend>
      <div className="inline-grid w-full auto-cols-fr grid-flow-col rounded-field border border-line bg-paper p-1 sm:w-auto">
        {options.map((o) => (
          <label
            key={o.value}
            className="relative flex h-10 cursor-pointer items-center justify-center rounded-[4px] px-4 text-[15px] font-[550] text-ink-muted has-[:checked]:bg-surface has-[:checked]:text-ink has-[:checked]:shadow-[0_0_0_1px_var(--color-line)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-haven"
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={o.value === value}
              onChange={() => onChange(o.value)}
              className="sr-only"
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
