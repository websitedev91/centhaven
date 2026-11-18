import { parseRateFile, type RateFile } from './rates-schema';

/**
 * Runtime access to rates for tools. Each rates file is imported statically here so the
 * static export bundles only what is used. Every file is validated on load; an invalid
 * file throws during `next build`.
 *
 * To add a rates file: create /rates/<id>.json, list it in sources.md, then add it below.
 */
import upworkFees from '@/rates/upwork-fees.json';
import upworkConnects from '@/rates/upwork-connects.json';
import stripeUs from '@/rates/stripe-us.json';
import stripeGb from '@/rates/stripe-gb.json';
import stripeIe from '@/rates/stripe-ie.json';
import stripeCa from '@/rates/stripe-ca.json';
import stripeAu from '@/rates/stripe-au.json';
import stripeIn from '@/rates/stripe-in.json';
const registry: Record<string, unknown> = {
  'upwork-fees': upworkFees,
  'upwork-connects': upworkConnects,
  'stripe-us': stripeUs,
  'stripe-gb': stripeGb,
  'stripe-ie': stripeIe,
  'stripe-ca': stripeCa,
  'stripe-au': stripeAu,
  'stripe-in': stripeIn,
};

const parsed = new Map<string, RateFile>();

export function getRates(id: string): RateFile {
  const cached = parsed.get(id);
  if (cached) return cached;
  const raw = registry[id];
  if (raw === undefined) throw new Error(`Unknown rates file: ${id}`);
  const file = parseRateFile(`${id}.json`, raw);
  parsed.set(id, file);
  return file;
}

export interface SourceLink {
  id: string;
  url: string;
  verifiedOn: string;
  effectiveFrom: string;
}

export function getSourceLinks(ids: readonly string[]): SourceLink[] {
  return ids.map((id) => {
    const r = getRates(id);
    return { id: r.id, url: r.source.url, verifiedOn: r.verifiedOn, effectiveFrom: r.effectiveFrom };
  });
}

export type { RateFile };
