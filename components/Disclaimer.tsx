import { site } from '@/config/site';

export function Disclaimer() {
  return (
    <p className="type-small rounded-panel border border-line bg-surface p-4 text-ink-muted">
      <strong className="text-ink">Disclaimer: </strong>
      {site.disclaimer}
    </p>
  );
}
