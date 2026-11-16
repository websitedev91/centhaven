import { ShareButton } from './ShareButton';
import { PrintButton } from './PrintButton';
import { EmbedCodeBox } from './EmbedCodeBox';

/** Actions row: Copy share link · Print or save as PDF · Show embed code (PRD §6.7). */
export function ToolActions({ toolSlug, title }: { toolSlug: string; title: string }) {
  return (
    <div className="no-print flex flex-wrap gap-3" role="group" aria-label="Share, print or embed">
      <ShareButton toolSlug={toolSlug} title={title} />
      <PrintButton toolSlug={toolSlug} />
      <EmbedCodeBox toolSlug={toolSlug} title={title} />
    </div>
  );
}
