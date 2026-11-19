import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatMoney, roundTo, type CurrencyCode } from '@/lib/format';
import { appCost } from './calc';
import { appCostDefaults, appCostErrors, switchAppCostCurrency, toCalcInput, type AppCostState } from './schema';

const off = { login: 0, pay: 0, push: 0, chat: 0, device: 0, offline: 0, api: 0, admin: 0, qa: 0 } as const;
const run = (patch: Partial<AppCostState>) => appCost(toCalcInput({ ...appCostDefaults, ...patch }));
const m = (n: number, c: CurrencyCode = 'USD') => formatMoney(n, c);
const h = (n: number) => roundTo(n, 2);

const case2: Partial<AppCostState> = {
  currency: 'INR', rate: 1_500, ios: 1, android: 0, web: 0, screens: 5, hps: 6, setup: 20,
  ...off, pay: 1, api: 1, admin: 1, qa: 1, buffer: 20, maint: 4,
};
const case3: Partial<AppCostState> = {
  currency: 'GBP', rate: 60, ios: 1, android: 1, web: 1, extra: 50, screens: 10, hps: 5, setup: 20,
  ...off, login: 1, push: 1, chat: 1, api: 1, buffer: 0, maint: 0,
};

describe('spec test cases', () => {
  it('#1 USD defaults → 182.4 base, 27.36 buffer, 209.76 h, $15,732.00 (from $13,680.00), maint $450 / $5,400', () => {
    const r = run({});
    expect([r.screenHours, r.appSideHours, r.sharedHours, h(r.extraPlatformHours)]).toEqual([48, 64, 80, 38.4]);
    expect([h(r.baseHours), h(r.bufferHours), h(r.totalHours)]).toEqual([182.4, 27.36, 209.76]);
    expect(m(r.price)).toBe('$15,732.00');
    expect(m(r.basePrice)).toBe('$13,680.00');
    expect([r.maintenanceMonthly, r.maintenanceYearly]).toEqual([450, 5_400]);
  });

  it('#2 INR iOS only → 208.8 h, ₹3,13,200.00 (from ₹2,61,000.00), maint ₹6,000 / ₹72,000', () => {
    const r = run(case2);
    expect([r.appSideHours, r.sharedHours, r.extraPlatformHours, r.baseHours]).toEqual([54, 120, 0, 174]);
    expect([h(r.bufferHours), h(r.totalHours)]).toEqual([34.8, 208.8]);
    expect(m(r.price, 'INR')).toBe('₹3,13,200.00');
    expect(m(r.basePrice, 'INR')).toBe('₹2,61,000.00');
    expect([r.maintenanceMonthly, r.maintenanceYearly]).toEqual([6_000, 72_000]);
  });

  it('#3 GBP three platforms at 50% → extra 104, 268 h, £16,080.00, no buffer, no maintenance', () => {
    const r = run(case3);
    expect([r.appSideHours, r.sharedHours, r.extraPlatformHours, r.totalHours]).toEqual([104, 60, 104, 268]);
    expect(m(r.price, 'GBP')).toBe('£16,080.00');
    expect(r.basePrice).toBe(r.price);
    expect(r.maintenanceMonthly).toBe(0);
  });

  it('#4 no platform ticked → "Choose at least one platform"', () => {
    expect(appCostErrors({ ...appCostDefaults, ios: 0, android: 0, web: 0 }).platforms).toBe('Choose at least one platform');
  });

  it('#5 1 screen × 0.5 h, nothing else, rate 0 → 0.5 h, price 0', () => {
    const r = run({ ...off, screens: 1, hps: 0.5, setup: 0, buffer: 0, rate: 0, android: 0 });
    expect(r.totalHours).toBe(0.5);
    expect(r.price).toBe(0);
  });

  it('#6 USD → INR untouched: rate 1,500, hours unchanged; a typed rate is kept', () => {
    expect(switchAppCostCurrency(appCostDefaults, 'INR')).toMatchObject({ rate: 1_500, screens: 8, hps: 6, setup: 20 });
    expect(switchAppCostCurrency({ ...appCostDefaults, rate: 90 }, 'INR').rate).toBe(90);
  });
});

describe('edge cases', () => {
  it('extra % 0 with two platforms adds nothing', () => {
    expect(run({ extra: 0 }).extraPlatformHours).toBe(0);
  });

  it('hours of features that are off are ignored, even when empty', () => {
    expect(appCostErrors({ ...appCostDefaults, pay: 0, payH: Number.NaN })).toEqual({});
    expect(appCostErrors({ ...appCostDefaults, pay: 1, payH: Number.NaN }).payH).toBe('Enter a number');
  });

  it('the extra-platform % only counts with two or more platforms', () => {
    expect(appCostErrors({ ...appCostDefaults, android: 0, extra: Number.NaN })).toEqual({});
    expect(appCostErrors({ ...appCostDefaults, extra: Number.NaN }).extra).toBe('Enter a number');
  });

  it.each([
    ['screens', 0],
    ['screens', 2.5],
    ['rate', -1],
    ['hps', 0],
    ['setup', -1],
    ['buffer', 51],
    ['maint', -1],
  ] as const)('%s = %s → field error', (key, value) => {
    expect(appCostErrors({ ...appCostDefaults, [key]: value })[key]).toBeDefined();
  });
});

describe('content.mdx worked examples match the calculator', () => {
  const mdx = readFileSync(join(__dirname, 'content.mdx'), 'utf8');
  const has = (t: string) => expect(mdx, `content.mdx should contain "${t}"`).toContain(t);

  it('the three examples', () => {
    const a = run({});
    [`${h(a.baseHours)} h`, `${h(a.totalHours)} h`, m(a.price), m(a.basePrice), m(a.maintenanceMonthly), m(a.maintenanceYearly)].forEach(has);
    const b = run(case2);
    [`${h(b.totalHours)} h`, m(b.price, 'INR'), m(b.basePrice, 'INR'), m(b.maintenanceMonthly, 'INR')].forEach(has);
    const c = run(case3);
    [`${c.extraPlatformHours} h`, `${c.totalHours} h`, m(c.price, 'GBP')].forEach(has);
  });
});
