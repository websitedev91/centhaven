# CentHaven.com — Master PRD (v1.0)

Owner: Purushothaman · Date: 14 Nov 2026 · Builder: Claude Code

---

## 1. Product summary

**CentHaven** is a free, global website of money & work calculators.
Tagline: **"Smart tools to earn, save and grow."**

- **Audience (launch):** freelancers and remote workers worldwide (US, UK, Canada, Australia, India).
- **Later clusters:** tax, personal finance, investing, loans and debt, salary and career, small business.
- **Scope rule:** every tool must help someone **earn, save, spend or manage money**. Nothing else goes on this site.
- **Why people use it over ChatGPT:** interactive inputs, sliders, comparisons, charts, shareable results, PDF export and embeds, plus current, sourced rates.

### Goals (first 90 days)
| Metric | Target |
|---|---|
| Calculators live | 20+ (launch with 30 if ready) |
| Referring domains | 30+ |
| Affiliate sales | First sale |
| Lighthouse (mobile) | ≥ 95 performance, 100 SEO, ≥ 95 accessibility |

---

## 2. Tech stack

| Area | Choice | Notes |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript (strict)** | |
| Rendering | **Static export** (`output: 'export'`) | All calculators run in the browser. Fast, cheap, no server needed |
| Hosting | **Hostinger** (static files) | Deploy from GitHub. Revisit when premium/login is added |
| Styling | **Tailwind CSS** | No UI kit; keep the bundle small |
| Charts | **Recharts**, loaded with `next/dynamic` (client only) | Charts load only when shown |
| Tests | **Vitest** | Every formula has tests |
| Validation | **Zod** | Validate inputs and rates JSON at build time |
| Analytics | **GA4** | Events listed in §9 |
| PDF export | **Print stylesheet + `window.print()`** | No PDF library in v1 |

Rules: no backend, no database, no login in v1. Avoid heavy dependencies; check bundle size before adding a package.

---

## 3. URL & site structure

```
/                                   Home
/freelance/                         Category hub (launch category)
/freelance/hourly-rate-calculator   Tool page
/fees/                              Category hub (payment & platform fees)
/fees/paypal-fee-calculator
/tax/  /personal-finance/  /investing/  /loans/  /salary/  /business/   (later)
/embed/[slug]                       Minimal embeddable version of a tool (noindex)
/about  /methodology  /disclaimer  /privacy  /terms  /affiliate-disclosure  /contact
/sitemap.xml  /robots.txt
```

- Lowercase, hyphenated slugs ending in `-calculator`, `-generator` or `-checker`.
- Breadcrumbs on every page: Home › Category › Tool.
- Category hubs list their **live** tools as cards with a short intro (300–500 words, no thin pages).

---

## 4. Project folder structure

```
/app
  /(site)/page.tsx                    Home
  /[category]/page.tsx                Category hub (generated from registry)
  /[category]/[tool]/page.tsx         Tool page (generated from registry)
  /embed/[tool]/page.tsx              Embed page
  /about … /contact                   Static pages
  sitemap.ts  robots.ts
/tools
  /hourly-rate-calculator
    calc.ts          Pure functions only (no React). Inputs → outputs
    calc.test.ts     Tests (must match official/manual test cases from the spec)
    schema.ts        Zod schema for inputs + defaults
    Calculator.tsx   The interactive UI (client component)
    content.mdx      Explanation, formula, examples, FAQ
    meta.ts          Title, description, keyword, category, related tools, affiliate id, risk level
/components
  ToolLayout.tsx  ResultCard.tsx  InputNumber.tsx  InputCurrency.tsx  Slider.tsx
  ScenarioCompare.tsx  ChartLazy.tsx  AffiliateSlot.tsx  ShareButton.tsx
  EmbedCodeBox.tsx  PrintButton.tsx  Disclaimer.tsx  LastUpdated.tsx  FaqList.tsx
  Breadcrumbs.tsx  RelatedTools.tsx  AuthorBox.tsx
/lib
  registry.ts      Single list of all tools (see §5)
  format.ts        Intl.NumberFormat helpers (currency, %, numbers)
  rates.ts         Loads + validates /rates/*.json
  seo.ts           Metadata + JSON-LD builders
  analytics.ts     GA4 event helpers
/rates
  paypal-fees.json  wise-fees.json  … (one file per rule set)
/config
  affiliates.json  site.ts
/docs
  PRD.md  TOOL-SPEC-TEMPLATE.md  /specs/<slug>.md
sources.md
CLAUDE.md
```

