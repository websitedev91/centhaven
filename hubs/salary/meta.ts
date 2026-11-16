import type { HubMeta } from '@/lib/hub-types';

/** SEO fields copied exactly from docs/seo/keyword-map.md → /salary/ (hub: Salary & Pay). */
export const hub: HubMeta = {
  slug: 'salary',
  primaryKeyword: 'salary calculators',
  secondaryKeywords: ['hourly to salary calculator', 'pay calculator'],
  title: 'Salary & Pay Calculators – Hourly, Salary and Day Rate',
  description:
    'Convert hourly wages, salaries and day rates, compare job offers and contractor pay. Simple, free salary and pay calculators with clear examples.',
  h1: 'Salary & Pay Calculators',
  intro:
    'Free salary calculators to turn an hourly wage into yearly, monthly and weekly pay, or a salary back into an hourly rate. All figures are before tax, so you can compare offers on equal terms.',
  faq: [
    {
      q: 'Are these salary figures before or after tax?',
      a: 'Before tax. Every salary and pay figure in this section is gross pay, before income tax, social security, pension contributions and other deductions. That keeps comparisons fair, because job offers and contracts are usually quoted gross. Your take-home pay depends on your country and situation, so check an official tax calculator or your payslip for the net figure.',
    },
    {
      q: 'How do I compare an hourly job with a salaried one?',
      a: 'Convert both to the same unit. Use the hourly to salary calculator to turn the hourly wage into a yearly figure with the same hours and paid weeks, or switch it to salary to hourly to see what the salary is worth per hour. Then look at the hours behind each offer, because a higher salary with longer hours can pay less per hour.',
    },
    {
      q: 'How do I compare a contract with a permanent job?',
      a: 'A contractor is not paid for holidays, sick days or gaps between contracts, and usually gets no pension or other benefits. So a day rate cannot be compared with a salary directly. The day rate to salary calculator takes those unpaid days out and adds a benefits allowance, so you can see what the contract is really worth as a salary.',
    },
  ],
  lastUpdated: '2026-11-16',
};
