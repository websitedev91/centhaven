# CLAUDE.md — CentHaven.com

You are building **CentHaven.com**: free, global money & work calculators. Tagline: "Smart tools to earn, save and grow."
Read `docs/PRD.md` before any large task. Tool specs live in `docs/specs/<slug>.md`.

## Stack
Next.js App Router + TypeScript (strict) · static export (`output: 'export'`) · Tailwind · Recharts (lazy, client-only) · Zod · Vitest · Google Tag Manager (GA4 inside it) · hosted on Hostinger.
No backend, no database, no login. Ask before adding any new dependency.

## Golden rules
1. **Never guess a finance number.** Tools never state a company fee, tax rate, limit or threshold. Every number comes from the user; starting values are labelled "example only". If a tool would need an outside number, STOP and ask.
2. **No rates files.** The `/rates` loader, `sources.md` and the rates check were removed (Puru, 2026-11-18) because no tool uses external rates.
3. **Formulas are pure functions** in `tools/<slug>/calc.ts`: no React, no dates, no fetch. Round money only at display time via `lib/format.ts`.
   **Exception (Puru, 2026-11-18):** the quote and invoice generators (`lib/doc-calc.ts`) round each line, then contingency, discount and tax, to 2 decimals with the float-safe `roundTo` before summing, so a printed document adds up. No other tool does this.
4. **Every tool has tests** in `calc.test.ts`, including every test case from its spec. Tests must pass.
5. **Scope:** only tools that help people earn, save, spend or manage money. Flag anything else.
   Scope rule (Puru, 2026-11-18): CentHaven builds ONLY pure-maths tools where every number comes from the user. No tool may depend on company fees, tax rates, government limits or legal rules.
6. **Publishing is controlled by `lib/registry.ts`.** Only `status: 'live'` tools get pages, sitemap entries and links. New tools start as `draft`; set `ready` when all quality gates pass. Never set `live` unless asked.

## Every tool folder
`tools/<slug>/` → `calc.ts`, `calc.test.ts`, `schema.ts` (Zod inputs + defaults), `Calculator.tsx`, `content.mdx`, `meta.ts`.
Register it in `lib/registry.ts`. Use the shared components in `/components`; don't rebuild layout per tool.

## Page order (from ToolLayout)
Breadcrumbs → H1 + subtitle → calculator → result + breakdown → chart (if useful) → scenario compare (if useful) → share / print / embed → affiliate slot → content (what it does, formula, 2–3 examples, tips, FAQ 6–10) → related tools → sources → "how it is checked" note → disclaimer.

## SEO rules (read before writing any page)
- `docs/SEO.md` = on-page rules, content template, schema. `docs/seo/keyword-map.md` = each page's primary/secondary keywords, title, meta, H1, FAQ questions, internal links.
- Copy title, meta description, H1, keywords, FAQ questions and related tools **exactly** from the keyword map into `meta.ts`. If the map has no entry for a page, stop and ask.
- To change a page's keywords: update the keyword map first, then `meta.ts` + `content.mdx`, then add a line to `docs/seo/changelog.md`.

## Content rules
- Simple English, short paragraphs, real numbers in examples.
- No "Best …" titles. Titles, meta descriptions and H1s come **only** from `docs/seo/keyword-map.md`.
- FAQ answers 50–80 words, no lists inside answers.
- Disclaimer on every tool: "For estimates only. Not financial, tax or legal advice. Check with a qualified professional."
- No author name and no "Last updated" date on any page (Puru, 2026-11-16).
- No personal author names. Authorship = CentHaven team.
- The Sources section (`components/Sources.tsx`) says the tool uses only the numbers you enter. No dates or source links.
- Google Tag Manager loads on site pages only, never on `/embed/*`.

## Currency inputs
- Every tool with money inputs uses the shared currency-defaults pattern: per-currency starting values live in the tool's `schema.ts`; switching currency swaps them only while the user hasn't edited the inputs.
- Standard currency list: USD, GBP, EUR, CAD, AUD, INR. INR values use Indian digit grouping (₹12,00,000).
- **Currency inputs:** if a tool has a currency selector, define `CurrencyPresets` for every currency in its `schema.ts` (income/expense-style defaults that make sense in that currency) and use `switchCurrency` + `currencyVariant` from `lib/currency-defaults.ts`. Untouched fields follow the currency; typed values are kept. Add tests for the switch.

## Quality gates (before `ready`)
1. Works at 375px and 1280px
2. Every number comes from the user (no outside rates); example defaults are labelled
3. All spec test cases pass
4. Content + JSON-LD (WebApplication, BreadcrumbList, FAQPage) complete
5. Disclaimer, affiliate slot (renders nothing if no partner is enabled)
6. No console errors; Lighthouse mobile ≥ 95 performance, 100 SEO
7. No red-risk tools (scope rule: every number comes from the user; nothing that depends on company fees, tax rates, government limits or legal rules)

Run `npm run check` (types + lint + tests) before saying a task is done.

## Affiliates
From `config/affiliates.json` only. Links: `rel="sponsored nofollow noopener"`, `target="_blank"`, with a disclosure line. Partners stay `enabled: false` until Puru says he's approved.

## Workflow
- Work one tool at a time; finish all gates before starting the next.
- At the end of a task, report: files changed, tests run (pass/fail), any rate you need approved, anything you're unsure about.
- Keep components small and reusable. Prefer editing shared components over copy-paste.