---

## 5. Tool registry (build in bulk, publish gradually)

`/lib/registry.ts` is the **single source of truth**:

```ts
type ToolStatus = 'draft' | 'ready' | 'live';
type Risk = 'green' | 'yellow' | 'red';

interface ToolEntry {
  slug: string;              // 'hourly-rate-calculator'
  category: string;          // 'freelance'
  title: string;             // 'Freelance Hourly Rate Calculator'
  status: ToolStatus;        // only 'live' tools get pages, sitemap entries and links
  risk: Risk;
  publishDate?: string;      // ISO date, set when status → live
  lastUpdated: string;       // ISO date shown on the page
  reviewedBy?: string;       // e.g. 'Name, CA' (required before a red tool goes live)
}
```

- `generateStaticParams` builds pages **only for `live` tools**.
- `draft` / `ready` tools exist in code but are invisible: no page, no sitemap, no links.
- Publishing a batch = change `status` to `live` + set `publishDate`, then deploy.
- A dev-only page `/dev/tools` (excluded from the production build) lists every tool with its status, for review.

---

## 6. Tool page template (every tool, same order)

1. **Breadcrumbs**
2. **H1** = tool name (no "Best…" titles) + a one-line subtitle saying what it calculates
3. **Calculator card** (above the fold on desktop)
   - Clear labelled inputs with sensible defaults (the tool shows a result immediately)
   - Currency selector where relevant (USD, GBP, EUR, CAD, AUD, INR as a minimum)
   - Sliders for key values; "Advanced options" collapsed by default
4. **Result panel:** main number large, then a breakdown table. Updates live (no "Calculate" button needed unless heavy).
5. **Chart** (where it helps understanding; lazy-loaded)
6. **Scenario compare** (where useful): "Compare A vs B" side by side
7. **Actions row:** Share link (state saved in URL query params) · Print/PDF · Get embed code
8. **Affiliate slot:** right after the result, relevant to it (see §8)
9. **Content** (from `content.mdx`):
   - What this calculator does (short)
   - How it works: the formula in plain English plus the formula itself
   - 2–3 worked examples with real numbers
   - Tips / common mistakes
   - FAQ (6–10 questions, each answered in 50–80 words)
10. **Related tools** (3–6, same or nearby category, live only)
11. **Sources:** official links used for rates (from `/rates` metadata)
12. **Author / reviewer box:** "Built by Purushothaman", plus "Reviewed by …" when a reviewer exists
13. **Last updated** date
14. **Disclaimer:** "For estimates only. Not financial, tax or legal advice. Check with a qualified professional."

### Calculator rules
- `calc.ts` is **pure**: no React, no `Date.now()` and no fetch inside formulas. Easy to test.
- Never use floating-point maths for money without rounding: round **once**, at display time, using a helper in `format.ts`.
- Validate all inputs with Zod. Show friendly inline errors and never crash.
- Every result shows the currency and whether it's monthly or yearly.
- Mobile-first: inputs stack; the result stays visible (sticky summary on mobile).
- Accessible: every input has a `<label>`, keyboard works everywhere, contrast AA.

---

## 7. Rates & sources (non-negotiable)

Any number that can change (fees, tax rates, limits, thresholds) lives in `/rates/*.json`, **never in code**.

```json
{
  "id": "paypal-fees-us",
  "effectiveFrom": "2026-08-01",
  "verifiedOn": "2026-11-14",
  "source": {
    "url": "https://www.paypal.com/us/business/paypal-business-fees",
    "quote": "exact line copied from the official page"
  },
  "data": { "...": "..." }
}
```

- `sources.md` lists every rates file → official URL.
- Claude Code **must quote the official URL and the exact line** for every rate it adds or changes, and show old vs new values. Puru approves before merge.
- Build fails if any rates file is missing `source.url`, `verifiedOn` or `effectiveFrom` (Zod check in `lib/rates.ts`).
- If a rate cannot be confirmed from an official source: **stop and ask**. Never guess.

---

## 8. Affiliates

