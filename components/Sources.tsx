/** Sources text for the quote and invoice generators (Puru, 2026-11-18). */
export const DOCUMENT_SOURCES_NOTE = "This tool only uses what you type. It doesn't use any external rates or fees.";

export const PURE_MATHS_NOTE =
  'This calculator uses only the numbers you enter. It does not rely on any external fees, tax rates or limits.';

/**
 * The "Sources" section of a tool page. Every tool is pure maths (scope rule, Puru 2026-11-18):
 * every number comes from the user, so this states that and shows no dates or links.
 */
export function Sources({ note = PURE_MATHS_NOTE }: { note?: string }) {
  return (
    <section id="sources" aria-labelledby="sources-heading" className="scroll-mt-24">
      <h2 id="sources-heading" className="type-h2">
        Sources
      </h2>
      <p className="mt-4 measure text-ink-muted">{note}</p>
    </section>
  );
}
