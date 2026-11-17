# Deploying CentHaven to Hostinger (Cloud Startup)

Hostinger **GitHub auto-deployment** (same GitHub account as tools.sanishtech.com). On every push to
`main`, Hostinger pulls the repo, runs `npm run build` (static export into `out/` plus the postbuild
safety checks) and **serves `out/` directly with its own web server** (LiteSpeed behind Hostinger's
CDN). Only `live` tools are built.

## Hostinger settings (working, 2026-11-17)
| Setting | Value |
|---|---|
| Repository / branch | `websitedev91/centhaven` · `main` |
| Framework | **Other** (not Next.js: the Next.js preset wraps our config and stops the static export) |
| Output directory | **out** |
| Node version | 22.x |
| Root directory | `./` |
| Build command | `npm run build` |
| Start command | `npm start` (unused while Hostinger serves `out/` statically) |
| Environment variables | none needed |
| Auto-deployment | on |

## Clean URLs: `public/.htaccess`
Copied into `out/` on every build. Every page has both `about.html` and an `about/` folder (Next.js
data files), so without these rules the server redirects `/about` → `/about/` and returns 403.
The rules: serve `/about` and `/about/` from `about.html`, force `https://centhaven.com` (no www),
send missing pages to `/404.html`, and set cache headers.

`scripts/serve-out.mjs` does the same for local checks (`npm start` → http://localhost:4173).

## Checks after each deploy
Every page answers 200 at its clean URL, a missing page answers 404, and http:// and www. end at
https://centhaven.com. GitHub → Actions: the **CI** workflow (build + tests) is green.

## After the first deploy
1. PageSpeed Insights (mobile) on home, a hub, a tool and a static page: targets in DESIGN.md §10.
2. Google Search Console: add the domain, submit `https://centhaven.com/sitemap.xml`.
3. Google Tag Manager: add the GA4 tag and custom-event triggers.

## Rolling back
In hPanel → Deployments, redeploy an earlier deployment, or revert the bad commit on `main` and push.
