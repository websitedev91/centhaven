import type { ReactNode } from 'react';
import { Breadcrumbs } from './Breadcrumbs';
import { ToolActions } from './ToolActions';
import { AffiliateSlot } from './AffiliateSlot';
import { FaqList } from './FaqList';
import { RelatedTools } from './RelatedTools';
import { ToolRail } from './ToolRail';
import { Sources } from './Sources';
import { AuthorBox } from './AuthorBox';
import { Disclaimer } from './Disclaimer';
import { JsonLd } from './JsonLd';
import { breadcrumbJsonLd, faqJsonLd, webApplicationJsonLd, type Crumb } from '@/lib/seo';
import { toolPath } from '@/lib/registry';
import type { RegistryRow } from '@/lib/tool-types';
import type { SourceLink } from '@/lib/rates';

/**
 * Every tool page, same order (PRD §6 / CLAUDE.md):
 * Breadcrumbs → H1 + subtitle → calculator (result, chart, compare live inside it) →
 * share/print/embed → affiliate → content → FAQ → related → sources → how it is checked → disclaimer.
 */
export function ToolLayout(props: {
  tool: RegistryRow;
  categoryName: string;
  calculator: ReactNode;
  content: ReactNode;
  related: readonly RegistryRow[];
  sources: readonly SourceLink[];
  /** H2s of content.mdx for the "On this page" rail (lib/headings.ts). */
  contentSections?: { id: string; text: string }[];
}) {
  const { tool, categoryName, calculator, content, related, sources, contentSections = [] } = props;
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
        {calculator}
        {tool.meta.document ? null : <ToolActions toolSlug={tool.slug} title={tool.title} />}
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
          <Sources sources={sources} />
          <div className="flex flex-col gap-4">
            <AuthorBox reviewedBy={tool.reviewedBy} />
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
