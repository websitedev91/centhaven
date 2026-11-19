import type { ToolMeta } from '@/lib/tool-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /business/meeting-cost-calculator.
 * Change the keyword map first, then this file and content.mdx (CLAUDE.md SEO rules).
 * Pure maths: hourly costs come from the user; never suggest an average wage or overhead %.
 */
export const meta: ToolMeta = {
  slug: 'meeting-cost-calculator',
  category: 'business',
  primaryKeyword: 'meeting cost calculator',
  secondaryKeywords: ['cost of a meeting calculator', 'how much does a meeting cost', 'recurring meeting cost', 'meeting cost per year'],
  title: 'Meeting Cost Calculator – What Your Meetings Really Cost',
  description:
    'See what a meeting costs from the number of people, their hourly cost and its length. Add per-person rates, and see the weekly and yearly cost of a repeat.',
  h1: 'Meeting Cost Calculator',
  subtitle: 'See what a meeting costs in people’s time, and what a regular meeting adds up to over a year.',
  risk: 'green',
  relatedTools: ['utilization-rate-calculator', 'hourly-to-salary-calculator', 'break-even-calculator'],
  // Keyword-map questions first (exact, same order), then 2 more.
  faq: [
    {
      q: 'How do you calculate the cost of a meeting?',
      a: 'Multiply the number of people by their hourly cost, then by the length of the meeting in hours. Six people at $50 an hour in a one-hour meeting cost 6 × $50 × 1 = $300. If people are paid different amounts, add up everyone’s hourly cost instead and multiply that total by the hours. The calculator does both, so choose whichever fits your team.',
    },
    {
      q: 'What hourly cost should I use for each person?',
      a: 'Use what an hour of that person’s time costs you. For a quick answer, use their hourly pay. If you know your other employment costs, such as pension, insurance or benefits, you can add them for a fuller picture. For freelancers or contractors, use their hourly rate. The calculator never fills in an average wage, so the result reflects your real numbers.',
    },
    {
      q: 'How much does a weekly meeting cost in a year?',
      a: 'Multiply the cost of one meeting by how many times it runs each week, then by the weeks a year it runs. An eight-person, 45-minute meeting at $75 an hour costs $450. Held once a week for 48 weeks, that is $21,600 a year. Choose Repeats in the calculator and it shows both the weekly and yearly cost.',
    },
    {
      q: 'How can I make meetings cheaper?',
      a: 'Shorten them, invite fewer people, or hold them less often. Cutting a weekly hour-long meeting to 45 minutes saves a quarter of its yearly cost. Invite only the people who need to decide or contribute, and share notes with everyone else. Use Compare two plans in the calculator to see what a shorter or smaller meeting would save over a year.',
    },
    {
      q: 'Should I count preparation time?',
      a: 'You can, if you want the full cost. Preparation, travel between rooms and catching up afterwards all take time too. The simplest way is to add those minutes to the meeting length, so a 60-minute meeting with 15 minutes of preparation becomes 75 minutes. The calculator counts only the minutes you enter, so the choice of what to include stays yours.',
    },
    {
      q: 'Should I use salary or hourly pay?',
      a: 'Use an hourly figure, because meetings are measured in hours. If someone is on a salary, divide their yearly pay by the hours they work in a year to get an hourly cost. Someone paid $62,400 who works 40 hours a week for 52 weeks earns $30 an hour. The hourly to salary calculator can do that conversion for you in either direction.',
    },
    {
      q: 'Does this include lost focus time?',
      a: 'No. The calculator counts only the time people spend in the meeting itself, at the hourly costs you enter. Meetings can also break up time for deep work, and getting back into a task takes a while, but that cost is hard to measure and varies from person to person. Treat the result as the minimum a meeting costs, not the full figure.',
    },
  ],
};
