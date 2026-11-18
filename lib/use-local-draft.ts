'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { isoDate } from './dates';

/** Any Zod schema (classic or mini): only safeParse is used. */
interface DraftSchema<T> {
  safeParse(value: unknown): { success: true; data: T } | { success: false };
}

/**
 * A form draft kept in this browser only (quote and invoice generators: shared rule 2).
 * Nothing goes in the URL, because GTM/GA4 records page URLs and these forms hold personal data.
 *
 * - Every storage call is wrapped in try/catch: with storage blocked (private mode, site data
 *   off) the form still works, it just isn't remembered.
 * - No effect sets state: the stored draft and today's date are read with useSyncExternalStore,
 *   so the server render (no draft, no date) hydrates cleanly and the client fills in after.
 * - Writes are debounced, because a draft with a logo can be a few hundred KB.
 */

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener('storage', cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', cb);
  };
}

export function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string | null): void {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    /* storage blocked or full: the draft stays in memory for this visit */
  }
}

/**
 * JSON for storage. A number box being edited can hold NaN (empty), which JSON writes as null
 * and the schema would then reject, losing the whole draft on reload. Store it as 0 instead.
 */
export function serializeDraft(value: unknown): string {
  return JSON.stringify(value, (_k, v) => (typeof v === 'number' && !Number.isFinite(v) ? 0 : v));
}

/** Parses a stored draft; anything unreadable or of the wrong shape is ignored. */
export function parseDraft<T>(raw: string | null, schema: DraftSchema<T>): T | null {
  if (!raw) return null;
  try {
    const result = schema.safeParse(JSON.parse(raw));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

const noopSubscribe = () => () => {};

export function useLocalDraft<T>(key: string, schema: DraftSchema<T>, fresh: (today: string) => T) {
  const raw = useSyncExternalStore(subscribe, () => readStorage(key), () => null);
  const today = useSyncExternalStore(noopSubscribe, () => isoDate(new Date()), () => '');
  const stored = useMemo(() => parseDraft(raw, schema), [raw, schema]);
  const initial = useMemo(() => fresh(today), [fresh, today]);
  /** Edits made in this visit; `null` = show the stored draft (or a fresh form). */
  const [edits, setEdits] = useState<T | null>(null);
  const state = edits ?? stored ?? initial;

  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    if (edits === null) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => writeStorage(key, serializeDraft(edits)), 300);
    return () => clearTimeout(timer.current);
  }, [edits, key]);

  const set = useCallback((next: T) => setEdits(next), []);

  /** Replace the draft at once (Start a new … / Clear form), writing it immediately. */
  const replace = useCallback(
    (next: T | null) => {
      clearTimeout(timer.current);
      writeStorage(key, next === null ? null : serializeDraft(next));
      setEdits(next);
      notify();
    },
    [key],
  );

  return { state, today, set, replace } as const;
}
