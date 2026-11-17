/**
 * Website Design Cost Calculator: pure maths (spec: docs/specs/website-design-cost-calculator.md).
 * Price = hours × the user's own rate. Hours are editable example values, never market prices.
 * No React, no dates, no fetch. No rounding here: round at display time (lib/format.ts).
 */

export type DesignLevel = 'template' | 'custom' | 'premium';

/** Design level multiplies the page hours (spec). */
export const LEVEL_MULTIPLIER: Record<DesignLevel, number> = { template: 0.5, custom: 1, premium: 1.5 };

export const FEATURES = ['contact', 'blog', 'shop', 'booking', 'lang', 'seo'] as const;
export type Feature = (typeof FEATURES)[number];

export interface WebsiteCostInput {
  rate: number;
  pages: number;
  hoursPerPage: number;
  level: DesignLevel;
  setupHours: number;
  /** Hours for each feature that is switched on (features that are off are left out). */
  features: Partial<Record<Feature, number>>;
  /** Copywriting hours per page, or 0 / undefined when copywriting is off. */
  copyHoursPerPage?: number;
  /** Buffer as a fraction (0.15 = 15%). */
  buffer: number;
  maintenanceHours: number;
}

export interface WebsiteCostResult {
  setupHours: number;
  designHours: number;
  copyHours: number;
  featureHours: number;
  baseHours: number;
  bufferHours: number;
  totalHours: number;
  /** Price without the buffer: the low end of the quote range. */
  basePrice: number;
  /** Price with the buffer: the main result. */
  price: number;
  maintenanceMonthly: number;
  maintenanceYearly: number;
}

export function websiteCost(input: WebsiteCostInput): WebsiteCostResult {
  const { rate, pages, hoursPerPage, level, setupHours, buffer, maintenanceHours } = input;
  const designHours = pages * hoursPerPage * LEVEL_MULTIPLIER[level];
  const copyHours = pages * (input.copyHoursPerPage ?? 0);
  const featureHours = FEATURES.reduce((sum, f) => sum + (input.features[f] ?? 0), 0);
  const baseHours = setupHours + designHours + copyHours + featureHours;
  const bufferHours = baseHours * buffer;
  const totalHours = baseHours + bufferHours;
  const maintenanceMonthly = maintenanceHours * rate;
  return {
    setupHours,
    designHours,
    copyHours,
    featureHours,
    baseHours,
    bufferHours,
    totalHours,
    basePrice: baseHours * rate,
    price: totalHours * rate,
    maintenanceMonthly,
    maintenanceYearly: maintenanceMonthly * 12,
  };
}
