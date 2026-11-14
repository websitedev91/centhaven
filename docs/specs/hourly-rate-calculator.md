# Tool spec: Freelance Hourly Rate Calculator

| Field | Value |
|---|---|
| Slug | `hourly-rate-calculator` |
| Category | `freelance` |
| Risk | 🟢 green (pure maths, no external rates) |
| Main keyword | `freelance hourly rate calculator` |
| Long-tail keywords | `how much should I charge per hour freelance`, `freelance rate calculator`, `hourly rate calculator for freelancers`, `calculate freelance day rate`, `freelance pricing calculator` |
| Affiliate | `invoicing-software` (disabled until approved) |
| Related tools | `day-rate-calculator`, `contractor-vs-employee-calculator`, `upwork-fee-calculator`, `freelance-take-home-pay-calculator` |

## What it calculates
The minimum hourly rate a freelancer must charge to reach their target take-home income, after covering business expenses, tax and non-billable time.

## Inputs
| Field | Type | Default | Min / Max | Notes |
|---|---|---|---|---|
| Currency | select | USD | USD, GBP, EUR, CAD, AUD, INR | Display only |
| Target take-home income (per year) | currency | 60,000 | 0 – 100,000,000 | After tax |
| Business expenses (per year) | currency | 6,000 | 0 – 100,000,000 | Software, equipment, internet, insurance… |
| Estimated tax rate | % slider | 25% | 0 – 60% | Helper text: "Your rough total tax rate. Not exact tax advice." |
| Weeks off per year | number/slider | 6 | 0 – 26 | Holidays, sick days, public holidays |
| Working hours per week | number/slider | 40 | 1 – 80 | |
| Billable time | % slider | 75% | 10 – 100% | Share of hours you can actually bill (rest = admin, sales) |

## Outputs
| Output | How it's shown |
|---|---|
| **Minimum hourly rate** | Large main number |
| Day rate (hourly × hours per day, where hours per day = hours per week ÷ 5) | Breakdown row |
| Gross revenue needed per year | Breakdown row |
| Gross revenue needed per month | Breakdown row |
| Billable hours per year | Breakdown row |

## Formula
You need enough revenue to cover your take-home pay, your tax and your expenses, earned only in the hours you can actually bill.

```
grossNeeded    = targetIncome / (1 − taxRate) + expenses
billableHours  = (52 − weeksOff) × hoursPerWeek × billablePct
hourlyRate     = grossNeeded / billableHours
dayRate        = hourlyRate × (hoursPerWeek / 5)
monthlyRevenue = grossNeeded / 12
```
Edge cases: the schema caps weeks off at 26 and tax at 60%, so normal input can't reach zero billable hours. `calc.ts` still keeps a guard: if billableHours = 0, return the error "Add some billable hours" instead of dividing by zero.

## Rates used
| Rates file | What it holds | Official source URL |
|---|---|---|
| none | Pure maths; the user enters their own tax rate | — |

## Test cases (must match exactly, rounded to 2 decimals)
| # | Inputs | Expected output | Checked against |
|---|---|---|---|
| 1 | income 60,000 · expenses 6,000 · tax 25% · weeks off 6 · 40 h/wk · billable 75% | gross 86,000.00 · billable hours 1,380 · **hourly 62.32** · day 498.55 · monthly 7,166.67 | Manual calculation |
| 2 | income 1,200,000 · expenses 120,000 · tax 10% · weeks off 4 · 40 h/wk · billable 60% | gross 1,453,333.33 · billable hours 1,152 · **hourly 1,261.57** · day 10,092.59 · monthly 121,111.11 | Manual calculation |
| 3 | income 50,000 · expenses 0 · tax 0% · weeks off 2 · 30 h/wk · billable 100% | gross 50,000.00 · billable hours 1,500 · **hourly 33.33** · day 200.00 · monthly 4,166.67 | Manual calculation |
| 4a | weeks off 27 (above the schema max of 26) | Schema validation error shown inline, no crash | — |
| 4b | `calc()` called directly with billableHours = 0 | Returns the guard error "Add some billable hours", no divide-by-zero | Unit test on calc.ts |

## Extras
- **Chart:** donut or stacked bar showing where each hour's rate goes: take-home vs tax vs expenses.
- **Scenario compare:** yes. "Compare two plans", e.g. 40 h at 75% billable vs 30 h at 90% billable.
- Share / Print / Embed: yes.

## Content notes
- Examples: (1) a US web designer, numbers as test 1; (2) an Indian developer in INR, numbers as test 2; (3) a part-timer, test 3.
- FAQ ideas:
  1. How much should I charge per hour as a freelancer?
  2. Why is my freelance rate higher than my old salary per hour?
  3. What is billable time and why does it matter?
  4. Should I charge hourly or per project?
  5. How do I include taxes in my freelance rate?
  6. What expenses should freelancers include?
  7. How often should I raise my rates?
  8. Is a day rate better than an hourly rate?
- Tips: don't forget unpaid admin/sales time; add a buffer for slow months; review rates every year.
