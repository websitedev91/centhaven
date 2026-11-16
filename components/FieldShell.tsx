import type { ReactNode } from 'react';

/** Label + help + error wrapper shared by every input. */
export function FieldShell(props: {
  id: string;
  label: string;
  help?: string;
  error?: string;
  children: ReactNode;
  trailing?: ReactNode;
}) {
  const { id, label, help, error, children, trailing } = props;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-ink">
          {label}
        </label>
        {trailing}
      </div>
      {children}
      {help && !error ? (
        <p id={`${id}-help`} className="text-xs text-ink-muted">
          {help}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs font-semibold text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function describedBy(id: string, help?: string, error?: string): string | undefined {
  if (error) return `${id}-error`;
  if (help) return `${id}-help`;
  return undefined;
}

export const fieldClass =
  'w-full rounded-field border border-line bg-surface px-3 py-2 text-base text-ink tabular-nums shadow-sm transition-colors focus:border-haven focus:outline-none focus:ring-2 focus:ring-haven/30 aria-[invalid=true]:border-danger';
