'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

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
  children: ReactNode;
}) {
  const { title, height = 280, description, footer, children } = props;
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

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

  return (
    <figure className="print-break-avoid rounded-panel border border-line bg-surface p-5 sm:p-8">
      <figcaption className="type-h3 text-ink">{title}</figcaption>
      {description ? <p className="type-small mt-1 text-ink-muted">{description}</p> : null}
      <div className={footer ? 'mt-6 md:grid md:grid-cols-[minmax(0,240px)_minmax(0,1fr)] md:items-center md:gap-12' : 'mt-6'}>
        <div ref={ref} style={{ height }} aria-hidden="true">
          {visible ? children : <ChartPlaceholder />}
        </div>
        {footer ? <div className="mt-6 md:mt-0">{footer}</div> : null}
      </div>
    </figure>
  );
}

export function ChartPlaceholder() {
  return <div className="h-full w-full rounded-field bg-paper" aria-hidden="true" />;
}
