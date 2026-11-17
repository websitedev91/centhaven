'use client';

import { useId } from 'react';
import { FieldShell, describedBy, fieldClass } from '../FieldShell';

interface Common {
  label: string;
  value: string;
  onChange: (value: string) => void;
  help?: string;
  error?: string;
  maxLength?: number;
  placeholder?: string;
  autoComplete?: string;
}

/** Single-line text field (labelled, with help and inline error). `maxLength` stops overlong text. */
export function TextField(props: Common & { type?: 'text' | 'email' | 'tel' | 'date' }) {
  const { label, value, onChange, help, error, maxLength, placeholder, autoComplete = 'off', type = 'text' } = props;
  const id = useId();
  return (
    <FieldShell id={id} label={label} help={help} error={error}>
      <input
        id={id}
        type={type}
        className={fieldClass}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, help, error)}
        onChange={(e) => onChange(e.target.value)}
      />
    </FieldShell>
  );
}

/** Multi-line text (addresses, notes, payment details). */
export function TextArea(props: Common & { rows?: number }) {
  const { label, value, onChange, help, error, maxLength, placeholder, autoComplete = 'off', rows = 3 } = props;
  const id = useId();
  return (
    <FieldShell id={id} label={label} help={help} error={error}>
      <textarea
        id={id}
        rows={rows}
        className={`${fieldClass} h-auto min-h-24 py-3 leading-6`}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, help, error)}
        onChange={(e) => onChange(e.target.value)}
      />
    </FieldShell>
  );
}
