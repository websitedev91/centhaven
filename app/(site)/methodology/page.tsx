import Link from 'next/link';
import { StaticPage, staticPageMetadata } from '@/components/StaticPage';
import { site } from '@/config/site';

export const metadata = staticPageMetadata(
  '/methodology',
  'How CentHaven builds and checks its calculators: clear maths on the numbers you enter, tested formulas, worked examples and checks before anything goes live.',
);

export default function MethodologyPage() {
  return (
    <StaticPage
      href="/methodology"
      title="How we build our calculators"
      intro="Money tools must be right. Here is how we build, test and update every calculator on CentHaven."
    >
      <p className="font-[550] text-ink">{site.byline}.</p>

      <h2>1. Your numbers, clear maths</h2>
      <p>
        Our tools don&apos;t use tax rates, company fees or legal limits. Every result is calculated from the numbers you enter, and each page shows the formula and worked examples.
      </p>

      <h2>2. Tested formulas</h2>
      <p>
        Every formula is written once, kept separate from the page design, and tested automatically. Before a tool goes
        live, it must match at least three worked examples, each checked by a careful manual calculation.
      </p>
      <p>
        We round money only when we show it to you, so small rounding errors don&apos;t add up inside the maths. Quotes
        and invoices are the one exception: each line is rounded to the cent, so the document adds up exactly.
      </p>

      <h2>3. What we don&apos;t build</h2>
      <p>
        We don&apos;t build tools that depend on tax rules, government limits, company fees or legal thresholds. If a tool
        would need a number that only a company or a government can set, we don&apos;t build it.
      </p>

      <h2>4. Quality checks before publishing</h2>
      <p>Before a tool goes live, it must pass all of these checks:</p>
      <ul>
        <li>Works well on phones and desktops</li>
        <li>Every result comes from the numbers you enter, with no outside rates</li>
        <li>All test cases pass</li>
        <li>Clear explanation, formula, worked examples and FAQ</li>
        <li>Fast to load and accessible to keyboard and screen-reader users</li>
        <li>A clear disclaimer</li>
      </ul>

      <h2>5. Keeping tools correct</h2>
      <p>
        Because every result comes from the numbers you enter, our tools don&apos;t go out of date when a company or a
        government changes its rates. We still review our tools, and when we fix a mistake we re-run every test before
        publishing the update.
      </p>

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
