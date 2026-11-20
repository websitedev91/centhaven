'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

/**
 * Picks a tool's calculator by slug. The dynamic imports live in a CLIENT module on purpose:
 * that is where Next code-splits them, so each tool page downloads only its own calculator
 * (a static or server-side import would put every calculator on every tool page).
 * They still render on the server, so the default result is in the static HTML.
 *
 * Add one line per tool when it is created (and its Content in lib/tool-modules.ts).
 */
const calculators: Record<string, ComponentType> = {
  'hourly-rate-calculator': dynamic(() => import('@/tools/hourly-rate-calculator/Calculator')),
  'hourly-to-salary-calculator': dynamic(() => import('@/tools/hourly-to-salary-calculator/Calculator')),
  'day-rate-to-salary-calculator': dynamic(() => import('@/tools/day-rate-to-salary-calculator/Calculator')),
  'rate-increase-calculator': dynamic(() => import('@/tools/rate-increase-calculator/Calculator')),
  'utilization-rate-calculator': dynamic(() => import('@/tools/utilization-rate-calculator/Calculator')),
  'break-even-calculator': dynamic(() => import('@/tools/break-even-calculator/Calculator')),
  'consulting-fee-calculator': dynamic(() => import('@/tools/consulting-fee-calculator/Calculator')),
  'retainer-fee-calculator': dynamic(() => import('@/tools/retainer-fee-calculator/Calculator')),
  'straight-line-depreciation-calculator': dynamic(() => import('@/tools/straight-line-depreciation-calculator/Calculator')),
  'emergency-fund-calculator': dynamic(() => import('@/tools/emergency-fund-calculator/Calculator')),
  'job-offer-comparison-calculator': dynamic(() => import('@/tools/job-offer-comparison-calculator/Calculator')),
  'website-design-cost-calculator': dynamic(() => import('@/tools/website-design-cost-calculator/Calculator')),
  'freelance-quote-generator': dynamic(() => import('@/tools/freelance-quote-generator/Calculator')),
  'freelance-invoice-generator': dynamic(() => import('@/tools/freelance-invoice-generator/Calculator')),
  'upwork-fee-calculator': dynamic(() => import('@/tools/upwork-fee-calculator/Calculator')),
  'payment-processing-fee-calculator': dynamic(() => import('@/tools/payment-processing-fee-calculator/Calculator')),
  'pay-raise-calculator': dynamic(() => import('@/tools/pay-raise-calculator/Calculator')),
  'commission-calculator': dynamic(() => import('@/tools/commission-calculator/Calculator')),
  'savings-goal-calculator': dynamic(() => import('@/tools/savings-goal-calculator/Calculator')),
  'late-fee-calculator': dynamic(() => import('@/tools/late-fee-calculator/Calculator')),
  'runway-calculator': dynamic(() => import('@/tools/runway-calculator/Calculator')),
  'cac-calculator': dynamic(() => import('@/tools/cac-calculator/Calculator')),
  'roas-calculator': dynamic(() => import('@/tools/roas-calculator/Calculator')),
  'cost-per-lead-calculator': dynamic(() => import('@/tools/cost-per-lead-calculator/Calculator')),
  'app-development-cost-calculator': dynamic(() => import('@/tools/app-development-cost-calculator/Calculator')),
  'meeting-cost-calculator': dynamic(() => import('@/tools/meeting-cost-calculator/Calculator')),
  'margin-vs-markup-calculator': dynamic(() => import('@/tools/margin-vs-markup-calculator/Calculator')),
  'debt-snowball-calculator': dynamic(() => import('@/tools/debt-snowball-calculator/Calculator')),
  'cpc-calculator': dynamic(() => import('@/tools/cpc-calculator/Calculator')),
  'biweekly-pay-calculator': dynamic(() => import('@/tools/biweekly-pay-calculator/Calculator')),
  'payback-period-calculator': dynamic(() => import('@/tools/payback-period-calculator/Calculator')),
};

export const calculatorSlugs = Object.keys(calculators);

export function ToolCalculator({ slug }: { slug: string }) {
  const Calculator = calculators[slug];
  return Calculator ? <Calculator /> : null;
}
