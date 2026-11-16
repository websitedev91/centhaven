import { site } from '@/config/site';

export function Disclaimer() {
  return (
    <p className="rounded-field border border-line bg-paper p-4 text-sm text-ink-muted">
      <strong className="text-ink">Disclaimer: </strong>
      {site.disclaimer}
    </p>
  );
}
