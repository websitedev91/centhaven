/**
 * Static export (`output: 'export'`) refuses a dynamic route whose generateStaticParams
 * returns an empty array. When nothing is live we emit ONE placeholder param; the page
 * calls notFound() for it, and scripts/postbuild.mjs deletes the placeholder output.
 * The placeholder is never linked and never appears in the sitemap.
 */
export const PLACEHOLDER = '__none__';

export function withPlaceholder<T extends Record<string, string>>(params: T[], placeholder: T): T[] {
  return params.length > 0 ? params : [placeholder];
}
