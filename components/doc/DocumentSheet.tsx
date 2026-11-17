import { Num } from '../Num';
import type { LineItem } from '@/lib/doc-schema';
import { formatMoney, formatNumber, type CurrencyCode } from '@/lib/format';

export interface SheetParty {
  heading: string;
  /** Lines in order; empty ones are skipped. Multi-line values (addresses) keep their breaks. */
  lines: readonly string[];
}

export interface SheetTotal {
  label: string;
  value: number;
  /** Shown as a deduction (−). */
  minus?: boolean;
  strong?: boolean;
}

/**
 * The quote / invoice document (shared rule 8: no CentHaven footer on it). On screen it is a
 * white page preview; when printing, globals.css hides everything except `.doc-sheet`, so
 * "Download PDF" (window.print → Save as PDF) gives just this document on A4 or Letter.
 */
export function DocumentSheet(props: {
  kind: 'Quote' | 'Invoice';
  number: string;
  title?: string;
  /** Data URL of the user's logo (invoice only; never uploaded). */
  logo?: string;
  meta: readonly { label: string; value: string }[];
  from: SheetParty;
  to: SheetParty;
  items: readonly LineItem[];
  lineTotals: readonly number[];
  currency: CurrencyCode;
  totals: readonly SheetTotal[];
  blocks: readonly { heading: string; text: string }[];
}) {
  const { kind, number, title, logo, meta, from, to, items, lineTotals, currency, totals, blocks } = props;
  const money = (n: number) => <Num>{formatMoney(n, currency)}</Num>;
  const party = (p: SheetParty) => {
    const lines = p.lines.map((l) => l.trim()).filter(Boolean);
    return (
      <div className="min-w-0">
        <p className="text-[11px] font-[650] uppercase tracking-[0.08em] text-ink-muted">{p.heading}</p>
        {lines.length > 0 ? (
          <div className="mt-1.5 flex flex-col gap-0.5 text-[13px] leading-5 text-ink">
            {lines.map((l, i) => (
              <p key={i} className={`whitespace-pre-line break-words ${i === 0 ? 'font-[650]' : ''}`}>
                {l}
              </p>
            ))}
          </div>
        ) : (
          <p className="mt-1.5 text-[13px] text-ink-muted">—</p>
        )}
      </div>
    );
  };

  return (
    <div className="doc-sheet mx-auto w-full max-w-[820px] rounded-panel border border-line bg-white p-6 text-ink shadow-[0_1px_3px_rgb(0_0_0/0.06)] sm:p-10">
      <header className="flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0">
          {logo ? (
            // A data URL the user picked; next/image adds nothing for an inline image in a static export.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="Logo" className="mb-4 max-h-16 max-w-[200px] object-contain" />
          ) : null}
          <h2 className="text-[28px] font-[700] leading-8 tracking-[-0.01em]">{kind}</h2>
          <p className="mt-1 text-[14px] text-ink-muted">{number.trim() || '—'}</p>
          {title?.trim() ? <p className="mt-2 text-[15px] font-[550]">{title.trim()}</p> : null}
        </div>
        <dl className="grid grid-cols-[auto_auto] gap-x-4 gap-y-1 text-[13px] leading-5">
          {meta
            .filter((m) => m.value.trim())
            .map((m) => (
              <div key={m.label} className="contents">
                <dt className="text-ink-muted">{m.label}</dt>
                <dd className="text-right font-[550]">{m.value}</dd>
              </div>
            ))}
        </dl>
      </header>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 print:grid-cols-2">
        {party(from)}
        {party(to)}
      </div>

      <table className="mt-8 w-full text-[13px] leading-5">
        <thead>
          <tr className="border-b-2 border-ink text-left">
            <th scope="col" className="py-2 pr-3 font-[650]">
              Description
            </th>
            <th scope="col" className="py-2 pr-3 text-right font-[650]">
              Qty
            </th>
            <th scope="col" className="py-2 pr-3 text-right font-[650]">
              Rate
            </th>
            <th scope="col" className="py-2 text-right font-[650]">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={it.id} className="border-b border-line align-top">
              <td className="whitespace-pre-line break-words py-2.5 pr-3 normal-nums">{it.desc.trim() || '—'}</td>
              <td className="py-2.5 pr-3 text-right tabular-nums"><Num>{formatNumber(it.qty, Number.isInteger(it.qty) ? 0 : 2)}</Num></td>
              <td className="py-2.5 pr-3 text-right tabular-nums">{money(it.rate)}</td>
              <td className="py-2.5 text-right tabular-nums">{money(lineTotals[i] ?? 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="ml-auto mt-4 grid w-full max-w-[320px] grid-cols-[1fr_auto] gap-y-1.5 text-[13px] leading-5">
        {totals.map((t) => (
          <div key={t.label} className={`contents ${t.strong ? 'text-[15px] font-[700]' : ''}`}>
            <dt className={t.strong ? 'border-t border-ink pt-2' : 'text-ink-muted'}>{t.label}</dt>
            <dd className={`pl-6 text-right tabular-nums ${t.strong ? 'border-t border-ink pt-2' : ''}`}>
              {t.minus ? '−' : null}
              {money(t.value)}
            </dd>
          </div>
        ))}
      </dl>

      {blocks
        .filter((b) => b.text.trim())
        .map((b) => (
          <section key={b.heading} className="mt-8 break-inside-avoid">
            <h3 className="text-[11px] font-[650] uppercase tracking-[0.08em] text-ink-muted">{b.heading}</h3>
            <p className="mt-1.5 whitespace-pre-line break-words text-[13px] leading-5">{b.text.trim()}</p>
          </section>
        ))}
    </div>
  );
}
