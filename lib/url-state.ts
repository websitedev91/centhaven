'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { z } from 'zod';

type Primitive = string | number;
type Shape = Record<string, Primitive>;

/**
 * Defaults that depend on one field's value — e.g. currency-specific income defaults.
 * See lib/currency-defaults.ts (`currencyVariant`).
 */
export interface DefaultsVariant<T extends Shape> {
  /** The field the defaults depend on (always written to the URL when not the base default). */
  key: keyof T & string;
  /** Full defaults for a state, based on `state[key]`. */
  defaultsFor: (state: T) => T;
}

/** Defaults to compare against for a given state. */
export function resolveDefaults<T extends Shape>(state: T, base: T, variant?: DefaultsVariant<T>): T {
  return variant ? variant.defaultsFor(state) : base;
}

function readField<T extends Shape>(params: URLSearchParams, key: string, into: T, schema: z.ZodType<T>): T {
  const raw = params.get(key);
  if (raw === null) return into;
  const value: Primitive = typeof into[key] === 'number' ? Number(raw) : raw;
  if (typeof value === 'number' && !Number.isFinite(value)) return into;
  const candidate = { ...into, [key]: value };
  return schema.safeParse(candidate).success ? candidate : into;
}

/**
 * Parse a query string into calculator state. Each field is validated on its own,
 * so one bad value falls back to its default instead of discarding the whole link.
 * With a variant, the variant field (e.g. currency) is read first and its defaults
 * fill every field missing from the link.
 */
export function parseQuery<T extends Shape>(
  search: string,
  schema: z.ZodType<T>,
  defaults: T,
  variant?: DefaultsVariant<T>,
): T {
  const params = new URLSearchParams(search);
  let out: T = { ...defaults };
  if (variant) {
    out = { ...variant.defaultsFor(readField(params, variant.key, out, schema)) };
  }
  for (const key of Object.keys(defaults)) {
    if (variant && key === variant.key) continue;
    out = readField(params, key, out, schema);
  }
  return out;
}

/** Only non-default values go in the URL, so default links stay clean. */
export function toQuery<T extends Shape>(state: T, defaults: T, variant?: DefaultsVariant<T>): string {
  const ref = resolveDefaults(state, defaults, variant);
  const params = new URLSearchParams();
  for (const key of Object.keys(defaults)) {
    const compareTo = variant && key === variant.key ? defaults[key] : ref[key];
    if (state[key] !== compareTo) params.set(key, String(state[key]));
  }
  const s = params.toString();
  return s ? `?${s}` : '';
}

const noopSubscribe = () => () => {};

export interface UrlStateOptions<T extends Shape> {
  /** Prefix for this state's query keys, so two states can share one URL (e.g. 'b_'). */
  prefix?: string;
  variant?: DefaultsVariant<T>;
}

/**
 * Calculator state that is shareable via URL query params (PRD §6 "Share link").
 * Server render uses defaults; the client reads the URL without a hydration mismatch.
 * URL writes are debounced (browsers throttle history.replaceState).
 */
export function useUrlState<T extends Shape>(schema: z.ZodType<T>, defaults: T, options: UrlStateOptions<T> = {}) {
  const { prefix = '', variant } = options;
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

  const fromUrl = useMemo(
    () => parseQuery(prefixedSearch, schema, defaults, variant),
    [prefixedSearch, schema, defaults, variant],
  );
  const [edits, setEdits] = useState<Partial<T>>({});
  const state = useMemo(() => ({ ...fromUrl, ...edits }) as T, [fromUrl, edits]);

  const setField = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setEdits((e) => ({ ...e, [key]: value }));
  }, []);

  /** Replace several fields at once (e.g. a currency switch that also moves defaults). */
  const setAll = useCallback((next: T) => setEdits({ ...next }), []);

  /** Back to defaults, keeping the variant field (e.g. stays in INR). */
  const reset = useCallback(
    () => setEdits({ ...resolveDefaults(state, defaults, variant) }),
    [state, defaults, variant],
  );

  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const dirty = Object.keys(edits).length > 0;
  useEffect(() => {
    if (!dirty) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const current = new URLSearchParams(window.location.search);
      for (const key of Object.keys(defaults)) current.delete(prefix + key);
      const mine = new URLSearchParams(toQuery(state, defaults, variant));
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
  }, [state, defaults, dirty, prefix, variant]);

  return { state, setField, setAll, reset } as const;
}
