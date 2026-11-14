// Runs automatically after `npm run build`.
// 1. Removes the "__none__" placeholder pages emitted when no tool/category is live
//    (see lib/static-params.ts).
// 2. Fails the build if anything that must not ship is in /out.
import { existsSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

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

if (problems.length) {
  console.error(`postbuild: FAILED\n  - ${problems.join('\n  - ')}`);
  process.exit(1);
}
console.log(`postbuild: ok (removed ${removed} placeholder file(s), ${files.length} files in out/)`);
