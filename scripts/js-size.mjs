// Initial JS per built page, gzipped, measured ON TOP of the Next.js + React runtime
// (DESIGN.md §10 budgets, method approved 2026-11-16). Run after a build (`npm run build`
// or `npm run build:preview` to include draft tools).
//
// Counts every JS chunk a page's HTML references: its <script> tags plus the chunks named in
// the inline RSC payload, which is how lazily loaded calculators are pulled in. The legacy
// polyfill (nomodule, skipped by modern browsers) and the shared runtime are not counted.
// Known gap: small shared chunks that a lazy calculator chunk loads at runtime are not named in
// the HTML (≈4 KB on tool pages, checked in a real browser on 2026-11-16), so treat tool-page
// numbers as slightly low and keep headroom against the budget.
// Usage: node scripts/js-size.mjs  → prints a table, exits 1 if a budget is exceeded.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { gzipSync } from 'node:zlib';

const ROOT = process.cwd();
const OUT = join(ROOT, 'out');
const NEXT = join(ROOT, '.next');
const KB = 1024;
const BUDGET = { home: 100, tool: 120 };

if (!existsSync(OUT)) {
  console.error('js-size: out/ not found. Run a build first.');
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(join(NEXT, 'build-manifest.json'), 'utf8'));
const runtime = new Set(manifest.rootMainFiles.map((f) => f.replace(/^static\//, '')));
const polyfill = new Set((manifest.polyfillFiles ?? []).map((f) => f.replace(/^static\//, '')));

const sizes = new Map();
function gz(chunk) {
  if (!sizes.has(chunk)) {
    const file = join(OUT, '_next', 'static', chunk);
    sizes.set(chunk, existsSync(file) ? gzipSync(readFileSync(file)).length : 0);
  }
  return sizes.get(chunk);
}
const runtimeSize = [...runtime].reduce((n, c) => n + gz(c), 0);

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return name === '_next' ? [] : htmlFiles(p);
    return name.endsWith('.html') ? [p] : [];
  });
}

function pageType(route, html) {
  if (route === '/') return 'home';
  if (/^\/[^/]+\/[^/]+$/.test(route) && html.includes('"WebApplication"')) return 'tool';
  if (html.includes('"CollectionPage"') || /^\/[^/]+$/.test(route) === false) return 'other';
  return 'page';
}

const rows = [];
for (const file of htmlFiles(OUT)) {
  const rel = relative(OUT, file).replace(/\\/g, '/').replace(/\.html$/, '');
  const route = rel === 'index' ? '/' : `/${rel}`;
  if (route === '/404' || route.startsWith('/_')) continue;
  const html = readFileSync(file, 'utf8');
  const chunks = new Set(
    [...html.matchAll(/static\/(chunks\/[A-Za-z0-9_.~-]+\.js)/g)].map((m) => m[1]).filter((c) => !runtime.has(c) && !polyfill.has(c)),
  );
  const size = [...chunks].reduce((n, c) => n + gz(c), 0);
  const type = pageType(route, html);
  rows.push({ route, type, size, budget: BUDGET[type] });
}

rows.sort((a, b) => a.route.localeCompare(b.route));
console.log(`js-size: Next.js + React runtime ${(runtimeSize / KB).toFixed(1)} KB gz (not counted)`);
let failed = false;
for (const r of rows) {
  const over = r.budget !== undefined && r.size > r.budget * KB;
  failed ||= over;
  const budget = r.budget === undefined ? '' : ` / ${r.budget} KB${over ? '  OVER BUDGET' : ''}`;
  console.log(`  ${r.route.padEnd(44)} ${(r.size / KB).toFixed(1).padStart(6)} KB${budget}`);
}
if (failed) process.exit(1);
