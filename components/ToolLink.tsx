import Link from 'next/link';
import type { ReactNode } from 'react';
import { getLiveToolBySlug, toolPath } from '@/lib/registry';

/**
 * Link to another tool from content.mdx. Renders a link only when that tool is live
 * (CLAUDE.md: links to live tools only); otherwise the text stays plain, so content can
 * name related tools before they launch.
 */
export function ToolLink({ slug, children }: { slug: string; children: ReactNode }) {
  const tool = getLiveToolBySlug(slug);
  return tool ? <Link href={toolPath(tool)}>{children}</Link> : <>{children}</>;
}
