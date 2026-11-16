# SEO.md — On-page SEO rules for every CentHaven page

Read this with `docs/seo/keyword-map.md` before writing or editing **any** title, meta description, H1 or page content.
These rules apply to tools, category hubs, the homepage and static pages.

---

## 1. Where keywords live (single source of truth)

1. **`docs/seo/keyword-map.md`** is the master list: URL, primary keyword, secondary keywords, title, meta description, H1, FAQ questions and internal links for every page.
2. Each tool's **`tools/<slug>/meta.ts`** must copy these fields exactly:
   ```ts
   export const meta = {
     slug, category,
     primaryKeyword: 'freelance hourly rate calculator',
     secondaryKeywords: ['freelance rate calculator', '...'],
     title: '...',            // ≤ 60 chars
     description: '...',      // 140–160 chars
     h1: '...',
     faq: [...],              // questions from the keyword map (answers in content.mdx)
     relatedTools: [...],     // slugs from the keyword map
   };
   ```
3. **To change keywords:** edit `keyword-map.md` first, then `meta.ts` and `content.mdx`. Never change one without the other.
4. A test (`seo.test.ts`) checks that every live tool's `meta.ts` matches the keyword map (title, description, H1, primary keyword) and that no two pages share a primary keyword.

---

## 2. Keyword placement checklist (every tool page)

| Place | Rule |
|---|---|
| URL | `/{category}/{slug}`, short, contains the primary keyword's core words |
| `<title>` | Starts with the primary keyword (or its closest natural form), ≤ 60 chars |
| Meta description | 140–160 chars, contains the primary keyword once, says what the user gets |
| H1 | One H1, natural form of the primary keyword |
| First 100 words | Primary keyword once, naturally |
| H2s | At least 2 H2s contain a secondary keyword or a close variant |
| FAQ | Questions from the keyword map (People-Also-Ask style), answers 50–80 words |
| Image/chart alt text | Describes the chart, using a keyword only if natural |
| Internal links | 3+ links to related tools (only **live** ones render), plus a link to the category hub |
| Anchor text | Descriptive (e.g. "day rate to salary calculator"), never "click here" |

**Never:** keyword stuffing, repeating the exact keyword more than ~3–4 times in the body, hidden text, or the same title/meta on two pages.

---

## 3. Tool page content template (`content.mdx`)

Target **900–1,500 words**: enough to be useful and clearly better than the thin calculator pages that rank today. Simple English, short paragraphs.

```
(intro, 2–3 sentences, contains the primary keyword; above or right under the calculator)

## How to use the {tool name}              ← steps that really are a sequence: numbered list OK
## How the {topic} is calculated             ← plain-English explanation + the formula
## {Secondary keyword phrased as a heading}  ← e.g. "Day rate vs salary: what's the difference?"
## Worked examples                           ← 2–3 examples with real numbers (US/UK/India mix where relevant)
## Tips and common mistakes                  ← practical, 4–6 points
## Frequently asked questions               ← keyword-map questions + 2–3 more; 50–80 words each
(Sources — only if the tool uses rates)
```

**Quality rules**
- Every number in an example must match what the calculator shows (a test already checks this).
- Write for a real person with a real decision. Answer the question, then explain.
- Add something big sites don't: a freelancer angle, a "what this means for you" line under examples, a clear next step to a related tool.
- **Rates or fees** (PayPal, Stripe, Wise, Upwork, Fiverr, tax): quote only from `/rates/*.json`, show the source link and a visible "Rates checked on {date}" line in the Sources section. Never write a fee from memory.
- No "Best…" titles. No AI filler ("In today's fast-paced world…"). No invented statistics.

---

## 4. Structured data (JSON-LD) per page type

| Page | Schema |
|---|---|
| Tool | `WebApplication` + `BreadcrumbList` + `FAQPage` |
| Category hub | `CollectionPage` + `BreadcrumbList` + `ItemList` (live tools) + `FAQPage` if it has FAQs |
| Homepage | `WebSite` (with `SearchAction` only if site search has a URL) + `Organization` |
| About / Methodology | `AboutPage` / `WebPage` + `BreadcrumbList` |

**Tool `WebApplication` fields:**
```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "<h1>",
  "url": "https://centhaven.com/<category>/<slug>",
  "description": "<meta description>",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Any",
  "browserRequirements": "Requires JavaScript",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "dateModified": "<lastUpdated ISO>",
  "publisher": { "@type": "Organization", "name": "CentHaven", "url": "https://centhaven.com" }
  // No personal author name (site policy). Reviewer name only for red-risk tools.
}
```
- **No fake `aggregateRating`** or reviews. Add ratings only if real user ratings exist.
- FAQ schema text must exactly match the visible FAQ.
- Validate with Google's Rich Results Test before marking a tool `live`.

---

## 5. Technical on-page (handled by the template, but check it)

- Canonical = the page's own URL (no query string; share-link params are not indexed).
- `robots`: index, follow (embed + dev pages: noindex).
- Open Graph + Twitter card with the per-tool OG image (title on brand background).
- `lang="en"`; one H1; heading order is never skipped.
- Sitemap `lastmod` = the registry's `lastUpdated`.
- Core Web Vitals: LCP < 2.5s, CLS < 0.1, INP < 200ms on mobile.
- The calculator renders a sensible default result in the HTML (static), so Google sees real numbers, not an empty box.

---

## 6. Updating content later (Claude, ChatGPT or a person)

Give the AI **these three things** and it has full context:
1. `docs/SEO.md` (this file)
2. The page's section from `docs/seo/keyword-map.md`
3. The page's current `content.mdx` + `meta.ts`

Prompt to use:
```
Here are our SEO rules (SEO.md), this page's keyword brief (from keyword-map.md),
and the current content. Improve the content for the primary keyword
"<primary>" and secondary keywords "<...>". Keep the title, meta and H1 exactly
as in the brief unless I say otherwise. Keep every example number unchanged
unless the calculator changes. Return the full updated content.mdx.
```

After any update: run `npm run check`, update `lastUpdated` in the registry, and note the change in `docs/seo/changelog.md` (date, page, what changed, why).

---

## 7. After launch: use real data

- Monthly: in Google Search Console, check each page's **queries**. If a page gets impressions for a keyword not in its brief, add it to `secondaryKeywords` and cover it in an H2 or FAQ.
- If two pages show up for the same query, decide which page owns it and update the keyword map.
- If a page sits at positions 8–20 for its primary keyword, improve the content first (examples, FAQ, depth), then internal links.
