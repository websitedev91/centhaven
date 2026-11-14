import Link from 'next/link';
import { StaticPage, staticPageMetadata } from '@/components/StaticPage';
import { site } from '@/config/site';

export const metadata = staticPageMetadata(
  '/affiliate-disclosure',
  'How CentHaven uses affiliate links, how we choose partners, and why partner offers never change the results our free calculators show you.',
);

export default function AffiliateDisclosurePage() {
  return (
    <StaticPage href="/affiliate-disclosure" intro={site.affiliateDisclosure}>
      <h2>How we make money</h2>
      <p>
        {site.name} is free to use. To keep it free, some pages may show one partner offer next to a calculator result,
        for example an invoicing app next to a freelance rate calculator. If you click a partner link and sign up or
        buy, we may earn a commission. It costs you nothing extra.
      </p>

      <h2>Our results never change</h2>
      <p>
        Partner offers never affect how our calculators work or what they show. Every formula is the same whether a
        partner offer appears or not. Partners don&apos;t pay to change our content, our results or our rankings.
      </p>

      <h2>How we choose partners</h2>
      <p>
        We only show an offer when it relates to the tool you are using and could genuinely help. We show at most one
        offer per tool. Before we show any partner, the partner must approve us into their programme.
      </p>

      <h2>How to spot a partner link</h2>
      <p>
        Partner offers appear in a box marked &ldquo;Partner&rdquo;, with this disclosure underneath. Partner links open
        in a new tab and are marked as sponsored for search engines.
      </p>

      <h2>Current partners</h2>
      <p>We don&apos;t have any active partner offers yet. We will update this page when that changes.</p>

      <p>
        Questions? <Link href="/contact">Contact us</Link>.
      </p>
    </StaticPage>
  );
}
