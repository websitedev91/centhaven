import type { ComponentType } from 'react';
import HourlyRateCalculator from '@/tools/hourly-rate-calculator/Calculator';
import HourlyRateContent from '@/tools/hourly-rate-calculator/content.mdx';

/**
 * Maps a tool slug to its UI modules. Server-side only (used by the tool page).
 * Add one line per tool when it is created.
 */
export interface ToolModules {
  Calculator: ComponentType;
  Content: ComponentType;
}

export const toolModules: Record<string, ToolModules> = {
  'hourly-rate-calculator': { Calculator: HourlyRateCalculator, Content: HourlyRateContent },
};
