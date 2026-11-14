'use client';

import { useId, useState, type FormEvent } from 'react';
import { FieldShell, describedBy, fieldClass } from './FieldShell';

const TOPICS = [
  'Report a mistake',
  'Suggest a new calculator',
  'Embedding a calculator',
  'Partnership or advertising',
  'Something else',
] as const;

type Errors = Partial<Record<'name' | 'email' | 'message', string>>;

export function buildMailto(to: string, f: { name: string; email: string; topic: string; message: string; page?: string }) {
  const subject = `[CentHaven] ${f.topic}`;
  const body = [
    f.message.trim(),
    '',
    '—',
    `Name: ${f.name.trim()}`,
    `Email: ${f.email.trim()}`,
    f.page ? `Page: ${f.page}` : '',
  ]
    .filter((l, i, a) => !(l === '' && i === a.length - 1))
    .join('\n');
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Enquiry form for a static site (no backend): on submit it opens the visitor's own email app
 * with the message pre-filled, addressed to `email`. Nothing is stored or sent by the site.
 */
export function ContactForm({ email }: { email: string }) {
  const id = useId();
  const [name, setName] = useState('');
  const [from, setFrom] = useState('');
  const [topic, setTopic] = useState<string>(TOPICS[0]);
  const [page, setPage] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [opened, setOpened] = useState(false);

  function validate(): Errors {
    const e: Errors = {};
    if (!name.trim()) e.name = 'Please enter your name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(from.trim())) e.email = 'Please enter a valid email address';
    if (message.trim().length < 10) e.message = 'Please write a little more (at least 10 characters)';
    return e;
  }

  function submit(ev: FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    window.location.href = buildMailto(email, { name, email: from, topic, message, page: page.trim() || undefined });
    setOpened(true);
  }

  const ids = { name: `${id}-name`, email: `${id}-email`, topic: `${id}-topic`, page: `${id}-page`, message: `${id}-message` };

  return (
    <form noValidate onSubmit={submit} className="max-w-xl rounded-card border border-line bg-bg p-5 shadow-sm sm:p-6" aria-label="Enquiry form">
      <div className="flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <FieldShell id={ids.name} label="Your name" error={errors.name}>
            <input
              id={ids.name}
              type="text"
              autoComplete="name"
              className={fieldClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={describedBy(ids.name, undefined, errors.name)}
            />
          </FieldShell>
          <FieldShell id={ids.email} label="Your email" error={errors.email}>
            <input
              id={ids.email}
              type="email"
              autoComplete="email"
              className={fieldClass}
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={describedBy(ids.email, undefined, errors.email)}
            />
          </FieldShell>
        </div>
        <FieldShell id={ids.topic} label="Topic">
          <select id={ids.topic} className={fieldClass} value={topic} onChange={(e) => setTopic(e.target.value)}>
            {TOPICS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </FieldShell>
        <FieldShell id={ids.page} label="Page or calculator (optional)" help="Paste the link if you're reporting a mistake.">
          <input
            id={ids.page}
            type="text"
            className={fieldClass}
            value={page}
            onChange={(e) => setPage(e.target.value)}
            aria-describedby={describedBy(ids.page, 'help')}
          />
        </FieldShell>
        <FieldShell id={ids.message} label="Message" error={errors.message}>
          <textarea
            id={ids.message}
            rows={6}
            className={fieldClass}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={describedBy(ids.message, undefined, errors.message)}
          />
        </FieldShell>
        <div>
          <button
            type="submit"
            className="rounded-field bg-primary px-5 py-2.5 font-semibold text-white hover:bg-primary-hover"
          >
            Send enquiry
          </button>
          <p className="mt-2 text-xs text-muted">
            This opens your email app with your message ready to send to {email}. We don&apos;t store anything you type
            here.
          </p>
          {opened ? (
            <p role="status" className="mt-3 text-sm font-semibold text-success">
              Your email app should now be open. If nothing happened, email us directly at{' '}
              <a href={`mailto:${email}`}>{email}</a>.
            </p>
          ) : null}
        </div>
      </div>
    </form>
  );
}
