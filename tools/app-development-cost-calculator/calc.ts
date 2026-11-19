/**
 * App Development Cost Calculator: pure maths (spec: docs/specs/app-development-cost-calculator.md).
 * Price = hours × the user's own rate. Hours are editable example values, never market prices.
 * No React, no dates, no fetch. No rounding here: round at display time (lib/format.ts).
 */

/** Built again for each extra platform (UI, device and store work). */
export const APP_FEATURES = ['login', 'pay', 'push', 'chat', 'device', 'offline'] as const;
/** Built once and shared by every platform. */
export const SHARED_FEATURES = ['api', 'admin', 'qa'] as const;
export const PLATFORMS = ['ios', 'android', 'web'] as const;

export type AppFeature = (typeof APP_FEATURES)[number];
export type SharedFeature = (typeof SHARED_FEATURES)[number];
export type Platform = (typeof PLATFORMS)[number];

export interface AppCostInput {
  rate: number;
  /** Platforms ticked (at least one; the caller validates). */
  platforms: number;
  /** Share of app-side hours repeated for each platform after the first, as a fraction (0.6 = 60%). */
  extraPlatform: number;
  screens: number;
  hoursPerScreen: number;
  setupHours: number;
  /** Hours for each feature that is on (features that are off are left out). */
  appFeatures: Partial<Record<AppFeature, number>>;
  sharedFeatures: Partial<Record<SharedFeature, number>>;
  /** Buffer as a fraction (0.15 = 15%). */
  buffer: number;
  maintenanceHours: number;
}

export interface AppCostResult {
  setupHours: number;
  screenHours: number;
  appFeatureHours: number;
  /** Screens + app-side features: the work repeated per platform. */
  appSideHours: number;
  /** Setup + shared features. */
  sharedHours: number;
  extraPlatformHours: number;
  baseHours: number;
  bufferHours: number;
  totalHours: number;
  basePrice: number;
  price: number;
  maintenanceMonthly: number;
  maintenanceYearly: number;
}

export function appCost(input: AppCostInput): AppCostResult {
  const { rate, platforms, extraPlatform, screens, hoursPerScreen, setupHours, buffer, maintenanceHours } = input;
  const screenHours = screens * hoursPerScreen;
  const appFeatureHours = APP_FEATURES.reduce((sum, f) => sum + (input.appFeatures[f] ?? 0), 0);
  const sharedFeatureHours = SHARED_FEATURES.reduce((sum, f) => sum + (input.sharedFeatures[f] ?? 0), 0);
  const appSideHours = screenHours + appFeatureHours;
  const sharedHours = setupHours + sharedFeatureHours;
  const extraPlatformHours = appSideHours * extraPlatform * Math.max(0, platforms - 1);
  const baseHours = appSideHours + sharedHours + extraPlatformHours;
  const bufferHours = baseHours * buffer;
  const totalHours = baseHours + bufferHours;
  const maintenanceMonthly = maintenanceHours * rate;
  return {
    setupHours,
    screenHours,
    appFeatureHours,
    appSideHours,
    sharedHours,
    extraPlatformHours,
    baseHours,
    bufferHours,
    totalHours,
    basePrice: baseHours * rate,
    price: totalHours * rate,
    maintenanceMonthly,
    maintenanceYearly: maintenanceMonthly * 12,
  };
}
