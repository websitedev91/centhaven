import type { MDXComponents } from 'mdx/types';
import { Children, isValidElement, type ReactNode } from 'react';
import { ToolLink } from '@/components/ToolLink';
import { slugify } from '@/lib/headings';

function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return Children.toArray(node).map(textOf).join('');
}

/**
 * Components available in every content.mdx without an import.
 * H2s get an id (same slug as lib/headings.ts) so the "On this page" rail can link to them.
 */
const components: MDXComponents = {
  ToolLink,
  h2: ({ children }) => (
    <h2 id={slugify(textOf(children))} className="scroll-mt-24">
      {children}
    </h2>
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
