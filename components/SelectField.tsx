'use client';

import { useId } from 'react';
import { FieldShell, fieldClass } from './FieldShell';

/** A labelled native select (e.g. "Period", "What you sell"). */
export function SelectField<T extends string>(props: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
  help?: string;
}) {
  const id = useId();
  return (
    <FieldShell id={id} label={props.label} help={props.help}>
      <select id={id} className={fieldClass} value={props.value} onChange={(e) => props.onChange(e.target.value as T)}>
        {props.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}
