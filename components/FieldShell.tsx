import type { ReactNode } from 'react';

/** Label above (small, 550), helper below in ink-muted, inline error (DESIGN.md §5). */
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
    <div className="flex flex-col gap-2">
      <div className="flex min-h-5 items-center justify-between gap-3">
        <label htmlFor={id} className="type-small font-[550] text-ink">
          {label}
        </label>
        {trailing}
      </div>
      {children}
      {help && !error ? (
        <p id={`${id}-help`} className="type-small text-ink-muted">
          {help}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="type-small font-[550] text-danger">
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

/** 48px input: line border, 6px radius, 2px haven focus ring with 2px offset. */
export const fieldClass =
  'h-12 w-full rounded-field border border-line bg-surface px-3 text-[17px] text-ink transition-colors hover:border-ink-muted/50 focus-visible:border-haven focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-haven aria-[invalid=true]:border-danger';
