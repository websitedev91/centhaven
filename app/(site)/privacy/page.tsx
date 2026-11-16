import Link from 'next/link';
import { StaticPage, staticPageMetadata } from '@/components/StaticPage';
import { site } from '@/config/site';

export const metadata = staticPageMetadata(
  '/privacy',
  'CentHaven privacy policy: no accounts, no stored personal data. Your calculator inputs stay in your browser. How we use Google Analytics and cookies.',
);

// DRAFT — not legal advice. Have it reviewed before launch (GDPR/UK GDPR, CCPA, India DPDP Act).
export default function PrivacyPage() {
  return (
    <StaticPage
      href="/privacy"
      title="Privacy policy"
      intro="Short version: we don't ask for your name, we have no accounts and we don't store the numbers you type."
    >
      <h2>Your calculator inputs</h2>
      <p>
        Our calculators run entirely in your browser. The numbers you enter are not sent to us or stored on our servers.
        When you use &ldquo;Copy share link&rdquo;, your inputs are saved in the page address (URL), so anyone you send the
        link to can see them. Only share links you are happy for others to see.
      </p>

      <h2>No accounts</h2>
      <p>
        You don&apos;t need an account to use {site.name}. We don&apos;t collect names, addresses, payment details or
        other personal data through the site.
      </p>

      <h2>Analytics</h2>
      <p>
        We use Google Analytics 4, loaded through Google Tag Manager, to understand how people use the site, for example which tools are popular and
        whether a page loads well. Google Analytics uses cookies and collects information such as pages visited,
        approximate location (country or city), device and browser type, and how you arrived at the site. We use this
        information only in summary form. We don&apos;t use it to identify you.
      </p>
      <p>
        You can block analytics cookies in your browser settings, or use Google&apos;s{' '}
        <a href="https://tools.google.com/dlpage/gaoptout" rel="noopener" target="_blank">
          opt-out browser add-on
        </a>
        . Read how Google uses data on{' '}
        <a href="https://policies.google.com/technologies/partner-sites" rel="noopener" target="_blank">
          Google&apos;s website
        </a>
        .
      </p>

      <h2>Contacting us</h2>
      <p>
        The enquiry form on our <Link href="/contact">contact page</Link> opens your own email app. The website does not
        store what you write. If you send us an email, we receive your email address and message and use them only to
        reply to you. We don&apos;t add you to any mailing list.
      </p>

      <h2>Hosting</h2>
      <p>
        Our hosting provider may keep standard server logs, such as IP addresses and the pages requested, for security
        and to keep the site running. These logs are kept for a limited time.
      </p>

      <h2>Partner links</h2>
      <p>
        If you click a partner link, the partner&apos;s website may use its own cookies to record that you came from us.
        Their privacy policy applies on their website. See our <Link href="/affiliate-disclosure">affiliate disclosure</Link>.
      </p>

      <h2>Embedded calculators</h2>
      <p>
        Other websites can embed our calculators. When you use an embedded calculator, the same rules on this page
        apply to it.
      </p>

      <h2>Children</h2>
      <p>The site is not aimed at children under 13, and we don&apos;t knowingly collect their data.</p>

      <h2>Your rights</h2>
      <p>
        Depending on where you live, you may have the right to ask what data we hold about you, or to ask us to delete
        it. Because we hold very little, most requests will be about emails you sent us. Write to{' '}
        <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.
      </p>

      <h2>Changes</h2>
      <p>If we change this policy, we will update this page and the date below.</p>
    </StaticPage>
  );
}
