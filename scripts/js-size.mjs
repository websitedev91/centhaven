// Initial JS per page type, gzipped, measured ON TOP of the Next.js + React runtime
// (DESIGN.md §10 budgets, method approved 2026-11-16). Run after `next build`.
// Usage: node scripts/js-size.mjs  → prints a table, exits 1 if a budget is exceeded.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { runInNewContext } from 'node:vm';
import { gzipSync } from 'node:zlib';

const NEXT = join(process.cwd(), '.next');
const KB = 1024;
/** Route (as in .next/server/app) → budget in KB, app code only. */
const BUDGETS = { '/': 100, '/[category]/[tool]': 120 };

const gz = (file) => gzipSync(readFileSync(join(NEXT, file))).length;
const buildManifest = JSON.parse(readFileSync(join(NEXT, 'build-manifest.json'), 'utf8'));
const framework = new Set(buildManifest.rootMainFiles);
const frameworkSize = [...framework].reduce((n, f) => n + gz(f), 0);

function manifests(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return manifests(p);
    return name === 'page_client-reference-manifest.js' ? [p] : [];
  });
}

const rows = [];
for (const file of manifests(join(NEXT, 'server', 'app'))) {
  const route = '/' + relative(join(NEXT, 'server', 'app'), file).replace(/\\/g, '/').replace(/\/?page_client-reference-manifest\.js$/, '');
  if (route.startsWith('/_') || route.startsWith('/dev')) continue;
  const ctx = { globalThis: {} };
  ctx.self = ctx.globalThis;
  runInNewContext(readFileSync(file, 'utf8'), ctx);
  const m = Object.values(ctx.globalThis.__RSC_MANIFEST)[0];
  const pageKey = Object.keys(m.entryJSFiles).find((k) => k.endsWith('/page'));
  const layoutKey = Object.keys(m.entryJSFiles).find((k) => k.endsWith('app/layout'));
  const chunks = new Set([...(m.entryJSFiles[layoutKey] ?? []), ...(m.entryJSFiles[pageKey] ?? [])].filter((c) => !framework.has(c)));
  const size = [...chunks].reduce((n, c) => n + (existsSync(join(NEXT, c)) ? gz(c) : 0), 0);
  rows.push({ route: route === '/' ? '/' : route, size, budget: BUDGETS[route === '/' ? '/' : route] });
}

rows.sort((a, b) => a.route.localeCompare(b.route));
console.log(`js-size: Next.js + React runtime ${(frameworkSize / KB).toFixed(1)} KB gz (not counted)`);
let failed = false;
for (const r of rows) {
  const over = r.budget !== undefined && r.size > r.budget * KB;
  failed ||= over;
  const budget = r.budget === undefined ? '' : ` / ${r.budget} KB${over ? '  OVER BUDGET' : ''}`;
  console.log(`  ${r.route.padEnd(28)} ${(r.size / KB).toFixed(1).padStart(6)} KB${budget}`);
}
if (failed) process.exit(1);
