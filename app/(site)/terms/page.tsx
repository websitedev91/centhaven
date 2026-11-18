import Link from 'next/link';
import { StaticPage, staticPageMetadata } from '@/components/StaticPage';
import { site } from '@/config/site';

export const metadata = staticPageMetadata(
  '/terms',
  'Terms of use for CentHaven: free calculators for personal and business use, estimates only, embedding rules, and the limits of our responsibility.',
);

// DRAFT — not legal advice. Have it reviewed before launch (add business name / governing law if needed).
export default function TermsPage() {
  return (
    <StaticPage href="/terms" title="Terms of use" intro={`By using ${site.name}, you agree to these terms.`}>
      <h2>Using the site</h2>
      <p>
        {site.name} is free for personal and business use. You may use our calculators as often as you like, save or
        print your results, and share links to them.
      </p>
      <p>Please don&apos;t:</p>
      <ul>
        <li>copy our content or tools to republish them as your own</li>
        <li>overload the site with automated requests or scraping</li>
        <li>try to break or interfere with the site or its security</li>
        <li>use the site for anything unlawful</li>
      </ul>

      <h2>Embedding our calculators</h2>
      <p>
        You may embed our calculators on your website with the &ldquo;Show embed code&rdquo; button, free of charge. Please
        keep the &ldquo;Powered by {site.name}&rdquo; link visible, and don&apos;t change the calculator or suggest that we
        endorse your site. We may stop an embed from working at any time.
      </p>

      <h2>Estimates, not advice</h2>
      <p>
        Our results are estimates and are not financial, tax or legal advice. Please read our{' '}
        <Link href="/disclaimer">disclaimer</Link>, which forms part of these terms.
      </p>

      <h2>No guarantee</h2>
      <p>
        We provide the site &ldquo;as is&rdquo;. We work to keep it accurate and available, but we can&apos;t promise it
        will always be error-free, up to date or online. We may change or remove any tool at any time.
      </p>

      <h2>Limit of responsibility</h2>
      <p>
        To the fullest extent allowed by law, {site.name} is not liable for any loss or damage that comes from using the
        site or relying on its results. Nothing in these terms limits any rights you have that cannot be limited by law.
      </p>

      <h2>Content ownership</h2>
      <p>
        The text, design, code and tools on {site.name} belong to us unless we say otherwise. You may quote short
        passages with a link back to the page.
      </p>

      <h2>Other websites</h2>
      <p>
        We link to other websites, including partners. We aren&apos;t responsible for their content.
        See our <Link href="/affiliate-disclosure">affiliate disclosure</Link> and{' '}
        <Link href="/privacy">privacy policy</Link>.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms. The date below shows when they last changed. If you keep using the site after a
        change, you accept the new terms.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms? Write to <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.
      </p>
    </StaticPage>
  );
}
