import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EmbedProvider } from '@/components/EmbedMode';
import { ToolCalculator } from '@/components/ToolCalculator';
import { site } from '@/config/site';
import { getLiveToolBySlug, liveTools, toolPath } from '@/lib/registry';
import { absoluteUrl } from '@/lib/seo';
import { PLACEHOLDER, withPlaceholder } from '@/lib/static-params';

export const dynamicParams = false;

type Params = { slug: string };

/** One embed per live tool (the embed code points here: components/EmbedCodeBox.tsx). */
export function generateStaticParams(): Params[] {
  return withPlaceholder(
    liveTools().map((t) => ({ slug: t.slug })),
    { slug: PLACEHOLDER },
  );
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const tool = getLiveToolBySlug((await params).slug);
  if (!tool) return { title: 'Not found', robots: { index: false } };
  return {
    title: `${tool.meta.h1} | ${site.name}`,
    description: tool.meta.description,
    // Embeds are never indexed; the tool page is the canonical version.
    robots: { index: false, follow: true },
    alternates: { canonical: absoluteUrl(toolPath(tool)) },
  };
}

/**
 * /embed/[slug] (DESIGN.md §9): the calculator and its result only, on a white surface, with a
 * small "Powered by CentHaven" link. No header or footer (this route group has no site chrome).
 */
export default async function EmbedPage({ params }: { params: Promise<Params> }) {
  const tool = getLiveToolBySlug((await params).slug);
  if (!tool) notFound();
  return (
    <div className="min-h-screen bg-surface px-3 py-4 sm:px-4">
      <EmbedProvider>
        <ToolCalculator slug={tool.slug} />
      </EmbedProvider>
      <p className="type-small mt-4 text-right text-ink-muted">
        <a href={absoluteUrl(toolPath(tool))} target="_blank" rel="noopener" className="text-ink-muted hover:text-haven">
          Powered by {site.name}
        </a>
      </p>
    </div>
  );
}
