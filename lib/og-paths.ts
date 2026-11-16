/**
 * Share-image URLs. Images are built by app/og/[file]/route.tsx as real .png files, so a plain
 * static host (Hostinger) serves them with the right content type.
 */
export const OG_HOME = '/og/home.png';
export const ogHubPath = (category: string) => `/og/hub-${category}.png`;
export const ogToolPath = (slug: string) => `/og/tool-${slug}.png`;
