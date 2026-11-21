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
import PayRaiseContent from '@/tools/pay-raise-calculator/content.mdx';
import CommissionContent from '@/tools/commission-calculator/content.mdx';
import SavingsGoalContent from '@/tools/savings-goal-calculator/content.mdx';
import LateFeeContent from '@/tools/late-fee-calculator/content.mdx';
import RunwayContent from '@/tools/runway-calculator/content.mdx';
import CacContent from '@/tools/cac-calculator/content.mdx';
import RoasContent from '@/tools/roas-calculator/content.mdx';
import CostPerLeadContent from '@/tools/cost-per-lead-calculator/content.mdx';
import AppDevelopmentCostContent from '@/tools/app-development-cost-calculator/content.mdx';
import MeetingCostContent from '@/tools/meeting-cost-calculator/content.mdx';
import MarginVsMarkupContent from '@/tools/margin-vs-markup-calculator/content.mdx';
import DebtSnowballContent from '@/tools/debt-snowball-calculator/content.mdx';
import CpcContent from '@/tools/cpc-calculator/content.mdx';
import BiweeklyPayContent from '@/tools/biweekly-pay-calculator/content.mdx';
import PaybackPeriodContent from '@/tools/payback-period-calculator/content.mdx';
import ConversionRateContent from '@/tools/conversion-rate-calculator/content.mdx';
import FoodCostContent from '@/tools/food-cost-calculator/content.mdx';
import WeeklyPayContent from '@/tools/weekly-pay-calculator/content.mdx';
import Budget503020Content from '@/tools/50-30-20-budget-calculator/content.mdx';
import CompaRatioContent from '@/tools/compa-ratio-calculator/content.mdx';
import CurrentRatioContent from '@/tools/current-ratio-calculator/content.mdx';
import BonusContent from '@/tools/bonus-calculator/content.mdx';
import PartTimeSalaryContent from '@/tools/part-time-salary-calculator/content.mdx';
import RuleOf72Content from '@/tools/rule-of-72-calculator/content.mdx';
import RentSplitContent from '@/tools/rent-split-calculator/content.mdx';
import BackPayContent from '@/tools/back-pay-calculator/content.mdx';
import SavingsRateContent from '@/tools/savings-rate-calculator/content.mdx';
import UnitPriceContent from '@/tools/unit-price-calculator/content.mdx';
import WeddingBudgetContent from '@/tools/wedding-budget-calculator/content.mdx';
import ContributionMarginContent from '@/tools/contribution-margin-calculator/content.mdx';

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
  'pay-raise-calculator': PayRaiseContent,
  'commission-calculator': CommissionContent,
  'savings-goal-calculator': SavingsGoalContent,
  'late-fee-calculator': LateFeeContent,
  'runway-calculator': RunwayContent,
  'cac-calculator': CacContent,
  'roas-calculator': RoasContent,
  'cost-per-lead-calculator': CostPerLeadContent,
  'app-development-cost-calculator': AppDevelopmentCostContent,
  'meeting-cost-calculator': MeetingCostContent,
  'margin-vs-markup-calculator': MarginVsMarkupContent,
  'debt-snowball-calculator': DebtSnowballContent,
  'cpc-calculator': CpcContent,
  'biweekly-pay-calculator': BiweeklyPayContent,
  'payback-period-calculator': PaybackPeriodContent,
  'conversion-rate-calculator': ConversionRateContent,
  'food-cost-calculator': FoodCostContent,
  'weekly-pay-calculator': WeeklyPayContent,
  '50-30-20-budget-calculator': Budget503020Content,
  'compa-ratio-calculator': CompaRatioContent,
  'current-ratio-calculator': CurrentRatioContent,
  'bonus-calculator': BonusContent,
  'part-time-salary-calculator': PartTimeSalaryContent,
  'rule-of-72-calculator': RuleOf72Content,
  'rent-split-calculator': RentSplitContent,
  'back-pay-calculator': BackPayContent,
  'savings-rate-calculator': SavingsRateContent,
  'unit-price-calculator': UnitPriceContent,
  'wedding-budget-calculator': WeddingBudgetContent,
  'contribution-margin-calculator': ContributionMarginContent,
};
