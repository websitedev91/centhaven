# Fonts for build-time OG images

`SchibstedGrotesk-Regular.ttf` (400) and `SchibstedGrotesk-Bold.ttf` (700): static instances of
Schibsted Grotesk from Google Fonts (fonts.gstatic.com, v7), downloaded 2026-11-16.

- Licence: SIL Open Font License 1.1 (https://openfontlicense.org). Free to bundle and redistribute.
- Used only by `lib/og-image.tsx` at build time. `next/og` needs TTF/OTF, and `next/font` only ships
  woff2, so the site's pages keep loading the font through `next/font` as before.
