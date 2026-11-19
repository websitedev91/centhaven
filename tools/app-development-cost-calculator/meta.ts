import type { ToolMeta } from '@/lib/tool-types';

/**
 * SEO fields copied exactly from docs/seo/keyword-map.md → /freelance/app-development-cost-calculator.
 * Change the keyword map first, then this file and content.mdx (CLAUDE.md SEO rules).
 * Pure maths: hours × the user's own rate. Never state what apps cost on average.
 */
export const meta: ToolMeta = {
  slug: 'app-development-cost-calculator',
  category: 'freelance',
  primaryKeyword: 'app development cost calculator',
  secondaryKeywords: [
    'app cost calculator',
    'how much does it cost to build an app',
    'mobile app cost estimate',
    'how much to charge for an app',
  ],
  title: 'App Development Cost Calculator – Estimate an App Project',
  description:
    'Estimate what an app should cost from its platforms, screens and features, the hours each one takes and your hourly rate. Edit every example to fit your work.',
  h1: 'App Development Cost Calculator',
  subtitle: 'Price an app project from the platforms, screens and features it needs, using your own hours and rate.',
  risk: 'green',
  relatedTools: ['website-design-cost-calculator', 'hourly-rate-calculator', 'freelance-quote-generator'],
  // Keyword-map questions first (exact, same order), then 2 more.
  faq: [
    {
      q: 'How much does it cost to build an app?',
      a: 'It depends on how many hours the app takes and the hourly rate of whoever builds it, so there is no single price. The number of screens, the platforms and features like payments, chat or an admin dashboard all add hours. This calculator adds up those hours from values you can edit, adds a buffer, and multiplies the total by your own rate.',
    },
    {
      q: 'How much should I charge to develop an app?',
      a: 'Start from your own hourly rate and an honest estimate of the hours. Price each part of the app, add a buffer for changes and project management, and quote the total as a project price. If you are not sure of your rate, work it out first from your income goal, costs and billable hours, then use it here to build the estimate.',
    },
    {
      q: 'What affects app development cost?',
      a: 'The biggest factors are the number of screens, the platforms you build for and the features. Logins, payments, chat, offline use and device features such as maps or the camera each add work. A backend, an admin dashboard and testing add shared hours. Changes during the project add more, which is why the calculator includes a buffer you can set.',
    },
    {
      q: 'Does building for iOS and Android cost twice as much?',
      a: 'Usually not. Shared work such as the backend, the admin dashboard and testing is built once. The app-side work, such as screens and features, has to be done again or adapted for each extra platform. How much depends on your tools and approach, so the calculator asks you for that share as a percentage and applies it to each added platform.',
    },
    {
      q: 'Should I charge for app maintenance?',
      a: 'Yes, most apps need ongoing work after launch. New phone and operating system versions, bug fixes, store policy changes and small requests all take time. Agree a number of hours each month and charge it as a monthly plan, so the client knows the cost and you have steady income. Enter those hours in the calculator to see the monthly and yearly fee.',
    },
    {
      q: 'How many hours does an app take?',
      a: 'There is no standard number, because every app is different. The best estimate comes from breaking the project into parts, such as setup, each screen and each feature, and estimating each one from your own past work. The calculator starts with example hours for each part. Change them to match how fast you work, and keep notes after each project to improve them.',
    },
    {
      q: 'Should I use one codebase for iOS and Android?',
      a: 'A shared codebase can cut the extra work for a second platform, while separate native apps can take more hours but give you more control. The right choice depends on the app and your skills. Either way, set the extra-platform percentage in the calculator to match your approach, lower for shared code and higher for separate builds, and compare the two prices.',
    },
  ],
};
