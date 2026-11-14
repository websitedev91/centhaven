import type { NextConfig } from 'next';
import createMDX from '@next/mdx';
import { validateAllRates } from './lib/rates-fs';

// PRD §7: the build fails if any /rates file is invalid or missing from sources.md.
validateAllRates();

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: false,
  images: { unoptimized: true },
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  reactStrictMode: true,
  poweredByHeader: false,
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
