'use client';

import { useId, useState, type ReactNode } from 'react';
import { FieldShell, describedBy, fieldClass } from './FieldShell';

export interface InputNumberProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  /** Documented range; enforced by the tool schema, which supplies `error`. */
  min?: number;
  max?: number;
  step?: number;
  help?: string;
  /** Error from schema validation (shown inline). */
  error?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  /** Show thousands separators when not focused. */
  grouping?: boolean;
  id?: string;
}

function display(value: number, grouping: boolean): string {
  if (!Number.isFinite(value)) return '';
  return grouping ? value.toLocaleString('en-US', { maximumFractionDigits: 2 }) : String(value);
}

/**
 * Text input with numeric keyboard. Keeps what the user types while focused (so "1." or
 * an empty box is allowed mid-edit) and reports parsed numbers upward.
 */
export function InputNumber(props: InputNumberProps) {
  const { label, value, onChange, help, error, prefix, suffix, grouping = false } = props;
  const autoId = useId();
  const id = props.id ?? autoId;
  const [draft, setDraft] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string>();
  const shown = draft ?? display(value, grouping);
  const err = localError ?? error;

  function handle(text: string) {
    setDraft(text);
    const cleaned = text.replace(/[,\s]/g, '');
    if (cleaned === '' || cleaned === '-' || cleaned === '.') {
      setLocalError('Enter a number');
      return;
    }
    const n = Number(cleaned);
    if (!Number.isFinite(n)) {
      setLocalError('Enter a number');
      return;
    }
    setLocalError(undefined);
    onChange(n);
  }

  return (
    <FieldShell id={id} label={label} help={help} error={err}>
      <div className="relative flex items-center">
        {prefix ? (
          <span className="pointer-events-none absolute left-3 text-muted" aria-hidden="true">
            {prefix}
          </span>
        ) : null}
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          className={`${fieldClass} ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-14' : ''}`}
          value={shown}
          aria-invalid={err ? true : undefined}
          aria-describedby={describedBy(id, help, err)}
          onChange={(e) => handle(e.target.value)}
          onFocus={() => setDraft(Number.isFinite(value) ? String(value) : '')}
          onBlur={() => {
            if (!localError) setDraft(null);
          }}
        />
        {suffix ? (
          <span className="pointer-events-none absolute right-3 text-sm text-muted" aria-hidden="true">
            {suffix}
          </span>
        ) : null}
      </div>
    </FieldShell>
  );
}
