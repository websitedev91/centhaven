import { describe, expect, it } from 'vitest';
import { absoluteUrl, breadcrumbJsonLd, faqJsonLd, jsonLdString, toolTitle, webApplicationJsonLd, wordCount } from './seo';

describe('seo helpers', () => {
  it('builds titles in the house format', () => {
    expect(toolTitle('Freelance Hourly Rate Calculator')).toBe('Freelance Hourly Rate – Free Calculator | CentHaven');
  });

  it('builds absolute urls', () => {
    expect(absoluteUrl('/')).toBe('https://centhaven.com');
    expect(absoluteUrl('/freelance/hourly-rate-calculator')).toBe('https://centhaven.com/freelance/hourly-rate-calculator');
  });

  it('builds WebApplication JSON-LD with a free offer', () => {
    const ld = webApplicationJsonLd({ name: 'X', description: 'Y', path: '/a', dateModified: '2026-11-14' });
    expect(ld['@type']).toBe('WebApplication');
    expect(ld.applicationCategory).toBe('FinanceApplication');
    expect(ld.offers.price).toBe('0');
  });

  it('builds BreadcrumbList and FAQPage JSON-LD', () => {
    const bc = breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Freelance', path: '/freelance' },
    ]);
    expect(bc.itemListElement[1]).toMatchObject({ position: 2, item: 'https://centhaven.com/freelance' });
    const faq = faqJsonLd([{ q: 'Q?', a: 'A.' }]);
    expect(faq.mainEntity[0]?.acceptedAnswer.text).toBe('A.');
  });

  it('escapes < in JSON-LD output', () => {
    expect(jsonLdString({ a: '</script>' })).not.toContain('</script>');
  });

  it('counts words', () => {
    expect(wordCount('  one two\nthree ')).toBe(3);
  });
});
