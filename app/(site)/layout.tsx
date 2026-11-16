import type { ReactNode } from 'react';
import { SiteChrome } from '@/components/SiteChrome';

/** Every normal page: skip link, header, main and footer. Embeds (app/(embed)) have none. */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
