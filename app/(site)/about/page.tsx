import Link from 'next/link';
import { StaticPage, staticPageMetadata } from '@/components/StaticPage';
import { site } from '@/config/site';

export const metadata = staticPageMetadata(
  '/about',
  'CentHaven builds free, sourced money and work calculators for freelancers and remote workers worldwide. Learn who builds them and why.',
);

export default function AboutPage() {
  return (
    <StaticPage href="/about" title="About CentHaven" intro={site.tagline}>
      <h2>What CentHaven is</h2>
      <p>
        CentHaven is a free website of money and work calculators. We started with tools for freelancers and remote
        workers in the US, UK, Canada, Australia and India, and we are adding tools for payment fees, personal finance and
        small business.
      </p>
      <p>
        Every tool on the site has one job: to help you earn, save, spend or manage money a little better. If a tool
        doesn&apos;t do that, it doesn&apos;t belong here.
      </p>

      <h2>Why we built it</h2>
      <p>
        Money questions often need a quick, honest number: how much to charge per hour, what a payment platform really
        takes, or how much a loan will cost. Many calculators online are slow, out of date or hide their maths.
      </p>
      <p>We wanted something different:</p>
      <ul>
        <li>
          <strong>Free and fast.</strong> No sign-up, no paywall. Results update as you type.
        </li>
        <li>
          <strong>Clear maths.</strong> Every tool explains its formula in plain English, with worked examples.
        </li>
        <li>
          <strong>Sourced numbers.</strong> Fee calculators use each company&apos;s official fee page, and we show you
          where each fee comes from and when we last checked it.
        </li>
        <li>
          <strong>Useful extras.</strong> Compare scenarios, share a link to your result, print it or embed the tool on
          your own site.
        </li>
      </ul>

      <h2>Who builds it</h2>
      <p>
        <strong>{site.byline}.</strong> CentHaven is an independent project. Each calculator is tested against worked
        examples before it goes live.
      </p>
      <p>
        We don&apos;t build tools that depend on tax rules, government limits or legal thresholds. Our calculators do
        clear maths on the numbers you enter, and fee calculators use each company&apos;s official fee page.
      </p>

      <h2>How we stay accurate</h2>
      <p>
        Read our <Link href="/methodology">methodology</Link> to see how we build, test and update every calculator.
        Spotted a mistake or want a new tool? Email{' '}
        <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a> or use our <Link href="/contact">contact page</Link>.
      </p>
      <p>{site.disclaimer}</p>
    </StaticPage>
  );
}
