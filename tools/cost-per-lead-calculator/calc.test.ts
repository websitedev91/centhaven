import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatMoney, formatNumber, type CurrencyCode } from '@/lib/format';
import { costPerLead, formatCustomers } from './calc';
import { cplDefaults, cplSchema, fieldErrors, switchCplCurrency, toCalcInput } from './schema';

const run = (spend: number, leads: number, conv = 0) => costPerLead(toCalcInput({ spend, leads, conv }));
const m = (n: number, c: CurrencyCode = 'USD') => formatMoney(n, c);

describe('spec test cases', () => {
  it('#1 2,000 ÷ 80 at 10% → 25.00, 8 customers, 250.00, 10 leads each', () => {
    const r = run(2_000, 80, 10);
    expect(r.cpl).toBe(25);
    expect(formatCustomers(r.customers!)).toBe('8 customers');
    expect(r.costPerCustomer).toBe(250);
    expect(r.leadsPerCustomer).toBe(10);
  });

  it('#2 1,500 ÷ 45 at 20% → 33.33, 9 customers, 166.67', () => {
    const r = run(1_500, 45, 20);
    expect(m(r.cpl, 'GBP')).toBe('£33.33');
    expect(formatCustomers(r.customers!)).toBe('9 customers');
    expect(m(r.costPerCustomer!, 'GBP')).toBe('£166.67');
  });

  it('#3 ₹60,000 ÷ 150 at 5% → ₹400.00, about 7.5 customers (on average), ₹8,000.00', () => {
    const r = run(60_000, 150, 5);
    expect(m(r.cpl, 'INR')).toBe('₹400.00');
    expect(formatCustomers(r.customers!)).toBe('about 7.5 customers (on average)');
    expect(m(r.costPerCustomer!, 'INR')).toBe('₹8,000.00');
  });

  it('#4 1,000 ÷ 7 at 3% → 142.86, about 0.21 customers, 33.3 leads each, 4,761.90', () => {
    const r = run(1_000, 7, 3);
    expect(m(r.cpl)).toBe('$142.86');
    expect(formatCustomers(r.customers!)).toBe('about 0.21 customers (on average)');
    expect(formatNumber(r.leadsPerCustomer!, 1)).toBe('33.3');
    expect(m(r.costPerCustomer!)).toBe('$4,761.90');
  });

  it('#5 rate 0 → customer rows off', () => {
    const r = run(2_000, 80, 0);
    expect(r.cpl).toBe(25);
    expect([r.customers, r.costPerCustomer, r.leadsPerCustomer]).toEqual([null, null, null]);
  });

  it('#6 rate 100% → 80 customers at 25.00 (= CPL)', () => {
    const r = run(2_000, 80, 100);
    expect(formatCustomers(r.customers!)).toBe('80 customers');
    expect(r.costPerCustomer).toBe(25);
  });

  it('#7 USD → INR untouched: spend 60,000, CPL 750.00; a typed spend is kept', () => {
    const i = switchCplCurrency(cplDefaults, 'INR');
    expect(i).toMatchObject({ spend: 60_000, leads: 80, conv: 10 });
    expect(m(costPerLead(toCalcInput(i)).cpl, 'INR')).toBe('₹750.00');
    expect(switchCplCurrency({ ...cplDefaults, spend: 3_000 }, 'INR').spend).toBe(3_000);
  });
});

describe('edge cases', () => {
  it.each([
    ['leads', 0, 'Enter at least 1 lead'],
    ['leads', 2.5, 'Enter a whole number'],
    ['leads', Number.NaN, 'Enter a number'],
    ['spend', -1, 'Can’t be negative'],
    ['conv', 101, 'Maximum is 100%'],
    ['conv', -1, 'Minimum is 0%'],
  ] as const)('%s = %s → %s', (key, value, message) => {
    expect(fieldErrors(cplSchema, { ...cplDefaults, [key]: value })[key]).toBe(message);
  });

  it('spend 0 → 0.00 per lead and per customer', () => {
    const r = run(0, 80, 10);
    expect([r.cpl, r.costPerCustomer]).toEqual([0, 0]);
  });

  it('one customer is singular', () => {
    expect(formatCustomers(1)).toBe('1 customer');
  });

  it('huge values stay finite', () => {
    const r = run(10_000_000_000, 1, 0.01);
    expect(Number.isFinite(r.costPerCustomer!)).toBe(true);
  });
});

describe('content.mdx worked examples match the calculator', () => {
  const mdx = readFileSync(join(__dirname, 'content.mdx'), 'utf8');
  const has = (t: string) => expect(mdx, `content.mdx should contain "${t}"`).toContain(t);

  it('the four examples', () => {
    const a = run(2_000, 80, 10);
    [m(a.cpl), formatCustomers(a.customers!), m(a.costPerCustomer!)].forEach(has);
    const b = run(1_500, 45, 20);
    [m(b.cpl, 'GBP'), formatCustomers(b.customers!), m(b.costPerCustomer!, 'GBP')].forEach(has);
    const c = run(60_000, 150, 5);
    [m(c.cpl, 'INR'), formatCustomers(c.customers!), m(c.costPerCustomer!, 'INR')].forEach(has);
    const d = run(1_000, 7, 3);
    [m(d.cpl), formatCustomers(d.customers!), m(d.costPerCustomer!)].forEach(has);
  });
});
