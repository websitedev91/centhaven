// Static server for the exported /out folder. No dependencies.
// Production: Hostinger runs it as a Node.js web app (`npm start` after `npm run build`), see docs/DEPLOY.md.
// Local: `npm start` serves the last build at http://localhost:4173.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { gzipSync } from 'node:zlib';

const ROOT = join(process.cwd(), 'out');
const PORT = Number(process.env.PORT ?? 4173);
const CANONICAL_HOST = 'centhaven.com';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
};
const COMPRESSIBLE = new Set(['.html', '.js', '.css', '.json', '.txt', '.xml', '.svg']);

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

function cacheControl(ext) {
  if (ext === '.js' || ext === '.css' || ext === '.woff2') return 'public, max-age=31536000, immutable'; // hashed /_next assets
  if (ext === '.png' || ext === '.svg' || ext === '.ico') return 'public, max-age=604800';
  return 'public, max-age=0, must-revalidate'; // pages, RSC data, sitemap: a new deploy shows at once
}

/** Small in-memory cache: the whole site is a few MB and only changes on deploy (process restart). */
const cache = new Map();
async function load(file) {
  if (!cache.has(file)) {
    const body = await readFile(file);
    const ext = extname(file);
    cache.set(file, { body, gz: COMPRESSIBLE.has(ext) && body.length > 1024 ? gzipSync(body) : null, ext });
  }
  return cache.get(file);
}

async function isFile(p) {
  try {
    return (await stat(p)).isFile();
  } catch {
    return false;
  }
}

/** /about → about.html, /freelance → freelance.html (even though freelance/ is a folder), / → index.html. */
async function resolve(pathname) {
  const clean = normalize(pathname).replace(/^[\\/]+/, '');
  if (clean.split(/[\\/]/).some((part) => part.startsWith('.'))) return null; // never serve dotfiles
  const base = join(ROOT, clean);
  if (base !== ROOT && !base.startsWith(ROOT + sep)) return null; // path traversal
  for (const candidate of [base, `${base}.html`, join(base, 'index.html')]) {
    if (await isFile(candidate)) return candidate;
  }
  return null;
}

function redirect(res, location) {
  res.writeHead(301, { Location: location, ...SECURITY_HEADERS });
  res.end();
}

createServer(async (req, res) => {
  try {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { Allow: 'GET, HEAD' });
      res.end();
      return;
    }

    const url = new URL(req.url ?? '/', 'http://localhost');
    const host = (req.headers['x-forwarded-host'] ?? req.headers.host ?? '').toString().split(',')[0].trim().toLowerCase();
    const onSite = host === CANONICAL_HOST || host === `www.${CANONICAL_HOST}`;

    // www → https://centhaven.com (only for the real domain, never on localhost). HTTPS itself is
    // forced by Hostinger in front of this server; doing it here could loop behind their proxy.
    if (onSite && host !== CANONICAL_HOST) {
      redirect(res, `https://${CANONICAL_HOST}${url.pathname}${url.search}`);
      return;
    }

    let pathname;
    try {
      pathname = decodeURIComponent(url.pathname);
    } catch {
      pathname = '/__bad__';
    }
    // /index.html → /, /about/ → /about (canonical URLs have no trailing slash).
    if (pathname === '/index.html') return redirect(res, `/${url.search}`);
    if (pathname.length > 1 && pathname.endsWith('/')) return redirect(res, `${pathname.replace(/\/+$/, '')}${url.search}`);

    const file = await resolve(pathname);
    const { body, gz, ext } = await load(file ?? join(ROOT, '404.html'));
    const useGzip = gz && /\bgzip\b/.test(req.headers['accept-encoding'] ?? '');
    const payload = useGzip ? gz : body;

    res.writeHead(file ? 200 : 404, {
      'Content-Type': TYPES[ext] ?? 'application/octet-stream',
      'Content-Length': payload.length,
      'Cache-Control': cacheControl(ext),
      Vary: 'Accept-Encoding',
      ...(useGzip ? { 'Content-Encoding': 'gzip' } : {}),
      ...SECURITY_HEADERS,
    });
    res.end(req.method === 'HEAD' ? undefined : payload);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Server error');
  }
}).listen(PORT, () => console.log(`Serving out/ on port ${PORT}`));
