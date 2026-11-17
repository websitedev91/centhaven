import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatMoney, formatPercent, roundTo, type CurrencyCode } from '@/lib/format';
import { parseQuery, toQuery } from '@/lib/url-state';
import { emergencyFund, NO_MONTHS, suggestedMonths, type EmergencyFundError, type EmergencyFundResult } from './calc';
import {
  effectiveMonths,
  emergencyDefaults,
  emergencySchema,
  emergencyVariant,
  fieldErrors,
  switchEmergencyCurrency,
  toCalcInput,
  type EmergencyState,
} from './schema';

function ok(r: EmergencyFundResult | EmergencyFundError): EmergencyFundResult {
  if (!r.ok) throw new Error(`expected a result, got: ${r.error}`);
  return r;
}
const r2 = (n: number) => roundTo(n, 2);

const CASES: { state: EmergencyState; currency: CurrencyCode }[] = [
  { state: { currency: 'USD', expenses: 3_000, incomeType: 'steady', dependants: 0, months: 0, saved: 2_000, monthlySaving: 500 }, currency: 'USD' },
  { state: { currency: 'INR', expenses: 50_000, incomeType: 'self-employed', dependants: 2, months: 0, saved: 100_000, monthlySaving: 20_000 }, currency: 'INR' },
  { state: { currency: 'GBP', expenses: 2_000, incomeType: 'variable', dependants: 0, months: 0, saved: 15_000, monthlySaving: 300 }, currency: 'GBP' },
];

describe('suggested months (rule of thumb approved by Puru)', () => {
  it('starts at 3 / 6 / 6 and adds one month per dependant, capped at 12', () => {
    expect(suggestedMonths('steady', 0)).toBe(3);
    expect(suggestedMonths('variable', 0)).toBe(6);
    expect(suggestedMonths('self-employed', 0)).toBe(6);
    expect(suggestedMonths('self-employed', 2)).toBe(8);
    expect(suggestedMonths('steady', 10)).toBe(12);
  });

  it("the user's own months override the suggestion", () => {
    expect(effectiveMonths({ months: 0, incomeType: 'steady', dependants: 1 })).toBe(4);
    expect(effectiveMonths({ months: 9, incomeType: 'steady', dependants: 1 })).toBe(9);
  });
});

describe('spec test cases', () => {
  it('#1 expenses 3,000 · steady · 0 dependants · saved 2,000 · saving 500', () => {
    expect(effectiveMonths(CASES[0]!.state)).toBe(3);
    const r = ok(emergencyFund(toCalcInput(CASES[0]!.state)));
    expect(r2(r.target)).toBe(9_000);
    expect(r2(r.shortfall)).toBe(7_000);
    expect(r.monthsToBuild).toBe(14);
    expect(roundTo(r.progress! * 100, 2)).toBe(22.22);
  });

  it('#2 expenses 50,000 · self-employed · 2 dependants · saved 1,00,000 · saving 20,000', () => {
    expect(effectiveMonths(CASES[1]!.state)).toBe(8);
    const r = ok(emergencyFund(toCalcInput(CASES[1]!.state)));
    expect(r2(r.target)).toBe(400_000);
    expect(r2(r.shortfall)).toBe(300_000);
    expect(r.monthsToBuild).toBe(15);
    expect(roundTo(r.progress! * 100, 2)).toBe(25);
  });

  it('#3 expenses 2,000 · variable · 0 dependants · saved 15,000 → covered', () => {
    expect(effectiveMonths(CASES[2]!.state)).toBe(6);
    const r = ok(emergencyFund(toCalcInput(CASES[2]!.state)));
    expect(r2(r.target)).toBe(12_000);
    expect(r2(r.shortfall)).toBe(0);
    expect(r.monthsToBuild).toBe(0);
    expect(r2(r.surplus)).toBe(3_000);
    expect(roundTo(r.progress! * 100, 2)).toBe(125);
  });

  it('#4 shortfall with no monthly saving: target shown, months to build null, no crash', () => {
    const r = ok(emergencyFund({ expenses: 3_000, months: 3, saved: 0, monthlySaving: 0 }));
    expect(r2(r.target)).toBe(9_000);
    expect(r.monthsToBuild).toBeNull();
  });
});

