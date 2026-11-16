# Day 2 plan: premium design + all pages (+ Day 3: go live)

The premium redesign makes Day 2 bigger, so it is split: **Day 2 = design + pages**, **Day 3 = deploy + 2 more tools**. Normal tool days start on Day 4.

Read first: `CLAUDE.md`, `docs/PRD.md`, `docs/DESIGN.md` (DESIGN.md replaces PRD §10).

## Day 2: design + pages

| # | Task | Done when |
|---|---|---|
| 0 | **Confirm leftovers:** currency-specific defaults are done; report the current initial JS size of the tool page | Both confirmed |
| 1 | **Design tokens:** colours, Schibsted Grotesk via next/font, type scale, spacing, radius from DESIGN.md §2–4 (Tailwind theme) | Old tokens removed, no Inter left |
| 2 | **Refine shared components** to DESIGN.md §5: inputs, sliders, result panel (brass underline, sticky, mobile result bar), result-change motion, buttons, tables, FAQ, icons | Hourly-rate tool looks premium; tests still pass |
| 3 | **Header:** logo SVG + favicon, mega-menu from the registry, ⌘K search dialog, mobile sheet | Keyboard + mobile tested |
| 4 | **Footer** per DESIGN.md §7 | Links built from the registry + config |
| 5 | **Homepage** per DESIGN.md §8, with the live hero calculator reusing `tools/hourly-rate-calculator/calc.ts` | Lighthouse ≥ 95, JS < 100 KB |
| 6 | **Category hub template** per §9 | Works with 1 or many tools |
| 7 | **Tool page layout:** right rail ("On this page" + related tools) | No empty right side on desktop |
| 8 | **Static pages:** About (placeholder text marked TODO for Puru), Methodology (full draft), Disclaimer, Privacy, Terms, Affiliate disclosure, Contact, 404 | All linked from the footer; `built: true` in config |
| 9 | **Embed page** `/embed/[slug]` (noindex) | Embed code button works |
| 10 | **OG images** for home, categories and tools (generated at build) | Correct preview when shared |
| 11 | **Check:** `npm run check` + test at 360/768/1280/1440 + no console errors | Report sizes per page type |

## Day 3: go live

| # | Task |
|---|---|
| 1 | Lighthouse on home, a category, a tool and a static page (Puru runs it in Chrome DevTools; fix anything under target) |
| 2 | Hostinger deploy: build `out/`, upload via GitHub Actions (FTP/SFTP deploy) or Hostinger Git deploy; HTTPS on; `www` → root redirect |
| 3 | Google Search Console: verify the domain, submit the sitemap |
| 4 | 2 more green tools from specs (e.g. Day Rate Calculator, Project Pricing Calculator) |
| 5 | Set the hourly-rate tool to `live` (first public tool) |

## Paste into Claude Code (Day 2)

```
Read CLAUDE.md, docs/PRD.md, docs/DESIGN.md and docs/DAY-2.md.
DESIGN.md replaces PRD §10. Do Day 2 tasks 0–11 in order.
Show me your plan first and wait for my OK. Rules: no new dependencies
without asking; keep Lighthouse ≥95 and JS budgets from DESIGN.md §10;
commit after each task. After task 5 (homepage), stop and send me
screenshots at 1440px and 375px before continuing.
```

## Day 2 results (2026-11-16)

All tasks 0–11 done, one commit each ("step N (day 2): …"). `npm run check`: 267 tests + 11 rate checks pass.

**Layout check (task 11):** every page (home, 3 hubs, 6 tools, 7 static pages, an embed, the 404) at 360, 768, 1280 and 1440px: no horizontal scroll, no console errors (76 page × width checks, preview build).

**Initial JS on top of the Next.js + React runtime (~129 KB gz), per page type:**

| Page type | JS (gz) | Budget |
|---|---|---|
| Homepage | 15.3 KB | 100 KB |
| Tool pages | 36.7–38.7 KB | 120 KB |
| Embeds | 35.6–37.7 KB | (none) |
| Category hubs | 11.1 KB | (none) |
| Static pages | 11.1 KB (Contact 13.1 KB) | (none) |

`npm run size` reads the built HTML and can undercount tool pages by about 4 KB (lazy shared chunks).

**Still for Puru:** Lighthouse on home, a hub, a tool and a static page (Day 3 task 1); the About page story (TODO in `app/(site)/about/page.tsx`); legal review of Privacy and Terms.
