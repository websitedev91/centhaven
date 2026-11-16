import type { ReactNode } from 'react';
import { Breadcrumbs } from './Breadcrumbs';
import { ToolActions } from './ToolActions';
import { AffiliateSlot } from './AffiliateSlot';
import { FaqList } from './FaqList';
import { RelatedTools } from './RelatedTools';
import { Sources } from './Sources';
import { AuthorBox } from './AuthorBox';
import { LastUpdated } from './LastUpdated';
import { Disclaimer } from './Disclaimer';
import { JsonLd } from './JsonLd';
import { breadcrumbJsonLd, faqJsonLd, webApplicationJsonLd, type Crumb } from '@/lib/seo';
import { toolPath } from '@/lib/registry';
import type { RegistryRow } from '@/lib/tool-types';
import type { SourceLink } from '@/lib/rates';

/**
 * Every tool page, same order (PRD §6 / CLAUDE.md):
 * Breadcrumbs → H1 + subtitle → calculator (result, chart, compare live inside it) →
 * share/print/embed → affiliate → content → FAQ → related → sources → author → last updated → disclaimer.
 */
export function ToolLayout(props: {
  tool: RegistryRow;
  categoryName: string;
  calculator: ReactNode;
  content: ReactNode;
  related: readonly RegistryRow[];
  sources: readonly SourceLink[];
}) {
  const { tool, categoryName, calculator, content, related, sources } = props;
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
        <ToolActions toolSlug={tool.slug} title={tool.title} />
        <AffiliateSlot affiliateId={tool.meta.affiliateId} toolSlug={tool.slug} />
      </div>

      <div className="mt-section flex flex-col gap-section">
        <div className="prose-ch">{content}</div>
        <FaqList faqs={tool.meta.faq} />
        <RelatedTools tools={related} />
        <Sources sources={sources} />
        <div className="flex flex-col gap-4">
          <AuthorBox reviewedBy={tool.reviewedBy} />
          <LastUpdated date={tool.lastUpdated} />
          <Disclaimer />
        </div>
      </div>
    </article>
  );
}
