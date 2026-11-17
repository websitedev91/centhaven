import Link from 'next/link';
import { StaticPage, staticPageMetadata } from '@/components/StaticPage';
import { site } from '@/config/site';

export const metadata = staticPageMetadata(
  '/methodology',
  'How CentHaven builds and checks its calculators: official fee pages with the date we checked them, tested formulas, worked examples and a fixed update calendar.',
);

export default function MethodologyPage() {
  return (
    <StaticPage
      href="/methodology"
      title="How we build our calculators"
      intro="Money tools must be right. Here is how we build, test and update every calculator on CentHaven."
    >
      <p className="font-[550] text-ink">{site.byline}.</p>

      <h2>1. Official sources for every fee</h2>
      <p>
        Any number that can change, such as a payment or platform fee, comes from the official fee page of the company
        that sets it. We never use numbers from blogs or forums.
      </p>
      <p>
        For each fee we save the official page link, the exact line we took the number from, the date it takes effect
        and the date we last checked it. Each tool lists these sources at the bottom of its page. If we can&apos;t confirm
        a number from an official source, we don&apos;t publish the tool.
      </p>

      <h2>2. Tested formulas</h2>
      <p>
        Every formula is written once, kept separate from the page design, and tested automatically. Before a tool goes
        live, it must match at least three worked examples. We check those against an official calculator where one
        exists, or against a careful manual calculation.
      </p>
      <p>
        We round money only when we show it to you, so small rounding errors don&apos;t add up inside the maths. Quotes
        and invoices are the one exception: each line is rounded to the cent, so the document adds up exactly.
      </p>

      <h2>3. What we don&apos;t build</h2>
      <p>
        We don&apos;t build tools that depend on tax rules, government limits or legal thresholds. Fee calculators use each
        company&apos;s official fee page and show the date we last checked it.
      </p>

      <h2>4. Quality checks before publishing</h2>
      <p>Before a tool goes live, it must pass all of these checks:</p>
      <ul>
        <li>Works well on phones and desktops</li>
        <li>All rates come from official sources and are listed with dates</li>
        <li>All test cases pass</li>
        <li>Clear explanation, formula, worked examples and FAQ</li>
        <li>Fast to load and accessible to keyboard and screen-reader users</li>
        <li>A clear disclaimer</li>
      </ul>

      <h2>5. Update calendar</h2>
      <p>We re-check sources on a fixed schedule, and sooner when we hear about a change:</p>
      <ul>
        <li>Payment and platform fees (PayPal, Wise, Payoneer, Stripe, Upwork, Fiverr): every 3 months</li>
        <li>Pure maths tools: no rates, so no update needed</li>
      </ul>
      <p>When a number changes, we update the tool, re-run every test and publish the updated tool.</p>

      <h2>Our results are estimates</h2>
      <p>
        Calculators simplify real life. Your own situation may include rules, deductions or fees that a general tool
        can&apos;t know about. Use our results as a starting point, and check important decisions with a qualified
        professional. Read our full <Link href="/disclaimer">disclaimer</Link>.
      </p>
      <p>
        Found an error? Email <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a> or use our{' '}
        <Link href="/contact">contact page</Link>. We fix confirmed mistakes quickly.
      </p>
    </StaticPage>
  );
}
