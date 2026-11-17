# Tool spec: Day Rate to Salary Calculator

| Field | Value |
|---|---|
| Slug | `day-rate-to-salary-calculator` |
| Category | `freelance` |
| Risk | 🟢 green: pure maths, no rates (the benefits uplift is a user assumption) |
| Main keyword | `day rate to salary calculator` (100–1K/month) |
| Long-tail keywords | `freelance day rate calculator`, `contractor day rate calculator`, `salary to day rate calculator`, `contractor vs permanent salary` |
| Affiliate | `invoicing-software` (disabled until approved) |
| Related tools | `hourly-rate-calculator`, `hourly-to-salary-calculator`, `consulting-fee-calculator` |

## What it calculates
Two ways: (1) what a contractor's **day rate** adds up to over a year, and roughly what **employee salary** that equals; (2) what **day rate** a contractor needs to match a given salary. Before tax.

## Inputs
| Field | Type | Default | Min / Max | Notes |
|---|---|---|---|---|
| Direction | toggle | Day rate → Salary | both directions | |
| Currency | select | GBP | GBP, USD, EUR, CAD, AUD, INR | UK contractors are the main audience; INR default day rate 8,000, salary 15,00,000 |
| Day rate | currency | 500 | 0 – 100,000 | |
| Salary | currency | 60,000 | 0 – 100,000,000 | Reverse mode |
| Working days in the year | number | 260 | 200 – 270 | 52 weeks × 5 days |
| Holidays (days) | number | 25 | 0 – 60 | Helper: "Example values — change them to match your country and contract." |
| Public holidays (days) | number | 8 | 0 – 20 | Helper: "Example values — change them to match your country and contract." |

> 2026-11-17 (Puru): 25 holidays + 8 public holidays stay the default for **every** currency. They are example inputs, not legal values, so there is no /rates file for them. Content says: "Holiday and public-holiday rules differ by country (and sometimes by state), so use your own numbers."
| Sick days | number | 5 | 0 – 30 | |
| Days between contracts | number | 10 | 0 – 120 | Helper: "Gaps when you're not billing" |
| Benefits uplift | % slider | 20% | 0 – 50% | Helper: "Extra value an employee gets (pension, paid leave, insurance). Your own estimate." |

## Outputs
| Output | How it's shown |
|---|---|
| **Annual contractor income** (or **day rate needed**) | Main result |
| Billable days per year | Breakdown |
| Equivalent employee salary (approx.) | Breakdown |
| Monthly income | Breakdown |
| Hourly equivalent (8-hour day) | Breakdown |

## Formula
```
billableDays     = workingDays − holidays − publicHolidays − sickDays − gapDays
annualIncome     = dayRate × billableDays
equivalentSalary = annualIncome / (1 + uplift)
reverse: dayRate = salary × (1 + uplift) / billableDays
```
Guard: billableDays ≤ 0 → error "Add some billable days".

## Rates used
None.

## Test cases
| # | Inputs | Expected | Checked against |
|---|---|---|---|
| 1 | day 500 · defaults (260/25/8/5/10) · uplift 20% | billable days **212** · annual **106,000.00** · equivalent salary **88,333.33** | Manual |
| 2 | reverse: salary 60,000 · defaults · uplift 20% | **day rate 339.62** | Manual |
| 3 | day 400 · working 260 · holidays 20 · public 0 · sick 0 · gap 20 (→ 220 billable days) · uplift 0% | annual **88,000.00** · equivalent 88,000.00 | Manual |
| 4 | holidays 60 + sick 30 + gap 120 + public 20 with working 200 | Error "Add some billable days" | — |

## Extras
- Chart: bar showing the 260 working days split into billable / holidays / public / sick / gaps.
- Scenario compare: yes (two day rates or two gap assumptions).
- Share / Print / Embed: yes.

## Content notes
- Examples: UK developer £500/day; US consultant $800/day; Indian contractor ₹8,000/day.
- FAQ: How do I convert a day rate to a salary? · What is a good contractor day rate? · Why should contractors earn more than employees? · How many billable days are there in a year? · What is a benefits uplift? · Should I include days between contracts? · Is this before or after tax?
- Don't mention UK IR35 rules or tax in the maths (that would make it red risk). One neutral FAQ line can say "Tax rules for contractors differ by country; check with an accountant."