- `/config/affiliates.json`: id, partner name, URL, short pitch, `enabled` flag.
- `AffiliateSlot` shows **one** relevant offer after the result. Links use `rel="sponsored nofollow noopener"` and `target="_blank"`.
- A short disclosure under the slot: "We may earn a commission if you sign up. It doesn't change our results."
- All partners are `enabled: false` until Puru is approved by each program. With nothing enabled, the slot renders nothing (no empty box).
- Planned partners (apply after launch): Wise, Payoneer, invoicing/accounting software, tax software, brokerages.

---

## 9. SEO & analytics

**Per page**
- `<title>`: `{Tool name} – Free {Calculator/Generator} | CentHaven` (≤ 60 chars where possible)
- Meta description 140–155 chars, written for the main keyword
- Canonical URL; Open Graph + Twitter card; one generated OG image per tool (title on brand background)
- JSON-LD: `WebApplication` (applicationCategory: FinanceApplication, offers price 0) + `BreadcrumbList` + `FAQPage`
- One H1; logical H2/H3 order; internal links to related tools and the category hub

**Site**
- `sitemap.xml` from the registry (live tools only, `lastmod` = `lastUpdated`)
- `robots.txt` allows everything except `/embed/` and `/dev/`
- `/embed/*` pages: `noindex`, and they show a "Powered by CentHaven" link back to the tool

**GA4 events:** `calculate` (first result shown), `affiliate_click`, `share_click`, `print_click`, `embed_copy`, `scenario_compare`.

---

## 10. Design system (v1)

> **Superseded by `docs/DESIGN.md` (Design System v2, "Ledger").** Kept for history only.

| Token | Value |
|---|---|
| Primary | `#0F766E` (teal 700): trust, money |
| Primary hover | `#115E59` |
| Accent | `#F59E0B` (amber 500): highlights, key result |
| Background | `#FFFFFF`, section bg `#F8FAFC` |
| Text | `#0F172A`, muted `#475569` |
| Border | `#E2E8F0` |
| Success / Error | `#16A34A` / `#DC2626` |
| Font | Inter (via `next/font`), headings 700, body 400 |
| Radius | 12px cards, 8px inputs/buttons |

Clean, calm and trustworthy, with plenty of white space. No stock-photo clutter. Logo for v1 is a simple wordmark, "CentHaven", with a small cent-coin icon.

---

## 11. Static pages (required before launch)

About (who builds it and why) · Methodology (how we build and verify calculators, sources, update calendar) · Disclaimer · Privacy (GA4, no personal data stored) · Terms · Affiliate disclosure · Contact (simple email link).

The Methodology page matters for trust on money topics: explain the official sources, tests against official calculators, expert review for tax tools and the update schedule.

---

## 12. Quality gates (a tool can only become `live` when all pass)

1. Works on mobile and desktop (check at 375px and 1280px)
2. Rates come from `/rates/*.json` and are listed in `sources.md`
3. `calc.test.ts` passes and includes the spec's 3+ test cases matching an official or manual calculation
4. Content complete: explanation, formula, examples, FAQ, schema
5. Disclaimer + Last updated + affiliate slot (or none if no partner)
6. Lighthouse mobile ≥ 95 performance, 100 SEO; no console errors
7. Red-risk tools: `reviewedBy` filled in

`npm run check` runs: type-check, lint, tests and rates validation. It must pass before every deploy.

---

## 13. Build plan

| Day | Work | Done when |
|---|---|---|
| **Day 1** | Project setup, design tokens, layout, all shared components, registry, rates loader, SEO helpers, sitemap/robots, `/dev/tools`, plus **1 demo tool** (Freelance Hourly Rate Calculator) built fully through the template | Demo tool passes all quality gates locally |
| **Day 2** | Home, category hubs, static pages, embed route, OG images, Hostinger deploy pipeline, **2 more tools** | Site deployed (tools can stay `ready`) |
| **Day 3+** | 5 green tools/day from `/docs/specs/` (2–3/day for yellow/red) | Each tool passes the gates and is marked `ready` |
| **Launch** | Switch the best 30 to `live`, submit sitemap to Google Search Console | 30 live tools indexed |
| **Weekly** | Next batch to `live` (15–20/week) | Steady growth |

---

## 14. Out of scope for v1

Login and accounts, saved calculations, premium/paywall, database, multi-language UI, user comments, newsletter, AI features. These come in year 2 and get their own PRD.
