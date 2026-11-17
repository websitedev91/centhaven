# Tool spec: Break-Even Calculator

| Field | Value |
|---|---|
| Slug | `break-even-calculator` |
| Category | `business` |
| Risk | 🟢 green: pure maths |
| Main keyword | `break even calculator` (1K–10K/month, likely competitive) |
| Long-tail keywords | `break even point calculator`, `freelance break even calculator`, `how many sales to break even`, `break even revenue calculator` |
| Affiliate | `accounting-software` (add to config/affiliates.json, disabled) |
| Related tools | `hourly-rate-calculator`, `utilization-rate-calculator`, `rate-increase-calculator` |

## What it calculates
How many sales (units, projects or clients) you need each month to cover your fixed costs, the revenue that takes, and optionally the sales needed to hit a profit target.

## Inputs
| Field | Type | Default | Min / Max | Notes |
|---|---|---|---|---|
| Currency | select | USD | standard list | INR defaults: fixed 1,00,000, price 5,000, variable 2,000 |
| What you sell | select | Units | Units / Projects / Clients | Changes labels only |
| Fixed costs per month | currency | 10,000 | 0 – 1,000,000,000 | Rent, software, salaries… |
| Price per unit | currency | 50 | 0.01 – 1,000,000,000 | |
| Variable cost per unit | currency | 30 | 0 – 1,000,000,000 | Materials, fees, contractor cost per unit |
| Target profit per month (optional) | currency | 0 | 0 – 1,000,000,000 | |
| Current sales per month (optional, added 2026-11-17, review C10) | number | 0 | 0 – 1,000,000,000 | 0 = not given |

## Outputs
| Output | How it's shown |
|---|---|
| **Break-even sales** (whole units, rounded **up**) | Main result, e.g. "51 units a month" |
| Exact break-even (2 decimals) | Small text |
| Break-even revenue | Breakdown |
| Contribution margin per unit + margin % | Breakdown |
| Sales for target profit (rounded up) | Breakdown (if target > 0) |
| Margin of safety % (and units above/below break-even) | Breakdown (if current sales > 0) |
| Price sensitivity: break-even sales at −20%, −10%, now, +10%, +20% price | Table; "Never" when price ≤ variable cost |

## Formula
```
contribution      = price − variableCost
marginRatio       = contribution / price
breakEvenUnits    = fixedCosts / contribution          (display ceil())
breakEvenRevenue  = fixedCosts / marginRatio
targetUnits       = (fixedCosts + targetProfit) / contribution   (display ceil())
marginOfSafety    = (currentSales − breakEvenUnits) / currentSales   (exact break-even; only if currentSales > 0)
sensitivity       = breakEvenUnits at price × (1 + change), change ∈ {−20%, −10%, 0, +10%, +20%}
```
Guard: price ≤ variableCost → error "Price must be higher than variable cost to ever break even".

## Rates used
None.

## Test cases
| # | Inputs | Expected | Checked against |
|---|---|---|---|
| 1 | fixed 10,000 · price 50 · variable 30 · target profit 5,000 | contribution **20.00** · margin **40.00%** · break-even **500** units · revenue **25,000.00** · target **750** units | Manual |
| 2 | fixed 3,000 · price 99 · variable 39.50 · profit 0 | contribution 59.50 · margin 60.10% · exact 50.42 → **51 units** · revenue **4,991.60** | Manual |
| 4 | case 1 with current sales 600 / 400 | margin of safety **16.67%** (100 above) / **−25.00%** (100 below) | Manual |
| 5 | case 2 with current sales 60 | margin of safety 15.97% (9.58 above, exact break-even 50.42) | Manual |
| 6 | price sensitivity, case 1 | 40 → 1,000 · 45 → 667 · 50 → 500 · 55 → 400 · 60 → 334 | Manual |
| 7 | price sensitivity, fixed 1,000 · price 35 · variable 30 | −20%: never · 667 · 200 · 118 · 84 | Manual |
| 3 | price 30 · variable 30 | Error message, no crash | — |

## Extras
- **Chart:** classic break-even chart. Revenue line vs total-cost line over 0 → 2× break-even units, with the crossing point marked.
- Scenario compare: yes (e.g. two prices).
- Share / Print / Embed: yes.

## Content notes
- Examples: an online course seller (units), a freelance web designer (projects: fixed 3,000, price 99 per small job), a SaaS/coach (clients).
- FAQ: What is a break-even point? · What are fixed vs variable costs? · What is contribution margin? · How do I lower my break-even point? · Why round up? · Break-even in units vs revenue? · How often should I recalculate?
- Our edge vs big sites: the freelancer "projects / clients" mode and plain-English explanations.
