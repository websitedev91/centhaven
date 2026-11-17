# Tool spec: Hourly to Salary Calculator

| Field | Value |
|---|---|
| Slug | `hourly-to-salary-calculator` |
| Category | `salary` (new category) |
| Risk | 🟢 green: pure maths, no rates |
| Main keyword | `hourly to salary calculator` (10K–100K/month, competitive: big bet) |
| Long-tail keywords | `salary to hourly calculator`, `hourly wage to annual salary`, `how much is $25 an hour per year`, `annual salary to hourly rate` |
| Affiliate | none |
| Related tools | `hourly-rate-calculator`, `day-rate-to-salary-calculator`, `job-offer-comparison-calculator` |

## What it calculates
Converts an hourly wage into yearly, monthly, bi-weekly, weekly and daily pay, and the other way round (salary → hourly). All amounts are **before tax (gross)**.

## Inputs
| Field | Type | Default | Min / Max | Notes |
|---|---|---|---|---|
| Direction | toggle | Hourly → Salary | Hourly → Salary / Salary → Hourly | |
| Currency | select | USD | USD, GBP, EUR, CAD, AUD, INR | Display only; currency defaults pattern applies (INR hourly default 500, salary default 10,00,000) |
| Hourly wage | currency | 25 | 0 – 100,000 | Shown when Hourly → Salary |
| Annual salary | currency | 75,000 | 0 – 100,000,000 | Shown when Salary → Hourly |
| Hours per week | number | 40 | 1 – 100 | |
| Days per week | number | 5 | 1 – 7 | For the daily figure |
| Paid weeks per year | number | 52 | 1 – 52 | Helper: "Use 52 if your holidays are paid. Lower it for unpaid time off." |
| Include overtime (added 2026-11-17, review C7) | checkbox | off | | Hourly mode only |
| Overtime hours per week | number | 5 | 0 – 60 | Shown when overtime is on |
| Overtime pay rate | number | 1.5 | 1 – 3 | × the hourly wage |

## Outputs
| Output | How it's shown |
|---|---|
| **Annual salary** (or **hourly wage** in reverse mode) | Main result |
| Monthly, bi-weekly, semi-monthly (÷ 24), weekly, daily pay | Breakdown table |
| Regular pay and overtime pay per year | Breakdown rows, only when overtime is on |
| Common hourly wages as a yearly salary | Static table: 15–50 in steps of 5 at 40 h × 52 weeks (2,080 h), in the selected currency |
| Hours paid per year | Breakdown row |

## Formula
```
annual   = hourly × hoursPerWeek × paidWeeks
monthly  = annual / 12
biweekly = annual / 26
semimonthly = annual / 24
overtime (hourly mode, optional): otWeekly = hourly × multiplier × otHours; annual += otWeekly × paidWeeks; weekly += otWeekly
weekly   = hourly × hoursPerWeek
daily    = hourly × hoursPerWeek / daysPerWeek
reverse: hourly = annual / (hoursPerWeek × paidWeeks)
```

## Rates used
None.

## Test cases
| # | Inputs | Expected | Checked against |
|---|---|---|---|
| 1 | hourly 25 · 40 h · 5 days · 52 weeks | annual **52,000.00** · monthly 4,333.33 · bi-weekly 2,000.00 · weekly 1,000.00 · daily 200.00 | Manual |
| 2 | reverse: salary 75,000 · 40 h · 52 weeks | **hourly 36.06** | Manual |
| 3 | hourly 20 · 37.5 h · 5 days · 50 weeks | annual **37,500.00** · monthly 3,125.00 · daily 150.00; reverse of 37,500 → 20.00 | Manual |
| 5 | hourly 25 · 40 h · 5 days · 52 weeks · overtime 5 h × 1.5 | weekly 1,187.50 · overtime 9,750.00 · **annual 61,750.00** · monthly 5,145.83 · bi-weekly 2,375.00 · semi-monthly 2,572.92 · daily 237.50 | Manual |
| 6 | hourly 20 · 37.5 h · 50 weeks · overtime 2 h × 2 | weekly 830.00 · overtime 4,000.00 · **annual 41,500.00** · semi-monthly 1,729.17 | Manual |
| 7 | case 1 semi-monthly | 2,166.67 | Manual |
| 8 | common wages table | 15 → 31,200 · 20 → 41,600 · 25 → 52,000 · … · 50 → 104,000 | Manual |
| 4 | hours per week 0 | Validation error, no crash | — |

## Extras
- **Quick table** under the result: the same wage at 30, 35, 40 and 45 hours a week (yearly pay).
- Chart: none (a table is clearer here).
- Scenario compare: no. Share / Print / Embed: yes.

## Content notes
- Examples: $25/hour (US), £15/hour at 37.5 h (UK), ₹500/hour (India).
- FAQ: How much is $X an hour per year? · Is this before or after tax? · What about paid holidays? · How do I convert a salary to hourly? · Why are there 26 bi-weekly pay periods? · How many working hours are in a year? (2,080 at 40 h × 52) · Does overtime count?
- Content angle (our edge vs big sites): a short section "Freelancing? Your hourly rate must be higher" linking to the hourly-rate calculator.
