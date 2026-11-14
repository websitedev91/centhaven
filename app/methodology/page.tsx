import Link from 'next/link';
import { StaticPage, staticPageMetadata } from '@/components/StaticPage';

export const metadata = staticPageMetadata(
  '/methodology',
  'How CentHaven builds and checks its calculators: official sources for every rate, tested formulas, expert review for tax tools and a fixed update calendar.',
);

export default function MethodologyPage() {
  return (
    <StaticPage
      href="/methodology"
      title="How we build our calculators"
      intro="Money tools must be right. Here is how we build, test and update every calculator on CentHaven."
    >
      <h2>1. Official sources for every rate</h2>
      <p>
        Any number that can change, such as a platform fee, a tax rate or a contribution limit, comes from an official
        source: the tax authority, the government or the company that sets the fee. We never use numbers from blogs or
        forums.
      </p>
      <p>
        For each rate we save the official page link, the exact line we took the number from, the date it takes effect
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
        We round money only when we show it to you. That way small rounding errors don&apos;t add up inside the maths.
      </p>

      <h2>3. Expert review for tax tools</h2>
      <p>
        We rate each tool by risk. Pure maths tools, like an hourly rate or compound interest calculator, are low risk.
        Tools that depend on tax rules are high risk. A qualified professional reviews every high-risk tool before it
        goes live, and we show the reviewer&apos;s name on the page.
      </p>

      <h2>4. Quality checks before publishing</h2>
      <p>Before a tool goes live, it must pass all of these checks:</p>
      <ul>
        <li>Works well on phones and desktops</li>
        <li>All rates come from official sources and are listed with dates</li>
        <li>All test cases pass</li>
        <li>Clear explanation, formula, worked examples and FAQ</li>
        <li>Fast to load and accessible to keyboard and screen-reader users</li>
        <li>A clear disclaimer and a &ldquo;last updated&rdquo; date</li>
      </ul>

      <h2>5. Update calendar</h2>
      <p>We re-check sources on a fixed schedule, and sooner when we hear about a change:</p>
      <ul>
        <li>Payment and platform fees (PayPal, Wise, Payoneer, Stripe, Upwork, Fiverr): every 3 months</li>
        <li>India income tax and GST: February to March, after the Union Budget</li>
        <li>US tax limits: every November</li>
        <li>UK tax bands and National Insurance: March to April</li>
        <li>Canada and Australia: before each new tax year</li>
        <li>Pure maths tools: no rates, so no update needed</li>
      </ul>
      <p>When a number changes, we update the tool, re-run every test and change the &ldquo;last updated&rdquo; date.</p>

      <h2>Our results are estimates</h2>
      <p>
        Calculators simplify real life. Your own situation may include rules, deductions or fees that a general tool
        can&apos;t know about. Use our results as a starting point, and check important decisions with a qualified
        professional. Read our full <Link href="/disclaimer">disclaimer</Link>.
      </p>
      <p>
        Found an error? Please <Link href="/contact">tell us</Link>. We fix confirmed mistakes quickly.
      </p>
    </StaticPage>
  );
}
