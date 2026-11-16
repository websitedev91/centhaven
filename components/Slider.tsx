'use client';

import { useId } from 'react';
import { FieldShell, describedBy } from './FieldShell';

export interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  /** How the current value is shown next to the label, e.g. v => `${v}%`. */
  format?: (value: number) => string;
  help?: string;
  error?: string;
}

/** Range slider with the value shown beside the label. Keyboard: arrows, PageUp/Down, Home/End. */
export function Slider(props: SliderProps) {
  const { label, value, onChange, min, max, step = 1, format = String, help, error } = props;
  const id = useId();
  const safe = Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min;
  const pct = ((safe - min) / (max - min)) * 100;
  return (
    <FieldShell
      id={id}
      label={label}
      help={help}
      error={error}
      trailing={
        <output htmlFor={id} className="text-sm font-semibold tabular-nums text-haven">
          {format(value)}
        </output>
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
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full accent-haven"
        style={{
          background: `linear-gradient(to right, var(--color-haven) ${pct}%, var(--color-line) ${pct}%)`,
        }}
      />
      <div className="flex justify-between text-xs text-ink-muted" aria-hidden="true">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </FieldShell>
  );
}
