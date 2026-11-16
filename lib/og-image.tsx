import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { site } from '@/config/site';

/**
 * Shared Open Graph image (1200×630), rendered at build time with next/og (no extra package).
 * Brand per DESIGN.md: paper background, ink text, the cent mark, one brass underline.
 */
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

const PAPER = '#F6F8F7';
const INK = '#12302B';
const INK_MUTED = '#4F6661';
const HAVEN = '#0F766E';
const BRASS = '#B8862B';
const LINE = '#D7E2DE';

const font = (file: string) => readFileSync(join(process.cwd(), 'assets', 'fonts', file));

export function ogImage(opts: { kicker?: string; title: string; subtitle?: string }) {
  const { kicker, title, subtitle } = opts;
  // Smaller titles when there's a subtitle, so the three blocks never collide.
  const titleSize = title.length > 40 ? 56 : title.length > 18 && subtitle ? 68 : title.length > 26 ? 76 : 84;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: PAPER,
          padding: '56px 80px',
          fontFamily: 'Schibsted Grotesk',
          color: INK,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <svg width="56" height="56" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="8" fill={HAVEN} />
            <path d="M20.4 11.6a6 6 0 1 0 0 8.8M16.8 7.5v17" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
          </svg>
          <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em' }}>{site.name}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {kicker ? <div style={{ fontSize: 28, color: INK_MUTED, marginBottom: 12 }}>{kicker}</div> : null}
          <div
            style={{
              display: 'flex',
              fontSize: titleSize,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: '-0.025em',
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
          <div style={{ display: 'flex', width: 160, height: 6, background: BRASS, marginTop: 24 }} />
          {subtitle ? (
            <div style={{ display: 'flex', fontSize: 28, lineHeight: 1.35, color: INK_MUTED, marginTop: 24, maxWidth: 980 }}>
              {subtitle}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderTop: `2px solid ${LINE}`,
            paddingTop: 24,
            fontSize: 26,
            color: INK_MUTED,
          }}
        >
          <div>{site.domain}</div>
          <div>{site.tagline}</div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: 'Schibsted Grotesk', data: font('SchibstedGrotesk-Regular.ttf'), weight: 400, style: 'normal' },
        { name: 'Schibsted Grotesk', data: font('SchibstedGrotesk-Bold.ttf'), weight: 700, style: 'normal' },
      ],
    },
  );
}
