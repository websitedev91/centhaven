import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parseRateFile, type RateFile } from './rates-schema';

/**
 * Build-time only (Node). Reads and validates every /rates/*.json file and checks
 * each one is listed in sources.md. Throws on the first problem so `next build` fails.
 */
export function validateAllRates(root: string = process.cwd()): RateFile[] {
  const dir = join(root, 'rates');
  if (!existsSync(dir)) return [];
  const sources = readFileSync(join(root, 'sources.md'), 'utf8');
  const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
  return files.map((file) => {
    const raw = readFileSync(join(dir, file), 'utf8');
    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch (e) {
      throw new Error(`Invalid rates file ${file}: not valid JSON (${(e as Error).message})`);
    }
    const parsed = parseRateFile(file, json);
    if (!sources.includes(`rates/${file}`)) {
      throw new Error(`rates/${file} is not listed in sources.md`);
    }
    if (!sources.includes(parsed.source.url)) {
      throw new Error(`sources.md does not list the source URL for rates/${file}: ${parsed.source.url}`);
    }
    return parsed;
  });
}
