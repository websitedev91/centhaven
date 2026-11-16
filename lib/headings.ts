/**
 * H2 anchors for long-form content. The same slugify runs in mdx-components (to set each h2's id)
 * and here (to list the H2s for the "On this page" rail), so links and ids always match.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Plain text of an MDX/markdown heading line: drops emphasis, code and JSX tags. */
export function headingText(markdown: string): string {
  return markdown
    .replace(/<[^>]+>/g, '')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** The "## " headings of an MDX file, outside code blocks. */
export function mdxH2s(mdx: string): { id: string; text: string }[] {
  const body = mdx.replace(/\r\n/g, '\n').replace(/```[\s\S]*?```/g, '');
  return [...body.matchAll(/^## (.+)$/gm)].map((m) => {
    const text = headingText(m[1]!);
    return { id: slugify(text), text };
  });
}
