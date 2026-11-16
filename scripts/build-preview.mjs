// `npm run build:preview`: a local-only build where draft/ready tools are treated as live,
// so they can be viewed and screenshotted (`npm start`). Registry statuses never change.
// postbuild writes out/PREVIEW-BUILD-DO-NOT-DEPLOY.txt and exits 2 for these builds.
import { spawnSync } from 'node:child_process';

const env = { ...process.env, PREVIEW_DRAFTS: '1' };
const run = (cmd) => spawnSync(cmd, { stdio: 'inherit', shell: true, env }).status ?? 1;

const build = run('npx next build');
if (build !== 0) process.exit(build);
const post = run('node scripts/postbuild.mjs');
process.exit(post === 2 ? 0 : post || 1);
