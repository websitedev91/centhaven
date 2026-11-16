import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { embedCode } from './EmbedCodeBox';

describe('embed code', () => {
  it('points at the /embed/[slug] route, which exists', () => {
    const code = embedCode('hourly-rate-calculator', 'Freelance Hourly Rate Calculator');
    expect(code).toContain('src="https://centhaven.com/embed/hourly-rate-calculator"');
    expect(code).toContain('title="Freelance Hourly Rate Calculator by CentHaven"');
    expect(code).toContain('loading="lazy"');
    expect(existsSync(join(process.cwd(), 'app', '(embed)', 'embed', '[slug]', 'page.tsx'))).toBe(true);
  });
});
