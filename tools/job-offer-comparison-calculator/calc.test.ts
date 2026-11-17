import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatMoney, roundTo, type CurrencyCode } from '@/lib/format';
import { parseQuery, toQuery } from '@/lib/url-state';
import { compareOffers, TOO_MUCH_LEAVE, type CompareError, type CompareResult, type OfferInput } from './calc';
import {
  fieldErrors,
  jobOfferDefaults,
  jobOfferSchema,
  jobOfferVariant,
  switchJobOfferCurrency,
  toOfferInput,
} from './schema';

function ok(r: CompareResult | CompareError): CompareResult {
  if (!r.ok) throw new Error(`expected a result, got: ${r.error}`);
  return r;
}
const r2 = (n: number) => roundTo(n, 2);

const US_A: OfferInput = { salary: 85_000, bonus: 0.05, match: 0.04, benefits: 6_000, leaveDays: 25, hoursPerWeek: 40, officeDays: 1, commuteMins: 30, commuteCost: 15 };
const US_B: OfferInput = { salary: 92_000, bonus: 0, match: 0.03, benefits: 3_000, leaveDays: 20, hoursPerWeek: 40, officeDays: 5, commuteMins: 50, commuteCost: 15 };
const IN_A: OfferInput = { salary: 1_200_000, bonus: 0.1, match: 0.12, benefits: 50_000, leaveDays: 30, hoursPerWeek: 45, officeDays: 5, commuteMins: 60, commuteCost: 300 };
const IN_B: OfferInput = { salary: 1_400_000, bonus: 0, match: 0, benefits: 0, leaveDays: 20, hoursPerWeek: 45, officeDays: 0, commuteMins: 0, commuteCost: 0 };

const CASES: { a: OfferInput; b: OfferInput; timeValue: number; currency: CurrencyCode }[] = [
  { a: US_A, b: US_B, timeValue: 0, currency: 'USD' },
  { a: US_A, b: US_B, timeValue: 20, currency: 'USD' },
  { a: IN_A, b: IN_B, timeValue: 0, currency: 'INR' },
];

describe('spec test cases', () => {
  it('#1 USD defaults, time value 0 → A worth 3,785.00 more', () => {
    const { a, b, difference, winner } = ok(compareOffers(US_A, US_B, 0));
    expect([a.workDays, a.officeDaysYear, a.commuteHours, a.commuteCost, a.totalPay, a.yearlyValue, a.workHours].map(r2)).toEqual([
      235, 47, 47, 705, 98_650, 97_945, 1_880,
    ]);
    expect(r2(a.effectiveHourly)).toBe(50.83);
    expect([b.workDays, b.commuteHours, b.commuteCost, b.totalPay, b.yearlyValue, b.workHours].map(r2)).toEqual([
      240, 400, 3_600, 97_760, 94_160, 1_920,
    ]);
    expect(r2(b.effectiveHourly)).toBe(40.59);
    expect(r2(difference)).toBe(3_785);
    expect(winner).toBe('a');
  });

  it('#2 + time value 20 → A 97,005.00, B 86,160.00, A worth 10,845.00 more; hourly unchanged', () => {
    const { a, b, difference, winner } = ok(compareOffers(US_A, US_B, 20));
    expect([a.timeCost, a.yearlyValue, b.timeCost, b.yearlyValue, difference].map(r2)).toEqual([940, 97_005, 8_000, 86_160, 10_845]);
    expect([r2(a.effectiveHourly), r2(b.effectiveHourly)]).toEqual([50.83, 40.59]);
    expect(winner).toBe('a');
  });

  it('#3 INR: A worth 45,000.00 more, but B pays more per hour', () => {
    const { a, b, difference, winner } = ok(compareOffers(IN_A, IN_B, 0));
    expect([a.totalPay, a.commuteHours, a.commuteCost, a.yearlyValue].map(r2)).toEqual([1_514_000, 460, 69_000, 1_445_000]);
    expect(r2(a.effectiveHourly)).toBe(571.15);
    expect(r2(b.yearlyValue)).toBe(1_400_000);
    expect(r2(b.effectiveHourly)).toBe(648.15);
    expect(r2(difference)).toBe(45_000);
    expect(winner).toBe('a');
  });

  it('#4 identical offers → tie, difference 0', () => {
    const r = ok(compareOffers(US_A, { ...US_A }, 20));
    expect(r.winner).toBe('tie');
    expect(r.difference).toBe(0);
  });

  it('#5 remote (0 office days): no commute hours, cost or time cost', () => {
    const { a } = ok(compareOffers({ ...US_A, officeDays: 0, commuteMins: 90, commuteCost: 50 }, US_B, 20));
    expect([a.commuteHours, a.commuteCost, a.timeCost]).toEqual([0, 0, 0]);
    expect(r2(a.yearlyValue)).toBe(98_650);
  });

  it('#6 leave 260 days → error, no Infinity/NaN', () => {
    expect(compareOffers({ ...US_A, leaveDays: 260 }, US_B, 0)).toEqual({ ok: false, error: TOO_MUCH_LEAVE });
    expect(fieldErrors(jobOfferSchema, { ...jobOfferDefaults, aLeave: 260 })).toEqual({ aLeave: 'Maximum is 259 days' });
  });

  it('B ahead → winner b with a negative difference', () => {
    const r = ok(compareOffers(US_B, US_A, 0));
    expect(r.winner).toBe('b');
    expect(r2(r.difference)).toBe(-3_785);
  });
});

