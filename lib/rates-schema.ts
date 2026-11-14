import { z } from 'zod';

/**
 * Shape every /rates/*.json file must follow (PRD §7).
 * Kept free of Next/React imports so next.config.ts and tests can use it.
 */
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');

export const rateFileSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, 'Lowercase, hyphenated id'),
  effectiveFrom: isoDate,
  verifiedOn: isoDate,
  source: z.object({
    url: z.string().url().startsWith('https://', 'Official source must be https'),
    quote: z.string().trim().min(10, 'Paste the exact line from the official page'),
  }),
  data: z.record(z.string(), z.unknown()),
});

export type RateFile = z.infer<typeof rateFileSchema>;

export function parseRateFile(fileName: string, json: unknown): RateFile {
  const result = rateFileSchema.safeParse(json);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`).join('\n');
    throw new Error(`Invalid rates file ${fileName}:\n${issues}`);
  }
  const expectedId = fileName.replace(/\.json$/, '');
  if (result.data.id !== expectedId) {
    throw new Error(`Invalid rates file ${fileName}: id "${result.data.id}" must match file name "${expectedId}"`);
  }
  return result.data;
}
