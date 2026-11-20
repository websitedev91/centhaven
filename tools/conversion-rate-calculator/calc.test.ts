import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatMoney, type CurrencyCode } from '@/lib/format';
import { formatConversions } from '@/tools/cpc-calculator/calc';
import { formatPct } from '@/tools/margin-vs-markup-calculator/calc';
import { conversionRate, formatVisitors, formatVisitorsEach } from './calc';
import { conversionDefaults, conversionErrors, planBErrors, switchConversionCurrency, toCalcInput, type ConversionState } from './schema';

const m = (n: number, c: CurrencyCode = 'USD') => formatMoney(n, c);
const run = (patch: Partial<ConversionState>) => conversionRate(toCalcInput({ ...conversionDefaults, ...patch }));

describe('spec test cases', () => {
  it('#1 150 ÷ 5,000 at 50 → 3%, about 33.3 visitors each, revenue 7,500.00, 1.50 per visitor', () => {
    const r = run({ mode: 'rate', visits: 5_000, conv: 150, value: 50 });
    expect(formatPct(r.rate)).toBe('3%');
    expect(formatVisitorsEach(r.visitorsPerConversion!)).toBe('about 33.3 visitors');
    expect(m(r.revenue!)).toBe('$7,500.00');
    expect(m(r.revenuePerVisitor!)).toBe('$1.50');
  });

  it('#2 37 ÷ 1,200 with no value → 3.08%, revenue off', () => {
    const r = run({ mode: 'rate', visits: 1_200, conv: 37, value: 0 });
    expect(formatPct(r.rate)).toBe('3.08%');
    expect(r.revenue).toBeNull();
  });

  it('#3 conversions: 5,000 at 4% → 200 conversions, 10,000.00, 2.00 per visitor', () => {
    const r = run({ mode: 'conversions', visits: 5_000, target: 4, value: 50 });
    expect(formatConversions(r.conversions)).toBe('200 conversions');
    expect(m(r.revenue!)).toBe('$10,000.00');
    expect(m(r.revenuePerVisitor!)).toBe('$2.00');
  });

  it('#4 conversions: 3,317 at 3% → about 99.51 conversions (on average)', () => {
    expect(formatConversions(run({ mode: 'conversions', visits: 3_317, target: 3 }).conversions)).toBe('about 99.51 conversions (on average)');
  });

  it('#5 visitors: goal 200 at 3% → 6,667 visitors (rounded up)', () => {
    const r = run({ mode: 'visitors', goal: 200, target: 3 });
    expect(formatVisitors(r.visitors)).toBe('6,667 visitors');
    expect(r.revenuePerVisitor).toBeNull();
  });

  it('#6 INR, typed 90 ÷ 3,000 at ₹2,000 → 3%, ₹1,80,000.00, ₹60.00 per visitor', () => {
    const r = run({ mode: 'rate', currency: 'INR', visits: 3_000, conv: 90, value: 2_000 });
    expect(formatPct(r.rate)).toBe('3%');
    expect(m(r.revenue!, 'INR')).toBe('₹1,80,000.00');
    expect(m(r.revenuePerVisitor!, 'INR')).toBe('₹60.00');
  });

  it('#6b INR defaults (Puru, 2026-11-20): 150 ÷ 5,000 at ₹2,000 → ₹3,00,000.00, ₹60.00 per visitor', () => {
    const inr = switchConversionCurrency(conversionDefaults, 'INR');
    expect([inr.visits, inr.conv, inr.value]).toEqual([5_000, 150, 2_000]);
    const r = conversionRate(toCalcInput(inr));
    expect(formatPct(r.rate)).toBe('3%');
    expect(m(r.revenue!, 'INR')).toBe('₹3,00,000.00');
    expect(m(r.revenuePerVisitor!, 'INR')).toBe('₹60.00');
  });

  it('#7 0 conversions → 0%, no visitors-per-conversion (no ÷ 0)', () => {
    const r = run({ mode: 'rate', conv: 0 });
    expect(formatPct(r.rate)).toBe('0%');
    expect(r.visitorsPerConversion).toBeNull();
  });

  it('#8 USD → INR without editing: value 50 → 2,000, counts and rates stay; a typed value is kept', () => {
    const i = switchConversionCurrency(conversionDefaults, 'INR');
    expect([i.value, i.visits, i.conv, i.target, i.goal]).toEqual([2_000, 5_000, 150, 4, 200]);
    expect(switchConversionCurrency({ ...conversionDefaults, value: 75 }, 'INR').value).toBe(75);
    expect(switchConversionCurrency(conversionDefaults, 'INR', new Set(['value'])).value).toBe(50);
  });
});

describe('edge cases', () => {
  const errs = (patch: Partial<ConversionState>) => conversionErrors({ ...conversionDefaults, ...patch });

  it('visitors 0 / decimal, conversions above visitors → field errors', () => {
    expect(errs({ visits: 0 }).visits).toBe('Enter at least 1 visitor');
    expect(errs({ visits: 10.5 }).visits).toBe('Enter a whole number');
    expect(errs({ conv: 6_000 }).conv).toBe('Conversions can’t be more than visitors');
    expect(planBErrors({ visits: 10, conv: 11 }).conv).toBe('Conversions can’t be more than visitors');
  });

  it('target 0 / over 100 / negative → field errors; hidden boxes never block', () => {
    expect(errs({ mode: 'conversions', target: 0 }).target).toBe('Enter a rate above 0');
    expect(errs({ mode: 'visitors', target: 101 }).target).toBe('Maximum is 100%');
    expect(errs({ mode: 'visitors', target: -1 }).target).toBe('Can’t be negative');
    expect(errs({ mode: 'rate', target: 0, goal: Number.NaN })).toEqual({});
    expect(errs({ mode: 'visitors', visits: 0, conv: Number.NaN })).toEqual({});
  });

  it('huge values stay finite', () => {
    const r = run({ mode: 'visitors', goal: 1_000_000_000, target: 0.01, value: 10_000_000 });
    expect(formatVisitors(r.visitors)).toBe('10,000,000,000,000 visitors');
    expect(m(r.revenue!)).not.toMatch(/e\+|NaN|Infinity/);
  });
});

describe('content.mdx worked examples match the calculator', () => {
  const mdx = readFileSync(join(__dirname, 'content.mdx'), 'utf8');
  const has = (t: string) => expect(mdx, `content.mdx should contain "${t}"`).toContain(t);

  it('cases 1, 3, 5 and the INR case', () => {
    const a = run({ mode: 'rate', visits: 5_000, conv: 150, value: 50 });
    [formatPct(a.rate), m(a.revenue!), m(a.revenuePerVisitor!)].forEach(has);
    const b = run({ mode: 'conversions', visits: 5_000, target: 4, value: 50 });
    [formatConversions(b.conversions), m(b.revenue!)].forEach(has);
    has(formatVisitors(run({ mode: 'visitors', goal: 200, target: 3 }).visitors));
    const c = run({ mode: 'rate', visits: 3_000, conv: 90, value: 2_000 });
    [m(c.revenue!, 'INR'), m(c.revenuePerVisitor!, 'INR')].forEach(has);
  });
});
