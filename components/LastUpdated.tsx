import { formatIsoDate } from '@/lib/dates';

export function LastUpdated({ date }: { date: string }) {
  return (
    <p className="type-small text-ink-muted">
      Last updated: <time dateTime={date}>{formatIsoDate(date)}</time>
    </p>
  );
}
