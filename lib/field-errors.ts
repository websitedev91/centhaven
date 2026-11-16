import type * as z from 'zod/mini';

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

/** First error message per field, for inline display under each input. */
export function fieldErrors<T extends Record<string, unknown>>(schema: z.ZodMiniType<T>, state: unknown): FieldErrors<T> {
  const result = schema.safeParse(state);
  if (result.success) return {};
  const out: FieldErrors<T> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof T | undefined;
    if (key !== undefined && out[key] === undefined) out[key] = issue.message;
  }
  return out;
}
