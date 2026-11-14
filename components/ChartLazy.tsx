'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Renders its children only once scrolled near the viewport, inside a fixed-height box
 * (no layout shift). Pair with next/dynamic({ ssr: false }) in the tool so the chart
 * library is downloaded only when the chart is about to be seen.
 */
export function ChartLazy(props: { title: string; height?: number; description?: string; children: ReactNode }) {
  const { title, height = 280, description, children } = props;
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
    <figure className="print-break-avoid rounded-card border border-line bg-bg p-5 sm:p-6">
      <figcaption className="text-base font-bold text-ink">{title}</figcaption>
      {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      <div ref={ref} style={{ height }} className="mt-4">
        {visible ? children : <ChartPlaceholder />}
      </div>
    </figure>
  );
}

export function ChartPlaceholder() {
  return <div className="h-full w-full animate-pulse rounded-field bg-section" aria-hidden="true" />;
}
