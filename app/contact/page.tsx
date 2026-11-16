import { StaticPage, staticPageMetadata } from '@/components/StaticPage';
import { ContactForm } from '@/components/ContactForm';
import { site } from '@/config/site';

export const metadata = staticPageMetadata(
  '/contact',
  'Contact CentHaven: report a mistake, suggest a new money calculator, ask about embedding our tools or partnerships. Email info@centhaven.com.',
);

export default function ContactPage() {
  return (
    <StaticPage
      href="/contact"
      title="Contact us"
      intro="Found a mistake, want a new calculator or have a partnership idea? We'd love to hear from you."
    >
      <p>
        Email us at <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>, or use the form below. We usually
        reply within a few working days.
      </p>
      <div className="mt-6">
        <ContactForm email={site.contactEmail} />
      </div>
      <p className="mt-6 text-sm text-ink-muted">
        We can&apos;t give personal financial, tax or legal advice. For that, please speak to a qualified professional.
      </p>
    </StaticPage>
  );
}
