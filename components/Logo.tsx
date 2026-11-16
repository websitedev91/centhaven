import Link from 'next/link';

/** The mark: a cent sign in a rounded haven square (DESIGN.md §6). Same drawing as public/favicon.svg. */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="8" fill="var(--color-haven)" />
      <path
        d="M20.4 11.6a6 6 0 1 0 0 8.8M16.8 7.5v17"
        fill="none"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 no-underline ${inverted ? 'text-white hover:text-white' : 'text-ink hover:text-ink'}`}
      aria-label="CentHaven home"
    >
      <LogoMark />
      <span className="text-[20px] font-bold leading-none tracking-[-0.02em]">CentHaven</span>
    </Link>
  );
}
