'use client';

import { useState } from 'react';
import { track } from '@/lib/analytics';
import { actionButtonClass } from './actionButtonClass';
import { CheckIcon, LinkIcon } from './icons';

/** Copies the current URL (calculator state lives in the query string). */
export function ShareButton({ toolSlug, title }: { toolSlug: string; title: string }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

  async function share() {
    track('share_click', { tool: toolSlug });
    const url = window.location.href;
    try {
      if (navigator.share && window.matchMedia('(pointer: coarse)').matches) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setStatus('copied');
    } catch (e) {
      if ((e as DOMException)?.name === 'AbortError') return;
      setStatus('failed');
    }
    setTimeout(() => setStatus('idle'), 2500);
  }

  return (
    <button type="button" onClick={share} className={actionButtonClass}>
      {status === 'copied' ? <CheckIcon className="text-haven" /> : <LinkIcon />}
      <span aria-live="polite">
        {status === 'copied' ? 'Link copied' : status === 'failed' ? 'Copy failed' : 'Copy share link'}
      </span>
    </button>
  );
}
