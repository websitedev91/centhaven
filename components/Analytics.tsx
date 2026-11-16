import Script from 'next/script';
import { site } from '@/config/site';

/**
 * Google Tag Manager (container set in config/site.ts). GA4 and any other tags are configured
 * inside the container. Loaded after the page is interactive so it doesn't block the calculator.
 *
 * Same as the snippet from Puru (dataLayer + gtag + gtm.js), plus the standard `gtm.start` push,
 * which GTM needs to fire its "All Pages" / page-view triggers.
 */
export function Analytics() {
  const id = site.gtmId;
  if (!/^GTM-[A-Z0-9]+$/.test(id)) return null;
  return (
    <>
      <Script id="gtm-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});`}
      </Script>
      <Script src={`https://www.googletagmanager.com/gtm.js?id=${id}`} strategy="afterInteractive" />
    </>
  );
}
