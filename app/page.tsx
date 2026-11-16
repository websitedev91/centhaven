import { site } from '@/config/site';

// Placeholder home page. The full home page is Day 2 work (PRD §13).
export default function Home() {
  return (
    <div className="wrap py-16">
      <h1 className="text-3xl sm:text-4xl">{site.name}</h1>
      <p className="mt-3 text-lg text-ink-muted">{site.tagline}</p>
    </div>
  );
}
