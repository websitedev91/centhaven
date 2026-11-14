import Link from 'next/link';
import { StaticPage, staticPageMetadata } from '@/components/StaticPage';
import { site } from '@/config/site';

export const metadata = staticPageMetadata(
  '/disclaimer',
  'CentHaven calculators give estimates only. They are not financial, tax or legal advice. Read how to use our results and when to ask a professional.',
);

// Draft — have this reviewed before launch.
export default function DisclaimerPage() {
  return (
    <StaticPage href="/disclaimer" intro={site.disclaimer}>
      <h2>Estimates only</h2>
      <p>
        The calculators and articles on {site.name} are for general information and education. Their results are
        estimates based on the numbers you enter and on general rules. They may not reflect your personal situation.
      </p>

      <h2>Not professional advice</h2>
      <p>
        Nothing on this website is financial, investment, tax, accounting or legal advice. We are not acting as your
        adviser. Before you make a financial decision, check with a qualified professional who knows your situation.
      </p>

      <h2>Accuracy</h2>
      <p>
        We work hard to keep our tools accurate. We take rates from official sources and test every formula (see our{' '}
        <Link href="/methodology">methodology</Link>). But fees, tax rules and limits change, sometimes without notice,
        and mistakes can happen. We make no promise that any result is complete, correct or up to date.
      </p>

      <h2>Your responsibility</h2>
      <p>
        You are responsible for how you use our results. To the fullest extent allowed by law, {site.name} is not liable
        for any loss or damage that comes from relying on information or results from this website.
      </p>

      <h2>Third-party links</h2>
      <p>
        Some pages link to other websites, including partner offers (see our{' '}
        <Link href="/affiliate-disclosure">affiliate disclosure</Link>). We don&apos;t control those websites and
        aren&apos;t responsible for their content, products or services.
      </p>

      <h2>Questions</h2>
      <p>
        If you think something on the site is wrong, please <Link href="/contact">contact us</Link>.
      </p>
    </StaticPage>
  );
}
