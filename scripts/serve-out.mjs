// Tiny static server for the exported /out folder (local checks only, no dependency).
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = join(process.cwd(), 'out');
const port = Number(process.env.PORT ?? 4173);
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.ico': 'image/x-icon', '.txt': 'text/plain', '.xml': 'application/xml',
  '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json',
};

async function resolve(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath.split('?')[0])).replace(/^[\\/]+/, '');
  const base = join(root, clean);
  if (!base.startsWith(root)) return null;
  for (const candidate of [base, `${base}.html`, join(base, 'index.html')]) {
    try { if ((await stat(candidate)).isFile()) return candidate; } catch { /* try next */ }
  }
  return null;
}

createServer(async (req, res) => {
  const file = await resolve(req.url ?? '/');
  const target = file ?? join(root, '404.html');
  const body = await readFile(target).catch(() => Buffer.from('Not found'));
  res.writeHead(file ? 200 : 404, { 'Content-Type': types[extname(target)] ?? 'application/octet-stream' });
  res.end(body);
}).listen(port, () => console.log(`Serving out/ at http://localhost:${port}`));
