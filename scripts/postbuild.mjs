// Runs automatically after `npm run build`.
// 1. Removes the "__none__" placeholder pages emitted when no tool/category is live
//    (see lib/static-params.ts).
// 2. Fails the build if anything that must not ship is in /out.
import { existsSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

const OUT = join(process.cwd(), 'out');
const PLACEHOLDER = '__none__';

if (!existsSync(OUT)) {
  console.error('postbuild: out/ not found — did next build run?');
  process.exit(1);
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? [p, ...walk(p)] : [p];
  });
}

let removed = 0;
// Deepest paths first so directories are removed after their contents.
for (const p of walk(OUT).sort((a, b) => b.length - a.length)) {
  if (p.split(/[\\/]/).some((seg) => seg === PLACEHOLDER || seg.startsWith(`${PLACEHOLDER}.`))) {
    rmSync(p, { recursive: true, force: true });
    removed++;
  }
}

// Next 16 on Windows writes segment prefetch files with backslash paths, so
// `__next.$d$category.__PAGE__.txt` lands as `__next.$d$category/__PAGE__.txt` and the
// client router's prefetch 404s. Flatten any such directory into dotted file names
// (a no-op on Linux/macOS builds, where Next already writes flat files).
let flattened = 0;
for (const p of walk(OUT).filter((x) => statSync(x).isDirectory()).sort((a, b) => a.length - b.length)) {
  if (!existsSync(p)) continue;
  const name = p.split(/[\\/]/).pop();
  if (!name.startsWith('__next.')) continue;
  for (const file of walk(p).filter((x) => statSync(x).isFile())) {
    const rel = relative(p, file).split(/[\\/]/).join('.');
    renameSync(file, join(dirname(p), `${name}.${rel}`));
    flattened++;
  }
  rmSync(p, { recursive: true, force: true });
}

const problems = [];
const files = walk(OUT);
for (const p of files) {
  const rel = relative(OUT, p).replace(/\\/g, '/');
  if (rel.includes(PLACEHOLDER)) problems.push(`placeholder left behind: ${rel}`);
  if (rel === 'dev' || rel.startsWith('dev/') || rel.startsWith('dev.')) problems.push(`dev-only route shipped: ${rel}`);
}
const sitemap = existsSync(join(OUT, 'sitemap.xml')) ? readFileSync(join(OUT, 'sitemap.xml'), 'utf8') : '';
if (!sitemap) problems.push('sitemap.xml missing');
if (sitemap.includes(PLACEHOLDER)) problems.push('sitemap.xml contains the placeholder');
if (!existsSync(join(OUT, 'robots.txt'))) problems.push('robots.txt missing');

// Markdown tables don't render in our MDX (no GFM plugin): a raw "|---" in a page means one
// slipped through as text. Use an HTML <table> in content.mdx instead.
for (const p of files.filter((x) => x.endsWith('.html'))) {
  if (readFileSync(p, 'utf8').includes('|---')) problems.push(`raw markdown table text ("|---") in ${relative(OUT, p).replace(/\\/g, '/')}`);
}

// Every page's share image must exist as a file (og:image → /og/*.png).
for (const p of files.filter((x) => x.endsWith('.html'))) {
  const html = readFileSync(p, 'utf8');
  for (const m of html.matchAll(/<meta property="og:image" content="https:\/\/[^/"]+(\/[^"?]*)/g)) {
    if (!existsSync(join(OUT, m[1]))) problems.push(`og:image missing: ${m[1]} (from ${relative(OUT, p).replace(/\\/g, '/')})`);
  }
}

// Preview builds (PREVIEW_DRAFTS=1) publish draft tools. Leave out/ usable for local viewing,
// but mark it and exit 2 so `npm run build` / any deploy step treats it as a failure.
const PREVIEW_MARKER = join(OUT, 'PREVIEW-BUILD-DO-NOT-DEPLOY.txt');
if (process.env.PREVIEW_DRAFTS === '1') {
  writeFileSync(PREVIEW_MARKER, 'This out/ was built with PREVIEW_DRAFTS=1 and includes draft tools. Do not deploy.\n');
} else if (existsSync(PREVIEW_MARKER)) {
  problems.push('preview marker found in a normal build');
}

if (problems.length) {
  console.error(`postbuild: FAILED\n  - ${problems.join('\n  - ')}`);
  process.exit(1);
}
if (process.env.PREVIEW_DRAFTS === '1') {
  console.error('postbuild: PREVIEW BUILD (draft tools included). out/ is for local viewing only, do not deploy.');
  process.exit(2);
}
console.log(`postbuild: ok (removed ${removed} placeholder file(s), flattened ${flattened} segment file(s), ${files.length} files in out/)`);
