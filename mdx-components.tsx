import type { MDXComponents } from 'mdx/types';
import { ToolLink } from '@/components/ToolLink';

/** Components available in every content.mdx without an import. */
const components: MDXComponents = { ToolLink };

export function useMDXComponents(): MDXComponents {
  return components;
}
