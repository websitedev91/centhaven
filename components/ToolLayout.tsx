import type { ReactNode } from 'react';
import { Breadcrumbs } from './Breadcrumbs';
import { ToolActions } from './ToolActions';
import { ResultActionsProvider } from './ResultActions';
import { AffiliateSlot } from './AffiliateSlot';
import { FaqList } from './FaqList';
import { RelatedTools } from './RelatedTools';
import { ToolRail } from './ToolRail';
import { DOCUMENT_SOURCES_NOTE, Sources } from './Sources';
import { AuthorBox } from './AuthorBox';
import { Disclaimer } from './Disclaimer';
import { JsonLd } from './JsonLd';
import { breadcrumbJsonLd, faqJsonLd, webApplicationJsonLd, type Crumb } from '@/lib/seo';
import { toolPath } from '@/lib/registry';
import type { RegistryRow } from '@/lib/tool-types';

/**
 * Every tool page, same order (PRD §6 / CLAUDE.md):
 * Breadcrumbs → H1 + subtitle → calculator (result, then share/print/embed right under it, then
 * chart and compare, all inside it) → affiliate → content → FAQ → related → sources →
 * how it is checked → disclaimer. Share/print/embed moved under the result on 2026-11-20.
 */
export function ToolLayout(props: {
  tool: RegistryRow;
  categoryName: string;
  calculator: ReactNode;
  content: ReactNode;
  related: readonly RegistryRow[];
  /** H2s of content.mdx for the "On this page" rail (lib/headings.ts). */
  contentSections?: { id: string; text: string }[];
}) {
  const { tool, categoryName, calculator, content, related, contentSections = [] } = props;
  const sections = [
    ...contentSections,
    ...(tool.meta.faq.length > 0 ? [{ id: 'faq', text: 'Frequently asked questions' }] : []),
    { id: 'sources', text: 'Sources' },
  ];
  const path = toolPath(tool);
  const crumbs: Crumb[] = [
    { name: 'Home', path: '/' },
    { name: categoryName, path: `/${tool.category}` },
    { name: tool.title, path },
  ];

  return (
    <article className="wrap pb-24 pt-6 lg:pb-section">
      <JsonLd
        data={webApplicationJsonLd({
          name: tool.title,
          description: tool.meta.description,
          path,
          dateModified: tool.lastUpdated,
        })}
      />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      {tool.meta.faq.length > 0 ? <JsonLd data={faqJsonLd(tool.meta.faq)} /> : null}

      <Breadcrumbs crumbs={crumbs} />
      <header className="mt-6">
        <h1 className="type-h1 measure">{tool.title}</h1>
        <p className="mt-3 measure text-[19px] leading-[30px] text-ink-muted">{tool.meta.subtitle}</p>
      </header>

      <div className="mt-8 flex flex-col gap-6">
        <ResultActionsProvider actions={tool.meta.document ? null : <ToolActions toolSlug={tool.slug} title={tool.title} />}>
          {calculator}
        </ResultActionsProvider>
        <AffiliateSlot affiliateId={tool.meta.affiliateId} toolSlug={tool.slug} />
      </div>

      {/* Content column (68ch) + right rail on desktop (DESIGN.md §9). */}
      <div className="mt-section lg:grid lg:grid-cols-12 lg:gap-8">
        <div className="flex min-w-0 flex-col gap-section lg:col-span-8">
          <div className="prose-ch">{content}</div>
          <FaqList faqs={tool.meta.faq} />
          <div className="lg:hidden">
            <RelatedTools tools={related} />
          </div>
          <Sources note={tool.meta.document ? DOCUMENT_SOURCES_NOTE : undefined} />
          <div className="flex flex-col gap-4">
            <AuthorBox path={path} />
            <Disclaimer />
          </div>
        </div>
        <div className="hidden lg:col-span-3 lg:col-start-10 lg:block">
          <ToolRail sections={sections} related={related} />
        </div>
      </div>
    </article>
  );
}
