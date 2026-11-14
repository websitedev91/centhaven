import { z } from 'zod';
import raw from '@/config/affiliates.json';

const affiliateSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    partner: z.string().min(1),
    url: z.string(),
    pitch: z.string().min(1),
    enabled: z.boolean(),
  })
  .refine((a) => !a.enabled || /^https:\/\//.test(a.url), {
    message: 'An enabled affiliate needs an https url',
    path: ['url'],
  });

export type Affiliate = z.infer<typeof affiliateSchema>;

export const affiliates: readonly Affiliate[] = z.array(affiliateSchema).parse(raw);

/** Returns the partner only when it exists AND is enabled (Puru approved). */
export function getEnabledAffiliate(id: string | undefined): Affiliate | undefined {
  if (!id) return undefined;
  const a = affiliates.find((x) => x.id === id);
  return a?.enabled ? a : undefined;
}
