/**
 * Client notice for a rate increase (review C8). Pure string builder: the UI passes amounts
 * already formatted (lib/format.ts) and the date already formatted (lib/dates.ts), so there is
 * no date or locale logic here.
 */
export const DATE_PLACEHOLDER = '[effective date]';

export function clientNotice(opts: { oldRate: string; newRate: string; effectiveDate?: string }): string {
  const date = opts.effectiveDate || DATE_PLACEHOLDER;
  return [
    'Hi [client name],',
    '',
    `I'm writing to let you know that my hourly rate will change from ${opts.oldRate} to ${opts.newRate}, starting ${date}.`,
    '',
    'Any work we have already agreed before that date will stay at my current rate. If you have any questions, I am happy to talk them through.',
    '',
    'Thank you for working with me. I look forward to continuing.',
    '',
    'Best regards,',
    '[your name]',
  ].join('\n');
}
