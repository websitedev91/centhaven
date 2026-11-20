/**
 * Button styles (DESIGN.md §5). 44px tall, 6px radius. Labels say exactly what happens.
 * Kept as class strings so links and buttons share one look.
 */
const base =
  'inline-flex h-11 items-center justify-center gap-2 rounded-field px-4 text-[15px] font-[550] no-underline transition-colors disabled:cursor-not-allowed disabled:opacity-60';

/** Solid haven, white text. One per view, for the main action. */
export const primaryButtonClass = `${base} bg-haven text-white hover:bg-haven-deep hover:text-white active:bg-haven-deep`;

/** White with a line border. */
export const secondaryButtonClass = `${base} border border-line bg-surface text-ink hover:border-haven hover:text-haven`;

/** White with a danger border and text: confirms a destructive action (e.g. "Yes, clear"). */
export const dangerButtonClass = `${base} border border-danger bg-surface text-danger hover:bg-danger hover:text-white`;

/** Text-only link style: haven, underline on hover. */
export const textButtonClass =
  'inline-flex items-center gap-1.5 text-[15px] font-[550] text-haven no-underline hover:text-haven-deep hover:underline';

/**
 * Share / print / embed under the result (2026-11-20). Share is the main action: solid haven,
 * full width. Print and embed are "soft": mint fill, haven text, solid haven on hover.
 */
export const shareActionClass = `${primaryButtonClass} w-full`;
export const softActionClass =
  'inline-flex h-11 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-field border border-haven/25 bg-mint px-3 text-[14px] font-[600] text-haven-deep no-underline transition-colors hover:border-haven hover:bg-haven hover:text-white';
