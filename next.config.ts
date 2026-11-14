import type { NextConfig } from 'next';
import createMDX from '@next/mdx';
import { validateAllRates } from './lib/rates-fs';

// PRD §7: the build fails if any /rates file is invalid or missing from sources.md.
validateAllRates();

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: false,
  images: { unoptimized: true },
  // '.dev.tsx' pages (e.g. /dev/tools) exist only in next dev, never in the production export.
  pageExtensions: isDev ? ['dev.tsx', 'ts', 'tsx', 'md', 'mdx'] : ['ts', 'tsx', 'md', 'mdx'],
  reactStrictMode: true,
  poweredByHeader: false,
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
