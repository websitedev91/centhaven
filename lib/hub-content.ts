import type { ComponentType } from 'react';
import FreelanceGuide from '@/hubs/freelance/content.mdx';
import SalaryGuide from '@/hubs/salary/content.mdx';
import BusinessGuide from '@/hubs/business/content.mdx';

/** Category slug → hub guide (server-rendered MDX, 300–500 words). */
export const hubContent: Record<string, ComponentType> = {
  freelance: FreelanceGuide,
  salary: SalaryGuide,
  business: BusinessGuide,
};