describe('schema', () => {
  it('USD defaults convert to spec case #1', () => {
    expect(toOfferInput(jobOfferDefaults, 'a')).toEqual(US_A);
    expect(toOfferInput(jobOfferDefaults, 'b')).toEqual(US_B);
  });

  it('validates ranges', () => {
    expect(fieldErrors(jobOfferSchema, { ...jobOfferDefaults, aOffice: 6, bOffice: 2.5, bHours: 0, aSalary: -1 })).toEqual({
      aOffice: 'Maximum is 5 days',
      bOffice: 'Use a whole number',
      bHours: 'Minimum is 1 hours',
      aSalary: 'Can’t be negative',
    });
  });
});

describe('currency-dependent defaults', () => {
  const usd = jobOfferDefaults;

  it.each([
    ['CAD', 80_000, 86_000, 5_000, 2_500, 15],
    ['AUD', 95_000, 102_000, 5_000, 2_500, 15],
    ['GBP', 45_000, 49_000, 3_000, 1_500, 12],
    ['EUR', 50_000, 54_000, 3_000, 1_500, 10],
    ['INR', 1_200_000, 1_300_000, 50_000, 25_000, 150],
  ] as const)('untouched money fields switch to the %s defaults', (cur, aSalary, bSalary, aBenefits, bBenefits, cost) => {
    expect(switchJobOfferCurrency(usd, cur)).toEqual({ ...usd, currency: cur, aSalary, bSalary, aBenefits, bBenefits, aCost: cost, bCost: cost });
  });

  it('keeps typed values and never changes percentages, hours, days or minutes', () => {
    const typed = { ...usd, aSalary: 90_000, bCost: 20, aBonus: 8, bMins: 25 };
    const inr = switchJobOfferCurrency(typed, 'INR');
    expect(inr).toMatchObject({ currency: 'INR', aSalary: 90_000, bCost: 20, aBonus: 8, bMins: 25, bSalary: 1_300_000, aCost: 150 });
  });

  it('share links stay short and restore the currency defaults', () => {
    const inr = switchJobOfferCurrency(usd, 'INR');
    expect(toQuery(inr, usd, jobOfferVariant)).toBe('?currency=INR');
    expect(parseQuery('?currency=INR&bOffice=3', jobOfferSchema, usd, jobOfferVariant)).toEqual({ ...inr, bOffice: 3 });
  });
});

describe('content.mdx worked examples match the calculator', () => {
  const mdx = readFileSync(join(__dirname, 'content.mdx'), 'utf8');
  it.each(CASES)('$currency example (time value $timeValue)', ({ a, b, timeValue, currency }) => {
    const r = ok(compareOffers(a, b, timeValue));
    for (const n of [r.a.yearlyValue, r.b.yearlyValue, Math.abs(r.difference)]) {
      const text = `**${formatMoney(n, currency)}**`;
      expect(mdx, `content.mdx should contain "${text}"`).toContain(text);
    }
  });

  it('the Indian example: valuing time at ₹100 an hour puts Offer B ahead (break-even ≈ ₹97.83)', () => {
    expect(mdx).toContain('₹100 an hour or more, Offer B comes out ahead');
    expect(ok(compareOffers(IN_A, IN_B, 100)).winner).toBe('b');
    expect(ok(compareOffers(IN_A, IN_B, 97)).winner).toBe('a');
  });
});
