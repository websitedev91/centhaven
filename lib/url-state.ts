'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { z } from 'zod';

type Primitive = string | number;
type Shape = Record<string, Primitive>;

/**
 * Parse a query string into calculator state. Each field is validated on its own,
 * so one bad value falls back to its default instead of discarding the whole link.
 */
export function parseQuery<T extends Shape>(search: string, schema: z.ZodType<T>, defaults: T): T {
  const params = new URLSearchParams(search);
  const out: Shape = { ...defaults };
  for (const key of Object.keys(defaults)) {
    const raw = params.get(key);
    if (raw === null) continue;
    const value: Primitive = typeof defaults[key] === 'number' ? Number(raw) : raw;
    if (typeof value === 'number' && !Number.isFinite(value)) continue;
    const candidate = { ...out, [key]: value };
    if (schema.safeParse(candidate).success) out[key] = value;
  }
  return out as T;
}

/** Only non-default values go in the URL, so default links stay clean. */
export function toQuery<T extends Shape>(state: T, defaults: T): string {
  const params = new URLSearchParams();
  for (const key of Object.keys(defaults)) {
    if (state[key] !== defaults[key]) params.set(key, String(state[key]));
  }
  const s = params.toString();
  return s ? `?${s}` : '';
}

const noopSubscribe = () => () => {};

/**
 * Calculator state that is shareable via URL query params (PRD §6 "Share link").
 * Server render uses defaults; the client reads the URL without a hydration mismatch.
 * URL writes are debounced (browsers throttle history.replaceState).
 */
export function useUrlState<T extends Shape>(schema: z.ZodType<T>, defaults: T, prefix = '') {
  const search = useSyncExternalStore(
    noopSubscribe,
    () => window.location.search,
    () => '',
  );
  const prefixedSearch = useMemo(() => {
    if (!prefix) return search;
    const p = new URLSearchParams(search);
    const out = new URLSearchParams();
    p.forEach((v, k) => {
      if (k.startsWith(prefix)) out.set(k.slice(prefix.length), v);
    });
    return out.toString();
  }, [search, prefix]);

  const fromUrl = useMemo(() => parseQuery(prefixedSearch, schema, defaults), [prefixedSearch, schema, defaults]);
  const [edits, setEdits] = useState<Partial<T>>({});
  const state = useMemo(() => ({ ...fromUrl, ...edits }) as T, [fromUrl, edits]);

  const setField = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setEdits((e) => ({ ...e, [key]: value }));
  }, []);

  const reset = useCallback(() => setEdits({ ...defaults }), [defaults]);

  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const dirty = Object.keys(edits).length > 0;
  useEffect(() => {
    if (!dirty) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const current = new URLSearchParams(window.location.search);
      for (const key of Object.keys(defaults)) current.delete(prefix + key);
      const mine = new URLSearchParams(toQuery(state, defaults));
      mine.forEach((v, k) => current.set(prefix + k, v));
      const qs = current.toString();
      const url = `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`;
      try {
        window.history.replaceState(window.history.state, '', url);
      } catch {
        /* throttled by the browser — the next change will retry */
      }
    }, 400);
    return () => clearTimeout(timer.current);
  }, [state, defaults, dirty, prefix]);

  return [state, setField, reset] as const;
}
