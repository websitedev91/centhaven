import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { parseDraft, serializeDraft } from './use-local-draft';

describe('local drafts', () => {
  it('an empty number box (NaN) is stored as 0, so the draft still loads', () => {
    const schema = z.object({ name: z.string(), qty: z.number() });
    const raw = serializeDraft({ name: 'Logo design', qty: Number.NaN });
    expect(parseDraft(raw, schema)).toEqual({ name: 'Logo design', qty: 0 });
  });
});
