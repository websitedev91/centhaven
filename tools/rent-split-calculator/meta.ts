import type { ToolMeta } from '@/lib/tool-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /personal-finance/rent-split-calculator.
 * Change the keyword map first, then this file and content.mdx (CLAUDE.md SEO rules).
 * Rows are "Person 1–6", no names. Never call one method fairer; no tenancy or legal rules.
 */
export const meta: ToolMeta = {
  slug: 'rent-split-calculator',
  category: 'personal-finance',
  primaryKeyword: 'rent split calculator',
  secondaryKeywords: ['roommate rent calculator', 'split rent by income', 'split rent by room size', 'rent share calculator'],
  title: 'Rent Split Calculator – Split Rent by Room Size or Income',
  description:
    "Split rent and shared bills between up to 6 people: equally, by room size or by income. See each person's monthly share of the rent, the bills and the total.",
  h1: 'Rent Split Calculator',
  subtitle: 'Split the rent and shared bills between 2 to 6 people: equally, by room size or by income.',
  risk: 'green',
  relatedTools: ['50-30-20-budget-calculator', 'savings-goal-calculator', 'emergency-fund-calculator'],
  // Keyword-map questions first (exact, same order), then 2 more.
  faq: [
    {
      q: 'How do you split rent fairly?',
      a: 'There is no single right way; it depends on what your household agrees matters most. Splitting equally is simple. Splitting by room size means a bigger room pays more. Splitting by income means each person pays the same share of what they earn. The calculator shows all three with your own numbers, so you can compare them together and choose the one everyone is happy with.',
    },
    {
      q: 'How do you split rent by room size?',
      a: 'Add up everyone’s room sizes, then give each person the share their room makes up. With rooms of 150, 120 and 90 square feet and $2,400 rent, the total is 360, so the rooms pay $1,000, $800 and $600. Many households first split part of the rent equally for the kitchen and living room. Enter that share as the shared space percentage, and the rest is split by size.',
    },
    {
      q: 'How do you split rent by income?',
      a: 'Add up everyone’s income, then each person pays the share of the rent that their income makes up. If three people earn $4,000, $3,000 and $3,000 a month, the total is $10,000, so they pay 40%, 30% and 30%. On $2,400 rent that is $960, $720 and $720. Use the same period for everyone, such as monthly take-home pay, so the shares compare fairly.',
    },
    {
      q: 'How should roommates split utility bills?',
      a: 'The two common ways are equally, because everyone uses the kitchen, heating and internet, or the same way as the rent. Enter your shared bills and pick Equally or Same way as rent in the calculator. With $300 of bills between three people, equally is $100 each. Split like rent by room size, it is $125, $100 and $75. Your household decides which suits you.',
    },
    {
      q: "What if the rent shares don't add up exactly?",
      a: 'The calculator makes sure they do. Each share is rounded down to the cent, then any leftover cents go to Person 1, then Person 2, and so on. Splitting $1,000 three ways gives $333.34, $333.33 and $333.33, which adds up to exactly $1,000. The note under the result explains this, so nobody is surprised by a one-cent difference when the rent is paid.',
    },
    {
      q: 'Can a couple share one room?',
      a: 'Yes. Treat the couple as one person in the calculator, with their room size or their combined income. The result shows that room’s share of the rent. The couple can then split their own share between them however they like, for example in half. Doing it this way stops a shared room from being counted twice when you split the rent by room size.',
    },
    {
      q: 'Why are there no name boxes?',
      a: 'For privacy. The calculator keeps your numbers in the page address so you can share a link with your housemates, and names would end up in that link and in website analytics. Instead, everyone is Person 1 to Person 6. Agree who is who before you share the link, for example by listing people in the order of the rooms or the bedroom doors.',
    },
  ],
};
