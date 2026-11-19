import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatMoney, type CurrencyCode } from '@/lib/format';
import { meetingCost } from './calc';
import {
  addRow,
  meetingDefaults,
  meetingErrors,
  planBInput,
  removeRow,
  switchMeetingCurrency,
  toCalcInput,
  type MeetingState,
} from './schema';

const run = (patch: Partial<MeetingState>) => meetingCost(toCalcInput({ ...meetingDefaults, ...patch }));
const same = (people: number, rate: number, min: number, perWeek = 0, weeks = 48) =>
  run({ mode: 'same', people, rate, min, rep: perWeek > 0 ? 'repeats' : 'once', perWeek: perWeek || 1, weeks });
const m = (n: number, c: CurrencyCode = 'USD') => formatMoney(n, c);
const case3: Partial<MeetingState> = { mode: 'each', rows: 5, r1: 120, r2: 80, r3: 60, r4: 60, r5: 40, min: 30, rep: 'repeats', perWeek: 5, weeks: 48 };

describe('spec test cases', () => {
  it('#1 6 × 50 × 60 min → 300.00, 5.00 a minute, 6 person-hours', () => {
    const r = same(6, 50, 60);
    expect([r.meetingCost, r.perMinute, r.personHours]).toEqual([300, 5, 6]);
    expect([r.weekly, r.yearly]).toEqual([null, null]);
  });

  it('#2 8 × 75 × 45 min, weekly, 48 weeks → 450.00, 450.00, 21,600.00', () => {
    const r = same(8, 75, 45, 1, 48);
    expect([r.meetingCost, r.weekly, r.yearly]).toEqual([450, 450, 21_600]);
  });

  it('#3 per person 120/80/60/60/40 × 30 min, 5 a week, 48 weeks → 180.00, 900.00, 43,200.00', () => {
    const r = run(case3);
    expect(r.hourlyTotal).toBe(360);
    expect([r.meetingCost, r.weekly, r.yearly]).toEqual([180, 900, 43_200]);
  });

  it('#4 INR 10 × ₹800 × 90 min, twice a week, 50 weeks → ₹12,000.00, ₹24,000.00, ₹12,00,000.00', () => {
    const r = same(10, 800, 90, 2, 50);
    expect([m(r.meetingCost, 'INR'), m(r.weekly!, 'INR'), m(r.yearly!, 'INR')]).toEqual(['₹12,000.00', '₹24,000.00', '₹12,00,000.00']);
  });

  it('#5 4 × 40 × 60 min, every two weeks, 52 weeks → 160.00, 80.00, 4,160.00', () => {
    const r = same(4, 40, 60, 0.5, 52);
    expect([r.meetingCost, r.weekly, r.yearly]).toEqual([160, 80, 4_160]);
  });

  it('#6 USD → GBP untouched: rate 40, rows 65/50/35/35; counts and times unchanged; a typed rate is kept', () => {
    expect(switchMeetingCurrency(meetingDefaults, 'GBP')).toMatchObject({ rate: 40, r1: 65, r2: 50, r3: 35, r4: 35, people: 6, min: 60, weeks: 48 });
    expect(switchMeetingCurrency({ ...meetingDefaults, rate: 55 }, 'GBP').rate).toBe(55);
    expect(switchMeetingCurrency(meetingDefaults, 'INR')).toMatchObject({ rate: 800, r1: 1_500, r2: 1_000, r3: 700, r4: 700 });
  });
});

describe('edge cases', () => {
  const errs = (patch: Partial<MeetingState>) => meetingErrors({ ...meetingDefaults, ...patch });

  it.each([
    ['people', 0, 'Enter at least 1 person'],
    ['people', 1.5, 'Enter a whole number'],
    ['min', 0, 'Enter at least 1 minute'],
    ['rate', -1, 'Can’t be negative'],
  ] as const)('%s = %s → %s', (key, value, message) => {
    expect(errs({ [key]: value })[key]).toBe(message);
  });

  it('rate 0 → cost 0 (valid)', () => {
    expect(errs({ rate: 0 })).toEqual({});
    expect(same(6, 0, 60).meetingCost).toBe(0);
  });

  it('an empty row only counts while it is shown', () => {
    expect(errs({ mode: 'each', r2: Number.NaN }).r2).toBe('Enter a number');
    expect(errs({ mode: 'each', r6: Number.NaN })).toEqual({});
    expect(errs({ mode: 'same', r2: Number.NaN })).toEqual({});
  });

  it('repeat fields only count when the meeting repeats', () => {
    expect(errs({ rep: 'once', perWeek: Number.NaN })).toEqual({});
    expect(errs({ rep: 'repeats', perWeek: Number.NaN }).perWeek).toBe('Enter a number');
    expect(errs({ rep: 'repeats', weeks: 53 }).weeks).toBeDefined();
  });

  it('add copies the last rate; remove moves later rows up; the last row stays', () => {
    const added = addRow({ ...meetingDefaults, mode: 'each' });
    expect([added.rows, added.r5]).toEqual([5, 45]);
    const removed = removeRow({ ...meetingDefaults, mode: 'each' }, 0);
    expect([removed.rows, removed.r1, removed.r2, removed.r3]).toEqual([3, 60, 45, 45]);
    const one = { ...meetingDefaults, rows: 1 };
    expect(removeRow(one, 0)).toBe(one);
  });

  it('plan B uses plan A’s average hourly cost', () => {
    const a = toCalcInput({ ...meetingDefaults, ...case3 });
    const b = meetingCost(planBInput(a, { people: 4, min: 30 }));
    expect(b.meetingCost).toBe(144); // average 72 × 4 people × 0.5 h
  });

  it('huge values stay finite', () => {
    expect(Number.isFinite(same(10_000, 1_000_000, 1_440, 50, 52).yearly!)).toBe(true);
  });
});

describe('content.mdx worked examples match the calculator', () => {
  const mdx = readFileSync(join(__dirname, 'content.mdx'), 'utf8');
  const has = (t: string) => expect(mdx, `content.mdx should contain "${t}"`).toContain(t);

  it('the five examples', () => {
    const a = same(6, 50, 60);
    [m(a.meetingCost), m(a.perMinute)].forEach(has);
    const b = same(8, 75, 45, 1, 48);
    [m(b.meetingCost), m(b.yearly!)].forEach(has);
    // "cutting it to 30 minutes" saving
    has(m(b.yearly! - same(8, 75, 30, 1, 48).yearly!).replace('.00', ''));
    const c = run(case3);
    [m(c.meetingCost), m(c.weekly!), m(c.yearly!)].forEach(has);
    const d = same(10, 800, 90, 2, 50);
    [m(d.meetingCost, 'INR'), m(d.weekly!, 'INR'), m(d.yearly!, 'INR')].forEach(has);
    const e = same(4, 40, 60, 0.5, 52);
    [m(e.meetingCost), m(e.yearly!)].forEach(has);
  });
});
