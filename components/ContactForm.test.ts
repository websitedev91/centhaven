import { describe, expect, it } from 'vitest';
import { buildMailto } from './ContactForm';

describe('buildMailto', () => {
  it('addresses the email and encodes subject and body', () => {
    const url = buildMailto('info@centhaven.com', {
      name: 'Asha',
      email: 'asha@example.com',
      topic: 'Report a mistake',
      message: 'Rate looks off & wrong?',
      page: 'https://centhaven.com/freelance/hourly-rate-calculator',
    });
    expect(url.startsWith('mailto:info@centhaven.com?subject=')).toBe(true);
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('subject')).toBe('[CentHaven] Report a mistake');
    const body = params.get('body') ?? '';
    expect(body).toContain('Rate looks off & wrong?');
    expect(body).toContain('Email: asha@example.com');
    expect(body).toContain('Page: https://centhaven.com/freelance/hourly-rate-calculator');
  });
});
