/**
 * Single source of truth for every tool and its publishing status (PRD §5).
 *
 * - Only `live` tools get pages, sitemap entries and links.
 * - New tools start as `draft`; set `ready` when all quality gates pass.
 * - Never set `live` unless Puru asks. Going live = status 'live' + publishDate.
 * - Local preview only: `npm run build:preview` (PREVIEW_DRAFTS=1) treats draft/ready tools as
 *   live so they can be viewed. postbuild marks that output as not deployable and exits non-zero.
 */
import type { RegistryRow, ToolEntry, ToolMeta, ToolStatus } from './tool-types';
import { meta as hourlyRate } from '@/tools/hourly-rate-calculator/meta';
import { meta as hourlyToSalary } from '@/tools/hourly-to-salary-calculator/meta';
import { meta as dayRateToSalary } from '@/tools/day-rate-to-salary-calculator/meta';
import { meta as rateIncrease } from '@/tools/rate-increase-calculator/meta';
import { meta as utilizationRate } from '@/tools/utilization-rate-calculator/meta';
import { meta as breakEven } from '@/tools/break-even-calculator/meta';
import { meta as consultingFee } from '@/tools/consulting-fee-calculator/meta';
import { meta as retainerFee } from '@/tools/retainer-fee-calculator/meta';
import { meta as straightLineDepreciation } from '@/tools/straight-line-depreciation-calculator/meta';
import { meta as emergencyFund } from '@/tools/emergency-fund-calculator/meta';
import { meta as jobOfferComparison } from '@/tools/job-offer-comparison-calculator/meta';
import { meta as websiteDesignCost } from '@/tools/website-design-cost-calculator/meta';
import { meta as freelanceQuote } from '@/tools/freelance-quote-generator/meta';
import { meta as freelanceInvoice } from '@/tools/freelance-invoice-generator/meta';
import { meta as upworkFee } from '@/tools/upwork-fee-calculator/meta';
import { meta as paymentProcessingFee } from '@/tools/payment-processing-fee-calculator/meta';
import { meta as payRaise } from '@/tools/pay-raise-calculator/meta';
import { meta as commission } from '@/tools/commission-calculator/meta';
import { meta as savingsGoal } from '@/tools/savings-goal-calculator/meta';
import { meta as lateFee } from '@/tools/late-fee-calculator/meta';
import { meta as runway } from '@/tools/runway-calculator/meta';
import { meta as cac } from '@/tools/cac-calculator/meta';
import { meta as roas } from '@/tools/roas-calculator/meta';
import { meta as costPerLead } from '@/tools/cost-per-lead-calculator/meta';
import { meta as appDevelopmentCost } from '@/tools/app-development-cost-calculator/meta';
import { meta as meetingCost } from '@/tools/meeting-cost-calculator/meta';
import { meta as marginVsMarkup } from '@/tools/margin-vs-markup-calculator/meta';
import { meta as debtSnowball } from '@/tools/debt-snowball-calculator/meta';
import { meta as cpc } from '@/tools/cpc-calculator/meta';
import { meta as biweeklyPay } from '@/tools/biweekly-pay-calculator/meta';
import { meta as paybackPeriod } from '@/tools/payback-period-calculator/meta';
import { meta as conversionRate } from '@/tools/conversion-rate-calculator/meta';
import { meta as foodCost } from '@/tools/food-cost-calculator/meta';
import { meta as weeklyPay } from '@/tools/weekly-pay-calculator/meta';
import { meta as budget503020 } from '@/tools/50-30-20-budget-calculator/meta';
import { meta as compaRatio } from '@/tools/compa-ratio-calculator/meta';
import { meta as currentRatio } from '@/tools/current-ratio-calculator/meta';
import { meta as bonus } from '@/tools/bonus-calculator/meta';
import { meta as partTimeSalary } from '@/tools/part-time-salary-calculator/meta';
import { meta as ruleOf72 } from '@/tools/rule-of-72-calculator/meta';
import { meta as rentSplit } from '@/tools/rent-split-calculator/meta';

type Publishing = Pick<ToolEntry, 'status' | 'lastUpdated' | 'publishDate' | 'reviewedBy'>;

export function row(meta: ToolMeta, p: Publishing): RegistryRow {
  return { slug: meta.slug, category: meta.category, title: meta.h1, risk: meta.risk, ...p, meta };
}

