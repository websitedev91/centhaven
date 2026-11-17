'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useEmbed } from './EmbedMode';

/**
 * Renders its children only once scrolled near the viewport, inside a fixed-height box
 * (no layout shift). Pair with next/dynamic({ ssr: false }) in the tool so the chart
 * library is downloaded only when the chart is about to be seen.
 */
export function ChartLazy(props: {
  title: string;
  height?: number;
  description?: string;
  /** Rendered immediately below the chart (e.g. an accessible HTML legend with values). */
  footer?: ReactNode;
  /** Skeleton shape shown until the chart loads. */
  placeholder?: 'lines' | 'donut';
  children: ReactNode;
}) {
  const { title, height = 280, description, footer, placeholder = 'lines', children } = props;
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const embed = useEmbed();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      const t = setTimeout(() => setVisible(true), 0);
      return () => clearTimeout(t);
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (embed) return null;
  return (
    <figure className="print-break-avoid rounded-panel border border-line bg-surface p-5 sm:p-8">
      <figcaption className="type-h3 text-ink">{title}</figcaption>
      {description ? <p className="type-small mt-1 text-ink-muted">{description}</p> : null}
      <div className={footer ? 'mt-6 md:grid md:grid-cols-[minmax(0,240px)_minmax(0,1fr)] md:items-center md:gap-12' : 'mt-6'}>
        <div ref={ref} style={{ height }} aria-hidden="true">
          {visible ? children : <ChartPlaceholder shape={placeholder} />}
        </div>
        {footer ? <div className="mt-6 md:mt-0">{footer}</div> : null}
      </div>
    </figure>
  );
}

/**
 * Light skeleton shown while a chart loads: same box as the chart (no layout shift), faint
 * gridlines and a pale outline of the chart's shape. Static (no shimmer), per DESIGN.md motion rules.
 */
export function ChartPlaceholder({ shape = 'lines' }: { shape?: 'lines' | 'donut' }) {
  return (
    <div className="relative h-full w-full" aria-hidden="true">
      {shape === 'donut' ? (
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          <circle cx="50" cy="50" r="34" fill="none" stroke="var(--color-mint)" strokeWidth="14" />
        </svg>
      ) : (
        <>
          <div className="absolute inset-x-0 top-[8%] bottom-[10%] flex flex-col justify-between">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-px w-full bg-line/60" />
            ))}
          </div>
          <svg className="absolute inset-x-0 top-[8%] bottom-[10%] h-[82%] w-full" viewBox="0 0 100 40" preserveAspectRatio="none">
            <polyline
              points="0,30 20,26 40,22 60,16 80,12 100,8"
              fill="none"
              stroke="var(--color-mint)"
              strokeWidth="2.5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </>
      )}
    </div>
  );
}
