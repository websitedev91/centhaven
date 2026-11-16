import Link from 'next/link';

export function Logo() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 font-bold text-ink no-underline hover:text-ink"
      aria-label="CentHaven home"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="11" fill="var(--color-brass)" />
        <circle cx="12" cy="12" r="8.5" fill="none" stroke="var(--color-haven)" strokeWidth="1.5" />
        <path
          d="M14.5 8.6a4 4 0 1 0 0 6.8M12 6.5v11"
          fill="none"
          stroke="var(--color-haven)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
      <span className="text-lg tracking-tight">CentHaven</span>
    </Link>
  );
}
