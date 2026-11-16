import { getCategory } from '@/config/site';
import { getHub } from '@/lib/hubs';
import { ogImage } from '@/lib/og-image';
import { liveCategories, liveTools, liveToolsInCategory } from '@/lib/registry';

/**
 * Build-time share images (DAY-2 task 10): /og/home.png, /og/hub-<category>.png and
 * /og/tool-<slug>.png for every built hub and tool. Static export writes each as a real .png file.
 */
export const dynamic = 'force-static';
export const dynamicParams = false;

type Params = { file: string };

export function generateStaticParams(): Params[] {
  return [
    { file: 'home.png' },
    ...liveCategories().map((c) => ({ file: `hub-${c}.png` })),
    ...liveTools().map((t) => ({ file: `tool-${t.slug}.png` })),
  ];
}

const HOME = {
  title: 'Know your numbers before you decide.',
  subtitle: 'Free calculators for freelancers and anyone managing money. Every rate checked against official sources.',
};

export async function GET(_req: Request, { params }: { params: Promise<Params> }) {
  const name = (await params).file.replace(/\.png$/, '');

  if (name.startsWith('hub-')) {
    const slug = name.slice(4);
    const n = liveToolsInCategory(slug).length;
    return ogImage({
      // No kicker: the hub H1 already names the category.
      title: getHub(slug)?.h1 ?? 'CentHaven calculators',
      subtitle: `${n} free ${n === 1 ? 'calculator' : 'calculators'} with clear formulas and worked examples.`,
    });
  }

  if (name.startsWith('tool-')) {
    const tool = liveTools().find((t) => t.slug === name.slice(5));
    if (tool) return ogImage({ kicker: getCategory(tool.category)?.name, title: tool.meta.h1, subtitle: tool.meta.subtitle });
  }

  return ogImage(HOME);
}
