/**
 * Category hub metadata (DESIGN.md §9, keyword map "Category hub pages").
 * Add one line per hub; its guide goes in lib/hub-content.ts. A category needs a hub before
 * any of its tools is registered (lib/seo.test.ts checks this).
 */
import type { HubMeta } from './hub-types';
import { hub as freelance } from '@/hubs/freelance/meta';
import { hub as salary } from '@/hubs/salary/meta';
import { hub as business } from '@/hubs/business/meta';
import { hub as marketing } from '@/hubs/marketing/meta';
import { hub as personalFinance } from '@/hubs/personal-finance/meta';

export const hubs: readonly HubMeta[] = [freelance, salary, business, marketing, personalFinance];

export function getHub(slug: string): HubMeta | undefined {
  return hubs.find((h) => h.slug === slug);
}
