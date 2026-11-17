# Tool spec: Consulting Fee Calculator

> **Approved by Puru, 2026-11-17.**

| Field | Value |
|---|---|
| Slug | `consulting-fee-calculator` |
| Category | `freelance` |
| Risk | 🟢 green: pure maths, no rates (tax is the user's own estimate) |
| Main keyword | `consulting fee calculator` (100–1K/month) |
| Long-tail keywords | `consulting rate calculator`, `how much to charge for consulting`, `consultant hourly rate calculator` |
| Affiliate | `invoicing-software` (disabled until approved) |
| Related tools | from the keyword map: `hourly-rate-calculator`, `day-rate-to-salary-calculator`, `retainer-fee-calculator` |

## What it calculates
The hourly, daily and project fee a consultant needs to cover their income goal, tax, overheads and unbilled time, **plus a profit margin** on top.

How it differs from the Freelance Hourly Rate Calculator (so the two pages don't compete):
- it works in **billable days per year** and **hours per billable day**, the way consultants plan, not weeks off and billable %;
- it adds a **profit margin** above cost;
- it prices a **project** from estimated hours.

## Inputs
| Field | Type | Default | Min / Max | Notes |
|---|---|---|---|---|
| Currency | select | USD | USD, GBP, EUR, CAD, AUD, INR | Currency defaults below |
| Target take-home income (per year) | currency | 120,000 | 0 – 100,000,000 | After tax |
| Overheads (per year) | currency | 15,000 | 0 – 100,000,000 | Helper: "Software, insurance, travel, office, accounting, marketing." |
| Estimated tax rate | % slider | 25% | 0 – 60% | Helper: "Your rough total rate. Not tax advice." |
| Billable days per year | number | 180 | 1 – 260 | Helper: "Days you actually bill clients, after holidays, sales and admin days." |
| Hours per billable day | number | 6 | 1 – 12 | |
| Profit margin | % slider | 15% | 0 – 100% | Helper: "On top of covering costs: a buffer for slow months and growth." |
| Project estimate | number | 40 | 1 – 10,000 | Hours, for the project fee |

### Currency defaults
| Currency | Income · Overheads · Tax |
|---|---|
| USD / CAD / AUD | 120,000 · 15,000 · 25% |
| GBP / EUR | 90,000 · 11,000 · 25% |
| INR | 30,00,000 · 3,00,000 · 10% |

Untouched fields switch to these when the currency changes; values the user typed are kept.

## Outputs
| Output | How it's shown |
|---|---|
| **Consulting rate (per hour)** | Main result |
| Day rate (hours per day × rate) | Breakdown |
| Project fee (project hours × rate) | Breakdown |
| Annual revenue at this rate | Breakdown |
| Profit margin per year | Breakdown |
| Billable hours per year | Breakdown |

## Formula
Gross up the take-home income for tax, add overheads, spread it over billable hours, then add the margin.
```
grossNeeded   = income ÷ (1 − tax) + overheads
billableHours = billableDays × hoursPerDay
costRate      = grossNeeded ÷ billableHours
hourlyRate    = costRate × (1 + margin)
dayRate       = hourlyRate × hoursPerDay
projectFee    = hourlyRate × projectHours
annualRevenue = hourlyRate × billableHours
marginPerYear = annualRevenue − grossNeeded
```
Guard: billableHours ≤ 0 → error "Add some billable days".

## Rates used
| Rates file | What it holds | Official source URL |
|---|---|---|
| none | | |

## Test cases (must match exactly)
| # | Inputs | Expected output | Checked against |
|---|---|---|---|
| 1 | income 120,000 · tax 25% · overheads 15,000 · 180 days · 6 h · margin 15% · project 40 h | gross 175,000.00 · hours 1,080 · **rate 186.34** · day 1,118.06 · project 7,453.70 · annual 201,250.00 · margin/yr 26,250.00 | Manual |
| 2 | income 30,00,000 · tax 10% · overheads 3,00,000 · 200 days · 7 h · margin 10% · project 20 h | gross 36,33,333.33 · hours 1,400 · **rate 2,854.76** · day 19,983.33 · project 57,095.24 · annual 39,96,666.67 | Manual |
| 3 | income 90,000 · tax 0% · overheads 10,000 · 200 days · 5 h · margin 0% · project 40 h | **rate 100.00** · day 500.00 · project 4,000.00 · annual 100,000.00 · margin/yr 0.00 | Manual |
| 4 | billable days 0 | Validation error, no crash | — |

## Extras
- Chart: one stacked bar "Where each hour's fee goes": take-home, tax, overheads, margin (shared SplitBar).
- Scenario compare: yes, Plan B with a different margin and billable days.
- Share / Print / Embed: yes.

## Content notes
- Examples: US management consultant (case 1), Indian IT consultant (case 2), UK solo consultant pricing a 40-hour project.
- FAQ: keyword-map questions + "What profit margin should a consultant add?" + "How many billable days does a consultant have?"
- Cross-link both ways: here "Freelancer? Use the hourly rate calculator"; on the hourly rate page "Consultant? Use the consulting fee calculator".
- Tips: price the project, not the hours; include sales and admin days; review the margin yearly; link to the retainer tool for ongoing work.
