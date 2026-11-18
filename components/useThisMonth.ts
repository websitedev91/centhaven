'use client';

import { useSyncExternalStore } from 'react';

const noSubscribe = () => () => {};

/**
 * This month as year × 12 + month (0-based), read in the browser only. Pages are built ahead
 * of time, so the server snapshot is null and date rows appear after hydration.
 */
export function useThisMonth(): number | null {
  return useSyncExternalStore(
    noSubscribe,
    () => {
      const d = new Date();
      return d.getFullYear() * 12 + d.getMonth();
    },
    () => null,
  );
}
