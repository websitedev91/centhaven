import { ShareButton } from './ShareButton';
import { PrintButton } from './PrintButton';
import { EmbedCodeBox } from './EmbedCodeBox';

/**
 * Copy share link · Print or save as PDF · Show embed code (PRD §6.7), shown directly under the
 * result (CalculatorGrid, via ResultActions). Share is the main action, full width; print and
 * embed sit side by side below it and wrap on narrow screens. The embed code box opens under them.
 */
export function ToolActions({ toolSlug, title }: { toolSlug: string; title: string }) {
  return (
    <div className="no-print flex flex-col gap-2" role="group" aria-label="Share, print or embed">
      <ShareButton toolSlug={toolSlug} title={title} />
      <div className="flex flex-wrap gap-2">
        <PrintButton toolSlug={toolSlug} />
        <EmbedCodeBox toolSlug={toolSlug} title={title} />
      </div>
    </div>
  );
}
