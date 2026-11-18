'use client';

import { useState } from 'react';
import { splitNumber } from './Num';

/**
 * The only automatic motion on the site (DESIGN.md §5): when a formatted value changes,
 * only the characters that changed slide/fade in (200ms). Characters are matched from the
 * right, so "$62.32" → "$162.32" animates just the new digits. First render never animates.
 * prefers-reduced-motion makes it instant (globals.css). Screen readers get the whole value.
 */
export function AnimatedNumber({ value, className }: { value: string; className?: string }) {
  const [track, setTrack] = useState({ value, prev: value });
  if (track.value !== value) setTrack({ value, prev: track.value });
  const prev = track.prev;

  const chars = [...value];
  const prevChars = [...prev];
  const n = chars.length;
  const m = prevChars.length;

  return (
    <span className={className}>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true">
        {chars.map((ch, i) => {
          const fromEnd = n - i;
          const changed = prev !== value && prevChars[m - fromEnd] !== ch;
          const sep = splitNumber(ch)[0]?.sep;
          const cls = [changed ? 'digit-in' : '', sep ? 'num-sep' : ''].join(' ').trim() || undefined;
          return (
            <span key={`${fromEnd}-${ch}`} className={cls}>
              {/* A lone space in an animated (inline-block) span collapses: "Not burning" → "Notburning". */}
              {ch === ' ' ? ' ' : ch}
            </span>
          );
        })}
      </span>
    </span>
  );
}
