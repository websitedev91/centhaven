# Deploying CentHaven to Hostinger (Cloud Startup)

Same setup as tools.sanishtech.com: a **Node.js web app with GitHub auto-deployment**.
On every push to `main`, Hostinger pulls the repo, runs `npm run build` (static export into `out/`
plus the postbuild safety checks) and then `npm start`, which serves `out/` with
`scripts/serve-out.mjs` (no dependencies). Only `live` tools are built.

## Hostinger settings
| Setting | Value |
|---|---|
| Repository / branch | `websitedev91/centhaven` · `main` |
| Framework | Next.js (or "Other" if Next.js forces `next start`) |
| Node version | 22.x |
| Root directory | `./` |
| Install command | `npm ci` (or `npm install`) |
| Build command | `npm run build` |
| Start command | `npm start` |
| Environment variables | none needed |
| Auto-deployment | on |

`next start` does **not** work with this project (static export). The start command must be `npm start`.

## What the server does (`scripts/serve-out.mjs`)
- Clean URLs: `/about` → `about.html`, `/freelance` → `freelance.html`; `/about/` and `/index.html` redirect (301) to the clean URL.
- `www.centhaven.com` → `https://centhaven.com` (301). HTTPS is forced by Hostinger in front of it.
- Real 404 page with status 404; never serves dotfiles; GET/HEAD only.
- Cache: hashed JS/CSS/fonts 1 year, images 7 days, pages and data always revalidated; gzip for text.

## Checks after each deploy
1. https://centhaven.com, a hub, a tool, an embed (`/embed/break-even-calculator`) and a missing page (404).
2. http:// and www. both end at https://centhaven.com.
3. GitHub → Actions: the **CI** workflow (build + tests) is green.

## After the first deploy
1. PageSpeed Insights (mobile) on home, a hub, a tool and a static page: targets in DESIGN.md §10.
2. Google Search Console: add the domain, submit `https://centhaven.com/sitemap.xml`.
3. Google Tag Manager: add the GA4 tag and custom-event triggers.

## Rolling back
In hPanel → Deployments, redeploy an earlier deployment, or revert the bad commit on `main` and push.
