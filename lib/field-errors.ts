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

/**
 * Consistency rule (Puru, 2026-11-19): an invalid OPTIONAL field shows its own error under the
 * box, but the main result still shows. `blocking` keeps only the errors that should stop the
 * result; `calc` is the state for the maths, with each invalid optional field at 0 ("off").
 */
export function optionalOff<T extends Record<string, unknown>>(
  state: T,
  errors: FieldErrors<T>,
  optional: readonly (keyof T)[],
): { blocking: FieldErrors<T>; calc: T } {
  const blocking: FieldErrors<T> = { ...errors };
  const calc: T = { ...state };
  for (const key of optional) {
    if (errors[key] === undefined) continue;
    delete blocking[key];
    (calc as Record<keyof T, unknown>)[key] = 0;
  }
  return { blocking, calc };
}
