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
  // Inlined on server and client. '1' only via `npm run build:preview` (never deployable).
  env: { PREVIEW_DRAFTS: process.env.PREVIEW_DRAFTS === '1' ? '1' : '' },
  // Hostinger's build server (same fix as tools.sanishtech.com):
  experimental: {
    // Run the MDX / PostCSS loaders in worker threads, not a child-process pool: the hosting build
    // environment kills those child processes before they connect ("exits with status 0").
    turbopackPluginRuntimeStrategy: 'workerThreads',
    // It reports ~63 CPUs but caps processes/threads per account, so Next's default (one build
    // worker per CPU) can fail to spawn workers. Two is plenty for this site. Override with BUILD_CPUS.
    cpus: Number(process.env.BUILD_CPUS) || 2,
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
