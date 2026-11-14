import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ToolLayout } from '@/components/ToolLayout';
import { getCategory } from '@/config/site';
import { getLiveTool, liveRelated, liveTools, toolPath } from '@/lib/registry';
import { getSourceLinks } from '@/lib/rates';
import { buildMetadata } from '@/lib/seo';
import { PLACEHOLDER, withPlaceholder } from '@/lib/static-params';
import { toolModules } from '@/lib/tool-modules';

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
  const modules = tool ? toolModules[tool.slug] : undefined;
  if (!tool || !category || !modules) return undefined;
  return { tool, category, modules };
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const r = resolve(await params);
  if (!r) return { title: 'Not found', robots: { index: false } };
  return buildMetadata({ title: r.tool.meta.seoTitle, description: r.tool.meta.description, path: toolPath(r.tool) });
}

export default async function ToolPage({ params }: { params: Promise<Params> }) {
  const r = resolve(await params);
  if (!r) notFound();
  const { tool, category, modules } = r;
  const { Calculator, Content } = modules;
  return (
    <ToolLayout
      tool={tool}
      categoryName={category.name}
      calculator={<Calculator />}
      content={<Content />}
      related={liveRelated(tool)}
      sources={getSourceLinks(tool.meta.rates)}
    />
  );
}
