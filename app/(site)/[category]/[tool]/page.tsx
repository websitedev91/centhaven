import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ToolLayout } from '@/components/ToolLayout';
import { getCategory } from '@/config/site';
import { getLiveTool, liveRelated, liveTools, toolPath } from '@/lib/registry';
import { buildMetadata } from '@/lib/seo';
import { ogToolPath } from '@/lib/og-paths';
import { PLACEHOLDER, withPlaceholder } from '@/lib/static-params';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { mdxH2s } from '@/lib/headings';
import { toolContent } from '@/lib/tool-modules';
import { ToolCalculator } from '@/components/ToolCalculator';

export const dynamicParams = false;

type Params = { category: string; tool: string };

export function generateStaticParams(): Params[] {
  return withPlaceholder(
    liveTools().map((t) => ({ category: t.category, tool: t.slug })),
    { category: PLACEHOLDER, tool: PLACEHOLDER },
  );
}

function resolve(params: Params) {
  const tool = getLiveTool(params.category, params.tool);
  const category = getCategory(params.category);
  const Content = tool ? toolContent[tool.slug] : undefined;
  if (!tool || !category || !Content) return undefined;
  return { tool, category, Content };
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const r = resolve(await params);
  if (!r) return { title: 'Not found', robots: { index: false } };
  return buildMetadata({ title: r.tool.meta.title, description: r.tool.meta.description, path: toolPath(r.tool), ogImage: ogToolPath(r.tool.slug) });
}

export default async function ToolPage({ params }: { params: Promise<Params> }) {
  const r = resolve(await params);
  if (!r) notFound();
  const { tool, category, Content } = r;
  return (
    <ToolLayout
      tool={tool}
      categoryName={category.name}
      calculator={<ToolCalculator slug={tool.slug} />}
      content={<Content />}
      related={liveRelated(tool)}
      contentSections={mdxH2s(readFileSync(join(process.cwd(), 'tools', tool.slug, 'content.mdx'), 'utf8'))}
    />
  );
}
