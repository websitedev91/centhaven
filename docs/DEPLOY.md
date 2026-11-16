# Deploying CentHaven to Hostinger (Cloud hosting)

The site is a static export (`out/`). GitHub Actions builds it on every push to `main` and uploads
it to `public_html` over FTPS (`.github/workflows/deploy.yml`). Only `live` tools are built.

## One-time setup

### 1. Hostinger: an FTP account for deploys
1. hPanel → **Websites** → centhaven.com → **Files → FTP Accounts**.
2. Note the **FTP IP / hostname** shown at the top.
3. Create an FTP account (e.g. `deploy@centhaven.com`) with a strong password.
   Set its directory to the site's `public_html`, or note which folder it opens in.
4. hPanel → **Security → SSL**: confirm the certificate for centhaven.com is **Active**.

### 2. GitHub: a private repo
From the project folder (Puru runs these; Claude never pushes):
```
git remote add origin https://github.com/<you>/centhaven.git
git push -u origin main
```
Create the repo on github.com first (private, no README).

### 3. GitHub: secrets
Repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Value |
|---|---|
| `FTP_HOST` | The FTP IP or hostname from hPanel |
| `FTP_USERNAME` | The FTP account, e.g. `deploy@centhaven.com` |
| `FTP_PASSWORD` | Its password |
| `FTP_REMOTE_DIR` | Path to the site root as the FTP account sees it: `public_html`, or `/` if the account already opens inside `public_html` |

**Careful:** the upload deletes files in that folder that aren't in `out/` (except `.well-known`).
If `FTP_REMOTE_DIR` points at the wrong folder, the wrong files get deleted. Check it in
hPanel → File Manager first. Hostinger's default `default.php` in `public_html` will be removed, which is intended.

## Every deploy
Push to `main` (or Actions tab → **Deploy to Hostinger** → **Run workflow**). The workflow:
1. `npm ci` → `npm run build` → `npm run check` → `npm run size`
2. refuses to deploy a preview build, a missing `.htaccess` or 404 page
3. uploads `/_next` assets, then the pages (with delete)
4. checks that key pages answer 200 and that a missing page answers 404

## After the first deploy
1. Open https://centhaven.com, a hub, a tool, an embed (`/embed/break-even-calculator`) and a missing page.
2. Check http://centhaven.com and https://www.centhaven.com redirect to https://centhaven.com.
3. Run PageSpeed Insights (mobile) on home, a hub, a tool and a static page: targets in DESIGN.md §10.
4. Google Search Console: add the domain property, then submit `https://centhaven.com/sitemap.xml`.
5. In Google Tag Manager, add the GA4 tag and custom-event triggers (see the analytics notes).

## Rolling back
Revert the bad commit on `main` and push; the workflow redeploys the previous version.
