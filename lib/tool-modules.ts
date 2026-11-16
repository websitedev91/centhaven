import type { ComponentType } from 'react';
import HourlyRateContent from '@/tools/hourly-rate-calculator/content.mdx';
import HourlyToSalaryContent from '@/tools/hourly-to-salary-calculator/content.mdx';
import DayRateToSalaryContent from '@/tools/day-rate-to-salary-calculator/content.mdx';

/**
 * Maps a tool slug to its long-form content (server-rendered MDX, no client JS).
 * Add one line per tool when it is created, plus its calculator in components/ToolCalculator.tsx
 * (kept there so each page only ships its own calculator's JS).
 */
export const toolContent: Record<string, ComponentType> = {
  'hourly-rate-calculator': HourlyRateContent,
  'hourly-to-salary-calculator': HourlyToSalaryContent,
  'day-rate-to-salary-calculator': DayRateToSalaryContent,
};
