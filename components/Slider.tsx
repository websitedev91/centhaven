'use client';

import { useId, useState, type CSSProperties } from 'react';
import { FieldShell, describedBy } from './FieldShell';

export interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  /** How a value is read out and shown at the ends, e.g. v => `${v}%`. */
  format?: (value: number) => string;
  /** Unit shown after the editable value box, e.g. "%". */
  unit?: string;
  help?: string;
  error?: string;
}

/**
 * Range slider (DESIGN.md §5): 4px track, haven fill, 20px white thumb with haven border.
 * The value beside the label is a small input, so it can also be typed.
 * Keyboard on the slider: arrows, PageUp/Down, Home/End.
 */
export function Slider(props: SliderProps) {
  const { label, value, onChange, min, max, step = 1, format = String, unit, help, error } = props;
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const safe = Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min;
  const pct = ((safe - min) / (max - min)) * 100;

  function typed(text: string) {
    setDraft(text);
    const n = Number(text.replace(/[,\s%]/g, ''));
    if (text.trim() !== '' && Number.isFinite(n)) onChange(n);
  }

  return (
    <FieldShell
      id={id}
      label={label}
      help={help}
      error={error}
      trailing={
        <span className="flex items-center gap-1">
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            aria-label={`${label}, exact value${unit ? ` in ${unit}` : ''}`}
            aria-invalid={error ? true : undefined}
            value={draft ?? (Number.isFinite(value) ? String(value) : '')}
            onChange={(e) => typed(e.target.value)}
            onFocus={(e) => e.currentTarget.select()}
            onBlur={() => setDraft(null)}
            className="h-8 w-14 rounded-field border border-line bg-surface px-2 text-right text-[15px] font-[550] text-ink hover:border-ink-muted/50 focus-visible:border-haven focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-haven aria-[invalid=true]:border-danger"
          />
          {unit ? <span className="type-small text-ink-muted">{unit}</span> : null}
        </span>
      }
    >
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={safe}
        aria-valuetext={format(value)}
        aria-describedby={describedBy(id, help, error)}
        aria-invalid={error ? true : undefined}
        onChange={(e) => {
          setDraft(null);
          onChange(Number(e.target.value));
        }}
        className="range"
        style={{ '--pct': `${pct}%` } as CSSProperties}
      />
      <div className="type-small -mt-1 flex justify-between text-ink-muted" aria-hidden="true">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </FieldShell>
  );
}
