import type { ToolMeta } from '@/lib/tool-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /business/utilization-rate-calculator.
 * Change the keyword map first, then this file and content.mdx (CLAUDE.md SEO rules).
 */
export const meta: ToolMeta = {
  slug: 'utilization-rate-calculator',
  category: 'business',
  primaryKeyword: 'utilization rate calculator',
  secondaryKeywords: ['billable utilization calculator', 'billable hours calculator', 'how to calculate utilization rate'],
  title: 'Utilization Rate Calculator – Billable Utilization %',
  description:
    'Calculate your billable utilization rate, compare it with a target and see the revenue gap. Simple for freelancers, consultants and agencies.',
  h1: 'Utilization Rate Calculator',
  subtitle: 'See what share of your available hours is billable, how far you are from your target and what the gap is worth.',
  risk: 'green',
  relatedTools: ['hourly-rate-calculator', 'rate-increase-calculator', 'break-even-calculator'],
  affiliateId: 'time-tracking-software',
  // Keyword-map questions first (exact, same order), then 2 more from the spec.
  faq: [
    {
      q: 'What is utilization rate?',
      a: 'Utilization rate is the share of your available working hours that you bill to clients. If you could work 40 hours this week and billed 28 of them, your utilization is 70%. Freelancers, consultants and agencies use it to see how much of their time actually earns money, and to spot when admin, sales or quiet periods are eating into paid work.',
    },
    {
      q: 'What is a good utilization rate?',
      a: 'It depends on your role and how much time you need for sales, admin and learning. Many agencies aim for somewhere around 70 to 80% for client-facing staff, but that is a common range, not a rule. Founders and team leads usually run much lower because they sell and manage. The best target is one that covers your costs without burning you out.',
    },
    {
      q: 'How do I calculate billable utilization?',
      a: 'Divide your billable hours by your available hours for the same period, then multiply by 100. For example, 28 billable hours out of 40 available is 28 ÷ 40 = 0.7, or 70%. Use the same period for both numbers, whether that is a week, a month or a year, and count only hours a client actually pays for as billable.',
    },
    {
      q: 'Why not aim for 100% utilization?',
      a: 'Because the unbilled hours are not wasted. You need time to find new clients, send invoices, answer emails, learn new skills and rest. At 100% there is no slack for any of that, so the pipeline dries up and burnout follows. A target below 100% leaves room for the work that keeps future billable hours coming in.',
    },
    {
      q: 'How can I increase my utilization?',
      a: 'Start by tracking where your non-billable hours really go. Then cut or batch admin, use templates for proposals and invoices, and bill for work you currently give away, such as extra revisions or long calls. Retainers and longer projects reduce the time spent finding new work. Raising your rate can also help, because you need fewer billable hours to earn the same.',
    },
    {
      q: 'What counts as non-billable time?',
      a: 'Anything you cannot charge a client for. That usually includes sales calls and proposals, invoicing and bookkeeping, internal meetings, email, learning, marketing your own business and time between projects. Some of it is essential, so the goal is not to remove it but to keep it in proportion. Tracking it for a few weeks shows where the hours really go.',
    },
    {
      q: 'How do agencies use utilization?',
      a: 'Agencies track utilization for each person and for the whole team to plan hiring, pricing and workload. If utilization stays well above target, the team may be stretched and it may be time to hire. If it stays well below, there may not be enough client work for the team. They also use it to check that their rates cover the time staff cannot bill.',
    },
  ],
};
