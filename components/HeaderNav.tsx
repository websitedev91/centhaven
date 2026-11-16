'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import type { NavCategory } from '@/lib/nav';
import { searchTools, type NavTool, type SearchItem } from '@/lib/nav-search';
import { ChevronDownIcon, CloseIcon, MenuIcon, SearchIcon } from './icons';

/* ------------------------------------------------------------------ frame */

/** Sticky 68px bar that gains a bottom border once the page is scrolled (DESIGN.md §6). */
export function HeaderFrame({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 4);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return (
    <header
      className={`no-print sticky top-0 z-40 border-b bg-surface transition-colors ${scrolled ? 'border-line' : 'border-transparent'}`}
    >
      {children}
    </header>
  );
}

/* ------------------------------------------------------------- mega-menu */

/** "Calculators ▾": one column per live category, up to 6 tools each. Esc / outside click closes. */
export function CalculatorsMenu({ categories }: { categories: NavCategory[] }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        button.current?.focus();
      }
    };
    const onDown = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
    };
  }, [open]);

  if (categories.length === 0) return null;

  return (
    <div
      ref={wrap}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
        className={`inline-flex h-10 items-center gap-1 rounded-field px-3 text-[15px] font-[550] hover:text-haven ${open ? 'text-haven' : 'text-ink'}`}
      >
        Calculators
        <ChevronDownIcon size={16} className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div
        id={panelId}
        hidden={!open}
        className="absolute inset-x-0 top-full border-y border-line bg-surface shadow-[0_16px_32px_-12px_rgba(18,48,43,0.18)]"
      >
        <div className="wrap grid gap-x-12 gap-y-8 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <div key={c.slug}>
              <p className="type-small font-[550] text-ink-muted">{c.name}</p>
              <ul className="mt-3 flex flex-col gap-1">
                {c.tools.map((t) => (
                  <li key={t.href}>
                    <Link href={t.href} onClick={() => setOpen(false)} className="block py-1 text-[15px] text-ink no-underline hover:text-haven">
                      {t.title}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={c.href}
                onClick={() => setOpen(false)}
                className="mt-3 inline-block text-[15px] font-[550] text-haven no-underline hover:underline"
              >
                All {c.name.toLowerCase()} calculators
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- search */

const subscribeNoop = () => () => {};
const isMac = () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

/** ⌘K / Ctrl+K command palette over live tool titles and keywords (DESIGN.md §6). */
export function SearchLauncher({ items, compact = false }: { items: SearchItem[]; compact?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const mac = useSyncExternalStore(subscribeNoop, isMac, () => false);
  const results = searchTools(items, query);

  function openDialog() {
    setQuery('');
    setActive(0);
    dialog.current?.showModal();
    input.current?.focus();
  }

  useEffect(() => {
    if (compact) return; // one global shortcut listener (the desktop launcher)
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (dialog.current?.open) dialog.current.close();
        else openDialog();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [compact]);

  function go(t: NavTool) {
    dialog.current?.close();
    router.push(t.href);
  }

  return (
    <>
      {compact ? (
        <button
          type="button"
          onClick={openDialog}
          className="inline-flex h-11 w-11 items-center justify-center rounded-field text-ink hover:text-haven"
          aria-label="Search calculators"
        >
          <SearchIcon />
        </button>
      ) : (
        <button
          type="button"
          onClick={openDialog}
          className="inline-flex h-10 min-w-48 items-center gap-2 rounded-field border border-line bg-surface pl-3 pr-2 text-[15px] text-ink-muted hover:border-haven hover:text-ink"
        >
          <SearchIcon size={18} />
          <span className="flex-1 text-left">Search</span>
          <kbd className="rounded-[4px] border border-line px-1.5 font-sans text-[12px] leading-5 text-ink-muted">
            {mac ? '⌘K' : 'Ctrl K'}
          </kbd>
        </button>
      )}

      <dialog
        ref={dialog}
        aria-label="Search calculators"
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
        className="mx-auto mt-[10vh] w-[min(640px,calc(100vw-32px))] rounded-panel border border-line bg-surface p-0 text-ink shadow-[0_24px_48px_-16px_rgba(18,48,43,0.28)] backdrop:bg-ink/30"
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <SearchIcon className="shrink-0 text-ink-muted" />
          <input
            ref={input}
            type="search"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls={listId}
            aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
            aria-autocomplete="list"
            aria-label="Search calculators"
            placeholder="Search calculators"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, results.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === 'Enter' && results[active]) {
                e.preventDefault();
                go(results[active]);
              }
            }}
            className="h-14 flex-1 bg-transparent text-[17px] outline-none placeholder:text-ink-muted"
          />
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            className="type-small rounded-[4px] border border-line px-1.5 text-ink-muted hover:text-ink"
          >
            Esc
          </button>
        </div>
        <ul id={listId} role="listbox" aria-label="Calculators" className="max-h-[50vh] overflow-y-auto p-2">
          {items.length === 0 ? (
            <li className="type-small px-3 py-6 text-ink-muted">Our first calculators are almost ready. Check back soon.</li>
          ) : results.length === 0 ? (
            <li className="type-small px-3 py-6 text-ink-muted">No calculators match &ldquo;{query}&rdquo;.</li>
          ) : (
            results.map((r, i) => (
              <li
                key={r.href}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(r)}
                className={`flex cursor-pointer items-baseline justify-between gap-4 rounded-field px-3 py-2.5 ${i === active ? 'bg-mint' : ''}`}
              >
                <span className="text-[15px] font-[550]">{r.title}</span>
                <span className="type-small shrink-0 text-ink-muted">{r.category}</span>
              </li>
            ))
          )}
        </ul>
      </dialog>
    </>
  );
}

/* ----------------------------------------------------------- mobile menu */

/** Full-height sheet with categories as an accordion (DESIGN.md §6). Native modal dialog: traps focus, Esc closes. */
export function MobileMenu({ categories, links }: { categories: NavCategory[]; links: { href: string; label: string }[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const close = () => dialog.current?.close();

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className="inline-flex h-11 w-11 items-center justify-center rounded-field text-ink hover:text-haven"
        aria-label="Open menu"
      >
        <MenuIcon />
      </button>
      <dialog
        ref={dialog}
        aria-label="Menu"
        className="m-0 ml-auto h-dvh max-h-none w-full max-w-sm bg-surface p-0 text-ink shadow-[0_0_48px_rgba(18,48,43,0.24)] backdrop:bg-ink/30"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div className="flex h-[68px] items-center justify-between border-b border-line px-4">
          <span className="text-[17px] font-bold">Menu</span>
          <button
            type="button"
            onClick={close}
            className="inline-flex h-11 w-11 items-center justify-center rounded-field hover:text-haven"
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
        </div>
        <nav aria-label="Mobile" className="px-4 pb-8">
          {categories.length > 0 ? (
            <>
              <p className="type-small pb-2 pt-6 font-[550] text-ink-muted">Calculators</p>
              <div className="border-t border-line">
                {categories.map((c) => (
                  <details key={c.slug} className="group border-b border-line [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex h-14 cursor-pointer list-none items-center justify-between text-[17px] font-[550]">
                      {c.name}
                      <ChevronDownIcon className="transition-transform duration-150 group-open:rotate-180" />
                    </summary>
                    <ul className="pb-4">
                      {c.tools.map((t) => (
                        <li key={t.href}>
                          <Link href={t.href} onClick={close} className="block py-2 text-ink no-underline hover:text-haven">
                            {t.title}
                          </Link>
                        </li>
                      ))}
                      <li>
                        <Link href={c.href} onClick={close} className="block py-2 font-[550] text-haven no-underline">
                          All {c.name.toLowerCase()} calculators
                        </Link>
                      </li>
                    </ul>
                  </details>
                ))}
              </div>
            </>
          ) : null}
          <ul className="mt-6">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={close} className="flex h-12 items-center text-[17px] text-ink no-underline hover:text-haven">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </dialog>
    </>
  );
}
