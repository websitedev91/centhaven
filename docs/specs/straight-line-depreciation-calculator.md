# Tool spec: Straight-Line Depreciation Calculator

> **Approved by Puru, 2026-11-17.**

| Field | Value |
|---|---|
| Slug | `straight-line-depreciation-calculator` |
| Category | `business` |
| Risk | 🟢 green: pure maths. Content must say it is the accounting method, not tax depreciation rules (MACRS, capital allowances, Indian WDV rates), which differ by country |
| Main keyword | `straight line depreciation calculator` (100–1K/month) |
| Long-tail keywords | `equipment depreciation calculator`, `depreciation schedule calculator`, `laptop depreciation` |
| Affiliate | `accounting-software` (disabled until approved) |
| Related tools | from the keyword map: `break-even-calculator`, `utilization-rate-calculator`, `freelance-invoice-generator` |

## What it calculates
How much an asset loses in value each year with straight-line depreciation, and a full year-by-year schedule of depreciation, accumulated depreciation and book value. Supports an asset bought part-way through the first year.

## Inputs
| Field | Type | Default | Min / Max | Notes |
|---|---|---|---|---|
| Currency | select | USD | standard list | Currency defaults below |
| Asset cost | currency | 1,500 | 0.01 – 1,000,000,000 | Helper: "What you paid, including delivery and setup." |
| Salvage value | currency | 300 | 0 – cost | Helper: "What it will be worth at the end. Use 0 if nothing." |
| Useful life | number | 3 | 1 – 50 | Years |
| Months used in the first year | number | 12 | 1 – 12 | Helper: "12 if you bought it at the start of your year." |

### Currency defaults
| Currency | Cost · Salvage |
|---|---|
| USD / CAD / AUD | 1,500 · 300 |
| GBP / EUR | 1,200 · 200 |
| INR | 1,00,000 · 10,000 |

## Outputs
| Output | How it's shown |
|---|---|
| **Depreciation per year** | Main result |
| Depreciation per month | Breakdown |
| Depreciation rate (% of depreciable amount per year) | Breakdown |
| Depreciable amount (cost − salvage) | Breakdown |
| Schedule: year · depreciation · accumulated · book value at year end | Table under the result |

## Formula
```
annual  = (cost − salvage) ÷ lifeYears
monthly = annual ÷ 12
rate    = 1 ÷ lifeYears
If first-year months m = 12: years 1…life each depreciate `annual`.
If m < 12: year 1 = annual × m ÷ 12; years 2…life = annual; year life+1 = annual × (12 − m) ÷ 12.
Book value never goes below salvage.
```
Guard: salvage > cost → error "Salvage value can't be more than the cost".

## Rates used
| Rates file | What it holds | Official source URL |
|---|---|---|
| none | | |

## Test cases (must match exactly)
| # | Inputs | Expected output | Checked against |
|---|---|---|---|
| 1 | cost 1,500 · salvage 300 · 3 years · 12 months | **annual 400.00** · monthly 33.33 · rate 33.33% · book values 1,100.00 / 700.00 / 300.00 | Manual |
| 2 | cost 50,000 · salvage 5,000 · 5 years · 6 months | **annual 9,000.00** · year 1 4,500.00 (book 45,500.00) · years 2–5 9,000.00 · year 6 4,500.00 · final book 5,000.00 | Manual |
| 3 | cost 1,00,000 · salvage 0 · 4 years · 12 months | **annual 25,000.00** · monthly 2,083.33 · book 75,000.00 / 50,000.00 / 25,000.00 / 0.00 | Manual |
| 4 | salvage 2,000 with cost 1,500 | Error message, no crash | — |

## Extras
- Chart: book value by year as simple bars above the schedule table.
- Scenario compare: no.
- Share / Print / Embed: yes.

## Content notes
- Examples: a freelancer's $1,500 laptop (case 1), a UK small business van bought mid-year (case 2 in £), an Indian office's ₹1,00,000 equipment (case 3).
- FAQ: keyword-map questions + "Is this the same as tax depreciation?" + "Can I change the useful life later?"
- **Near the top of the page (intro), not only in the FAQ:** this is the accounting method, not tax depreciation; tax rules (MACRS, capital allowances, Indian WDV rates) differ by country; check with an accountant.
