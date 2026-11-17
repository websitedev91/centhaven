'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useId, useRef, useState } from 'react';
import { ChevronRightIcon, SearchIcon } from '@/components/icons';
import { searchTools, type SearchItem } from '@/lib/nav-search';

/**
 * Homepage search (user-friendly entry point): results appear as you type, arrow keys move,
 * Enter opens the highlighted calculator. Data comes from the server (live tools only).
 */
export function HomeSearch({ items }: { items: SearchItem[] }) {
  const router = useRouter();
  const id = useId();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const results = query.trim() ? searchTools(items, query, 6) : [];
  const showList = open && query.trim().length > 0;

  return (
    <div
      ref={wrap}
      className="relative"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <label htmlFor={`${id}-input`} className="sr-only">
        Search calculators
      </label>
      <div className="flex h-14 items-center gap-3 rounded-panel border border-line bg-surface pl-4 pr-2 focus-within:border-haven focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-haven">
        <SearchIcon className="shrink-0 text-ink-muted" />
        <input
          id={`${id}-input`}
          type="search"
          role="combobox"
          aria-expanded={showList}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-activedescendant={showList && results[active] ? `${id}-opt-${active}` : undefined}
          autoComplete="off"
          placeholder="What do you want to work out?"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, results.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === 'Enter' && results[active]) {
              e.preventDefault();
              router.push(results[active].href);
            } else if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
          className="h-full min-w-0 flex-1 bg-transparent text-[17px] text-ink outline-none placeholder:text-ink-muted"
        />
      </div>

      {showList ? (
        <ul
          id={`${id}-list`}
          role="listbox"
          aria-label="Matching calculators"
          className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-panel border border-line bg-surface p-2 shadow-[0_16px_32px_-12px_rgba(18,48,43,0.18)]"
        >
          {results.length === 0 ? (
            <li className="type-small px-3 py-4 text-ink-muted">
              No calculator matches &ldquo;{query}&rdquo; yet. Try &ldquo;rate&rdquo;, &ldquo;salary&rdquo; or &ldquo;savings&rdquo;.
            </li>
          ) : (
            results.map((r, i) => (
              <li key={r.href} id={`${id}-opt-${i}`} role="option" aria-selected={i === active}>
                <Link
                  href={r.href}
                  tabIndex={-1}
                  onMouseEnter={() => setActive(i)}
                  className={`flex items-center justify-between gap-4 rounded-field px-3 py-2.5 text-ink no-underline ${i === active ? 'bg-mint' : ''}`}
                >
                  <span className="min-w-0">
                    <span className="block text-[15px] font-[550]">{r.title}</span>
                    <span className="type-small block text-ink-muted">{r.category}</span>
                  </span>
                  <ChevronRightIcon size={16} className="shrink-0 text-ink-muted" />
                </Link>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
