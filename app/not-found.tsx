import Link from 'next/link';

export const metadata = { title: 'Page not found | CentHaven', robots: { index: false } };

export default function NotFound() {
  return (
    <div className="wrap py-20">
      <h1 className="text-3xl">Page not found</h1>
      <p className="mt-3 text-ink-muted">We couldn&apos;t find that page. It may have moved.</p>
      <p className="mt-6">
        <Link href="/">Go to the home page</Link>
      </p>
    </div>
  );
}