export const registry: readonly RegistryRow[] = [
  row(hourlyRate, { status: 'live', publishDate: '2026-11-16', lastUpdated: '2026-11-17' }),
  row(hourlyToSalary, { status: 'live', publishDate: '2026-11-16', lastUpdated: '2026-11-16' }),
  row(dayRateToSalary, { status: 'live', publishDate: '2026-11-16', lastUpdated: '2026-11-16' }),
  row(rateIncrease, { status: 'live', publishDate: '2026-11-16', lastUpdated: '2026-11-16' }),
  row(utilizationRate, { status: 'live', publishDate: '2026-11-16', lastUpdated: '2026-11-16' }),
  row(breakEven, { status: 'live', publishDate: '2026-11-16', lastUpdated: '2026-11-16' }),
  row(consultingFee, { status: 'live', publishDate: '2026-11-17', lastUpdated: '2026-11-17' }),
  row(retainerFee, { status: 'live', publishDate: '2026-11-17', lastUpdated: '2026-11-17' }),
  row(straightLineDepreciation, { status: 'live', publishDate: '2026-11-17', lastUpdated: '2026-11-17' }),
  row(emergencyFund, { status: 'live', publishDate: '2026-11-17', lastUpdated: '2026-11-17' }),
  row(jobOfferComparison, { status: 'live', publishDate: '2026-11-18', lastUpdated: '2026-11-18' }),
  row(websiteDesignCost, { status: 'live', publishDate: '2026-11-18', lastUpdated: '2026-11-18' }),
  row(freelanceQuote, { status: 'live', publishDate: '2026-11-18', lastUpdated: '2026-11-18' }),
  row(freelanceInvoice, { status: 'live', publishDate: '2026-11-18', lastUpdated: '2026-11-18' }),
  row(upworkFee, { status: 'live', publishDate: '2026-11-18', lastUpdated: '2026-11-18' }),
  row(paymentProcessingFee, { status: 'live', publishDate: '2026-11-18', lastUpdated: '2026-11-18' }),
  row(payRaise, { status: 'live', publishDate: '2026-11-18', lastUpdated: '2026-11-18' }),
  row(commission, { status: 'live', publishDate: '2026-11-18', lastUpdated: '2026-11-18' }),
  row(savingsGoal, { status: 'live', publishDate: '2026-11-18', lastUpdated: '2026-11-18' }),
  row(lateFee, { status: 'live', publishDate: '2026-11-18', lastUpdated: '2026-11-18' }),
  row(runway, { status: 'live', publishDate: '2026-11-18', lastUpdated: '2026-11-18' }),
  row(cac, { status: 'live', publishDate: '2026-11-19', lastUpdated: '2026-11-19' }),
  row(roas, { status: 'live', publishDate: '2026-11-19', lastUpdated: '2026-11-19' }),
  row(costPerLead, { status: 'live', publishDate: '2026-11-19', lastUpdated: '2026-11-19' }),
  row(appDevelopmentCost, { status: 'live', publishDate: '2026-11-19', lastUpdated: '2026-11-19' }),
  row(meetingCost, { status: 'live', publishDate: '2026-11-19', lastUpdated: '2026-11-19' }),
  row(marginVsMarkup, { status: 'live', publishDate: '2026-11-20', lastUpdated: '2026-11-20' }),
  row(debtSnowball, { status: 'live', publishDate: '2026-11-20', lastUpdated: '2026-11-20' }),
  row(cpc, { status: 'live', publishDate: '2026-11-20', lastUpdated: '2026-11-20' }),
  row(biweeklyPay, { status: 'live', publishDate: '2026-11-20', lastUpdated: '2026-11-20' }),
  row(paybackPeriod, { status: 'live', publishDate: '2026-11-20', lastUpdated: '2026-11-20' }),
  row(conversionRate, { status: 'live', publishDate: '2026-11-20', lastUpdated: '2026-11-20' }),
  row(foodCost, { status: 'live', publishDate: '2026-11-20', lastUpdated: '2026-11-20' }),
  row(weeklyPay, { status: 'live', publishDate: '2026-11-20', lastUpdated: '2026-11-20' }),
  row(budget503020, { status: 'live', publishDate: '2026-11-20', lastUpdated: '2026-11-20' }),
  row(compaRatio, { status: 'live', publishDate: '2026-11-20', lastUpdated: '2026-11-20' }),
  row(currentRatio, { status: 'live', publishDate: '2026-11-21', lastUpdated: '2026-11-21' }),
  row(bonus, { status: 'live', publishDate: '2026-11-21', lastUpdated: '2026-11-21' }),
  row(partTimeSalary, { status: 'live', publishDate: '2026-11-21', lastUpdated: '2026-11-21' }),
  row(ruleOf72, { status: 'live', publishDate: '2026-11-21', lastUpdated: '2026-11-21' }),
  row(rentSplit, { status: 'live', publishDate: '2026-11-21', lastUpdated: '2026-11-21' }),
];

/** Local preview builds only (see next.config.ts `env` and scripts/postbuild.mjs). */
export const PREVIEW_DRAFTS = process.env.PREVIEW_DRAFTS === '1';

/** Whether a tool gets a page and links: `live`, or any tool in a preview build. */
export function isPublished(t: Pick<ToolEntry, 'status'>): boolean {
  return t.status === 'live' || PREVIEW_DRAFTS;
}

export function allTools(): readonly RegistryRow[] {
  return registry;
}

export function toolsWithStatus(status: ToolStatus): RegistryRow[] {
  return registry.filter((t) => t.status === status);
}

export function liveTools(): RegistryRow[] {
  return registry.filter(isPublished);
}

export function getLiveTool(category: string, slug: string): RegistryRow | undefined {
  return registry.find((t) => isPublished(t) && t.category === category && t.slug === slug);
}

export function getLiveToolBySlug(slug: string): RegistryRow | undefined {
  return registry.find((t) => isPublished(t) && t.slug === slug);
}

/** Live tools that get an /embed page (document generators never do: personal data). */
export function embeddableTools(): RegistryRow[] {
  return liveTools().filter((t) => !t.meta.document);
}

export function getEmbeddableTool(slug: string): RegistryRow | undefined {
  return embeddableTools().find((t) => t.slug === slug);
}

export function liveToolsInCategory(category: string): RegistryRow[] {
  return liveTools().filter((t) => t.category === category);
}

/** Categories that have at least one live tool. */
export function liveCategories(): string[] {
  return [...new Set(liveTools().map((t) => t.category))];
}

/** Related tools that are live (CLAUDE.md: links to live tools only), max 6. */
export function liveRelated(tool: RegistryRow): RegistryRow[] {
  return tool.meta.relatedTools
    .map((slug) => getLiveToolBySlug(slug))
    .filter((t): t is RegistryRow => t !== undefined)
    .slice(0, 6);
}

export function toolPath(t: Pick<ToolEntry, 'category' | 'slug'>): string {
  return `/${t.category}/${t.slug}`;
}