describe('other checks', () => {
  it('zero expenses: target 0, progress null, no divide by zero', () => {
    const r = ok(emergencyFund({ expenses: 0, months: 3, saved: 100, monthlySaving: 0 }));
    expect(r.target).toBe(0);
    expect(r.progress).toBeNull();
    expect(r.monthsToBuild).toBe(0);
  });

  it('guards zero months and validates ranges', () => {
    expect(emergencyFund({ expenses: 1, months: 0, saved: 0, monthlySaving: 0 })).toEqual({ ok: false, error: NO_MONTHS });
    expect(fieldErrors(emergencySchema, { ...emergencyDefaults, dependants: 1.5, months: 25, saved: -1 })).toEqual({
      dependants: 'Use a whole number',
      months: 'Maximum is 24 months',
      saved: 'Savings can’t be negative',
    });
  });
});

describe('currency-dependent defaults', () => {
  const usd = emergencyDefaults;

  it.each([
    ['CAD', 3_000, 2_000, 500],
    ['AUD', 3_000, 2_000, 500],
    ['GBP', 2_000, 1_500, 300],
    ['EUR', 2_000, 1_500, 300],
    ['INR', 50_000, 100_000, 20_000],
  ] as const)('untouched amounts switch to %s defaults', (cur, expenses, saved, monthlySaving) => {
    const next = switchEmergencyCurrency(usd, cur);
    expect(next).toEqual({ ...usd, currency: cur, expenses, saved, monthlySaving });
    expect(emergencySchema.safeParse(next).success).toBe(true);
  });

  it('keeps typed values and never changes income type, dependants or months', () => {
    const typed = { ...usd, expenses: 4_200, incomeType: 'variable' as const, dependants: 2, months: 9 };
    expect(switchEmergencyCurrency(typed, 'INR')).toEqual({ ...typed, currency: 'INR', saved: 100_000, monthlySaving: 20_000 });
  });

  it('share links stay short and restore the currency defaults', () => {
    const inr = switchEmergencyCurrency(usd, 'INR');
    expect(toQuery(inr, usd, emergencyVariant)).toBe('?currency=INR');
    expect(parseQuery('?currency=INR&incomeType=self-employed', emergencySchema, usd, emergencyVariant)).toEqual({
      ...inr,
      incomeType: 'self-employed',
    });
  });
});

describe('content.mdx', () => {
  const mdx = readFileSync(join(__dirname, 'content.mdx'), 'utf8');

  it.each(CASES)('$currency worked example matches the calculator', ({ state, currency }) => {
    const r = ok(emergencyFund(toCalcInput(state)));
    const texts = [`**${formatMoney(r.target, currency)}**`, `**${formatMoney(r.shortfall, currency)}**`, `**${formatPercent(r.progress!, 2)}**`];
    if (r.monthsToBuild) texts.push(`**${r.monthsToBuild} months**`);
    if (r.surplus > 0) texts.push(`**${formatMoney(r.surplus, currency)}**`);
    for (const text of texts) expect(mdx, `content.mdx should contain "${text}"`).toContain(text);
  });

  it('labels the months as "a common rule of thumb, not a rule" and never cites an official body', () => {
    expect(mdx).toContain('a common rule of thumb, not a rule');
    expect(mdx).not.toMatch(/\b(recommended by|according to|official guidance|experts say|financial experts)\b/i);
  });

  it('the $700/month aside in example 1 is right', () => {
    expect(ok(emergencyFund({ expenses: 3_000, months: 3, saved: 2_000, monthlySaving: 700 })).monthsToBuild).toBe(10);
  });
});
