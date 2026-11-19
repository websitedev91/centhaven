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
  /** Locale for grouping, e.g. 'en-IN' shows 12,00,000. */
  locale?: string;
  /** Optional field: an empty box means 0 ("off") and is valid. Required fields report NaN. */
  optional?: boolean;
  id?: string;
}

function display(value: number, grouping: boolean, locale: string): string {
  if (!Number.isFinite(value)) return '';
  return grouping ? value.toLocaleString(locale, { maximumFractionDigits: 2 }) : String(value);
}

/**
 * Text input with numeric keyboard. Keeps what the user types while focused (so "1." or
 * an empty box is allowed mid-edit) and reports parsed numbers upward. An empty or invalid
 * box reports NaN, so the tool's schema flags it and the result waits for a number instead
 * of quietly using the last value typed. An empty `optional` box reports 0 instead.
 */
export function InputNumber(props: InputNumberProps) {
  const { label, value, onChange, help, error, prefix, suffix, grouping = false, locale = 'en-US', optional = false } = props;
  const autoId = useId();
  const id = props.id ?? autoId;
  /**
   * What the user is typing, with the number it stands for. When `value` changes from outside
   * (a currency switch, reset, a removed row), the draft no longer matches and the box shows the
   * new value instead of stale text (Puru, 2026-11-19).
   */
  const [draft, setDraftState] = useState<{ text: string; value: number } | null>(null);
  const [localErrorState, setLocalError] = useState<string>();
  const live = draft !== null && Object.is(draft.value, value);
  const shown = live ? draft.text : display(value, grouping, locale);
  const localError = live ? localErrorState : undefined;
  const err = localError ?? error;

  function report(text: string, n: number, message?: string) {
    setDraftState({ text, value: n });
    setLocalError(message);
    onChange(n);
  }

  function handle(text: string) {
    const cleaned = text.replace(/[,\s]/g, '');
    if (cleaned === '' && optional) return report(text, 0);
    if (cleaned === '' || cleaned === '-' || cleaned === '.') return report(text, Number.NaN, 'Enter a number');
    const n = Number(cleaned);
    if (!Number.isFinite(n)) return report(text, Number.NaN, 'Enter a number');
    report(text, n);
  }

  return (
    <FieldShell id={id} label={label} help={help} error={err}>
      <div className="relative flex items-center">
        {prefix ? (
          <span className="pointer-events-none absolute left-3 text-[17px] text-ink-muted" aria-hidden="true">
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
          data-optional={optional ? '' : undefined}
          onChange={(e) => handle(e.target.value)}
          onFocus={() => setDraftState({ text: Number.isFinite(value) ? String(value) : '', value })}
          onBlur={() => {
            if (!localError) setDraftState(null);
          }}
        />
        {suffix ? (
          <span className="type-small pointer-events-none absolute right-3 text-ink-muted" aria-hidden="true">
            {suffix}
          </span>
        ) : null}
      </div>
    </FieldShell>
  );
}
