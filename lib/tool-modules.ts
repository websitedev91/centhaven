import type { ComponentType } from 'react';
import HourlyRateContent from '@/tools/hourly-rate-calculator/content.mdx';
import HourlyToSalaryContent from '@/tools/hourly-to-salary-calculator/content.mdx';
import DayRateToSalaryContent from '@/tools/day-rate-to-salary-calculator/content.mdx';
import RateIncreaseContent from '@/tools/rate-increase-calculator/content.mdx';
import UtilizationRateContent from '@/tools/utilization-rate-calculator/content.mdx';
import BreakEvenContent from '@/tools/break-even-calculator/content.mdx';
import ConsultingFeeContent from '@/tools/consulting-fee-calculator/content.mdx';
import RetainerFeeContent from '@/tools/retainer-fee-calculator/content.mdx';
import StraightLineDepreciationContent from '@/tools/straight-line-depreciation-calculator/content.mdx';
import EmergencyFundContent from '@/tools/emergency-fund-calculator/content.mdx';
import JobOfferComparisonContent from '@/tools/job-offer-comparison-calculator/content.mdx';
import WebsiteDesignCostContent from '@/tools/website-design-cost-calculator/content.mdx';
import FreelanceQuoteContent from '@/tools/freelance-quote-generator/content.mdx';
import FreelanceInvoiceContent from '@/tools/freelance-invoice-generator/content.mdx';
import UpworkFeeContent from '@/tools/upwork-fee-calculator/content.mdx';
import PaymentProcessingFeeContent from '@/tools/payment-processing-fee-calculator/content.mdx';

/**
 * Maps a tool slug to its long-form content (server-rendered MDX, no client JS).
 * Add one line per tool when it is created, plus its calculator in components/ToolCalculator.tsx
 * (kept there so each page only ships its own calculator's JS).
 */
export const toolContent: Record<string, ComponentType> = {
  'hourly-rate-calculator': HourlyRateContent,
  'hourly-to-salary-calculator': HourlyToSalaryContent,
  'day-rate-to-salary-calculator': DayRateToSalaryContent,
  'rate-increase-calculator': RateIncreaseContent,
  'utilization-rate-calculator': UtilizationRateContent,
  'break-even-calculator': BreakEvenContent,
  'consulting-fee-calculator': ConsultingFeeContent,
  'retainer-fee-calculator': RetainerFeeContent,
  'straight-line-depreciation-calculator': StraightLineDepreciationContent,
  'emergency-fund-calculator': EmergencyFundContent,
  'job-offer-comparison-calculator': JobOfferComparisonContent,
  'website-design-cost-calculator': WebsiteDesignCostContent,
  'freelance-quote-generator': FreelanceQuoteContent,
  'freelance-invoice-generator': FreelanceInvoiceContent,
  'upwork-fee-calculator': UpworkFeeContent,
  'payment-processing-fee-calculator': PaymentProcessingFeeContent,
};
