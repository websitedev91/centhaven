# Tool spec: Retainer Fee Calculator

> **Approved by Puru, 2026-11-17.**

| Field | Value |
|---|---|
| Slug | `retainer-fee-calculator` |
| Category | `freelance` |
| Risk | 🟢 green: pure maths |
| Main keyword | `retainer fee calculator` (10–100/month) |
| Long-tail keywords | `monthly retainer pricing calculator`, `how to price a retainer`, `retainer agreement pricing` |
| Affiliate | `invoicing-software` (disabled until approved) |
| Related tools | from the keyword map: `hourly-rate-calculator`, `freelance-quote-generator`, `rate-increase-calculator` |

## What it calculates
A monthly retainer fee from the hours you commit, your hourly rate and any discount, and how it compares with billing the same hours one by one. It also shows the **effective hourly rate** if the client uses fewer hours than agreed.

## Inputs
| Field | Type | Default | Min / Max | Notes |
|---|---|---|---|---|
| Currency | select | USD | standard list | Currency defaults below |
| Your hourly rate | currency | 100 | 0 – 1,000,000 | |
| Hours committed per month | number | 20 | 1 – 744 | |
| Discount (−) or premium (+) (review #2 B3, 2026-11-17; was "Retainer discount" 0 – 50%) | % slider | −10% | −50% – +50% | Helper: "A small discount rewards guaranteed monthly work; a premium suits priority or on-call access. Your choice." URL key `adjust` (old `discount` links are ignored) |
| Agreement length | number | 6 | 1 – 60 | Months |
| Hours the client actually uses | % slider | 80% | 0 – 100% | Helper: "For the effective rate. Unused hours usually don't roll over; say so in the agreement." |
| Overage rate for extra hours (review #2 B3) | currency | 0 = hourly rate | 0 – 1,000,000 | Helper: "Leave at 0 to use your hourly rate." |
| Expected extra hours per month (review #2 B3) | number | 0 | 0 – 744 | Optional |

### Currency defaults
| Currency | Hourly rate |
|---|---|
| USD / CAD / AUD | 100 |
| GBP / EUR | 75 |
| INR | 2,000 |

## Outputs
| Output | How it's shown |
|---|---|
| **Monthly retainer fee** | Main result |
| Same hours billed hourly | Breakdown |
| Discount given / premium added per month | Breakdown |
| Total agreement value | Breakdown |
| Effective hourly rate at actual usage | Breakdown (hidden when usage is 0%) |
| Extra hours · monthly total with extra hours · agreement total with extra hours | Breakdown, only when extra hours > 0 |

## Formula
```
hourlyBilling  = rate × hours
monthlyFee       = hourlyBilling × (1 + adjustment)    (adjustment −0.5 … +0.5; negative = discount)
adjustmentAmount = hourlyBilling × adjustment
contractValue  = monthlyFee × months
effectiveRate  = monthlyFee ÷ (hours × usage)      (only if usage > 0)
overageRate    = overage input, or rate when 0
overagePerMonth = overageRate × extraHours
monthlyTotal   = monthlyFee + overagePerMonth
contractTotal  = monthlyTotal × months
```

## Rates used
| Rates file | What it holds | Official source URL |
|---|---|---|
| none | | |

## Test cases (must match exactly)
| # | Inputs | Expected output | Checked against |
|---|---|---|---|
| 1 | rate 100 · 20 h · 10% · 6 months · usage 80% | **fee 1,800.00** · hourly 2,000.00 · discount 200.00 · contract 10,800.00 · effective 112.50 | Manual |
| 2 | rate 2,000 · 30 h · 15% · 12 months · usage 100% | **fee 51,000.00** · hourly 60,000.00 · discount 9,000.00 · contract 6,12,000.00 · effective 1,700.00 | Manual |
| 3 | rate 75 · 10 h · 0% · 3 months · usage 50% | **fee 750.00** · hourly 750.00 · discount 0.00 · contract 2,250.00 · effective 150.00 | Manual |
| 5 | rate 100 · 20 h · **+20%** · 6 months · usage 80% | **fee 2,400.00** · premium 400.00 · contract 14,400.00 · effective 150.00 | Manual |
| 6 | case 1 + 5 extra h, overage 0 (= 100) | overage 500.00 · **monthly total 2,300.00** · 6-month total 13,800.00; fee and effective rate unchanged | Manual |
| 7 | case 5 + 3 extra h at 120 | overage 360.00 · **monthly total 2,760.00** · 6-month total 16,560.00 | Manual |
| 4 | usage 0% | Fee shown, effective rate hidden with a note, no crash | — |

## Extras
- Chart: none (the comparison rows are clearer).
- Scenario compare: yes, Plan B with different hours and discount.
- Share / Print / Embed: yes.

## Content notes
- Examples: US marketing freelancer (case 1), Indian developer on a 12-month retainer (case 2), UK designer whose client uses half the hours (case 3).
- FAQ: keyword-map questions + "How many hours should a retainer include?" + "Should I charge the retainer up front?"
- Tips: define what's included, state the unused-hours rule, review the retainer every 3–6 months, link to the rate increase tool.
