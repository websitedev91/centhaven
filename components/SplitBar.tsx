import { Num } from './Num';

export interface SplitPart {
  key: string;
  label: string;
  value: number;
  /** Pre-formatted value for the legend, e.g. "212 days". */
  display: string;
  color: string;
}

/**
 * One horizontal stacked bar plus a legend table with the values (DESIGN.md + dataviz rules:
 * 2px surface gaps between segments, identity never by colour alone, a table view of the data).
 * Plain HTML/CSS, so it needs no chart library. An optional marker shows a target position.
 */
export function SplitBar(props: {
  title: string;
  description?: string;
  parts: readonly SplitPart[];
  /** Total the bar represents (defaults to the sum of parts). */
  total?: number;
  marker?: { at: number; label: string };
}) {
  const { title, description, parts, marker } = props;
  const total = props.total ?? parts.reduce((n, p) => n + Math.max(p.value, 0), 0);
  const shown = parts.filter((p) => p.value > 0);

  return (
    <figure className="print-break-avoid rounded-panel border border-line bg-surface p-5 sm:p-8">
      <figcaption className="type-h3 text-ink">{title}</figcaption>
      {description ? <p className="type-small mt-1 text-ink-muted">{description}</p> : null}

      <div className="relative mt-6" aria-hidden="true">
        <div className="flex h-6 w-full gap-[2px] overflow-hidden rounded-[4px] bg-surface">
          {shown.map((p) => (
            <div
              key={p.key}
              title={`${p.label}: ${p.display}`}
              className="h-full first:rounded-l-[4px] last:rounded-r-[4px]"
              style={{ width: `${(p.value / total) * 100}%`, background: p.color }}
            />
          ))}
        </div>
        {marker && total > 0 ? (
          <div
            className="absolute -bottom-2 -top-2 w-0.5 bg-ink"
            style={{ left: `calc(${Math.min(100, Math.max(0, (marker.at / total) * 100))}% - 1px)` }}
          >
            <span className="type-small absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap text-ink">
              {marker.label}
            </span>
          </div>
        ) : null}
      </div>

      <table className={`type-small w-full max-w-md ${marker ? 'mt-10' : 'mt-6'}`}>
        <caption className="sr-only">{title}</caption>
        <tbody>
          {parts.map((p) => (
            <tr key={p.key} className="border-b border-line first:border-t">
              <th scope="row" className="py-2.5 pr-3 text-left font-normal text-ink">
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: p.color }} aria-hidden="true" />
                  {p.label}
                </span>
              </th>
              <td className="py-2.5 text-right font-[550] tabular-nums text-ink">
                <Num>{p.display}</Num>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
