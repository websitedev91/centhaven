# Tool spec: Emergency Fund Calculator

> **Approved by Puru, 2026-11-17**, including the suggested-months rule (yellow risk).

| Field | Value |
|---|---|
| Slug | `emergency-fund-calculator` |
| Category | `personal-finance` (new: config category + hub page needed; the keyword map already has the hub entry) |
| Risk | 🟡 yellow: pure maths, but the suggested number of months is general guidance, not an official rate |
| Main keyword | `emergency fund calculator` (10K–100K/month) |
| Long-tail keywords | `emergency fund calculator for freelancers`, `how much emergency fund do i need`, `emergency savings calculator` |
| Affiliate | none for now |
| Related tools | from the keyword map: `hourly-rate-calculator`, `break-even-calculator`, `hourly-to-salary-calculator` |

## What it calculates
How big an emergency fund should be, from monthly essential costs, how steady your income is and how many people depend on you, then how far your current savings get you and how many months it will take to build the rest.

## Inputs
| Field | Type | Default | Min / Max | Notes |
|---|---|---|---|---|
| Currency | select | USD | standard list | Currency defaults below |
| Monthly essential expenses | currency | 3,000 | 0 – 100,000,000 | Helper: "Rent, food, bills, insurance, loan payments. Leave out things you'd cut in an emergency." |
| Income type | select | Steady salary | Steady salary / Variable or commission / Freelance or self-employed | Sets the suggested months |
| Dependants | number | 0 | 0 – 10 | People who rely on your income |
| Months to cover | number | (suggested) | 1 – 24 | Pre-filled from the rule below; the user can type their own |
| Saved so far | currency | 2,000 | 0 – 1,000,000,000 | |
| Monthly saving | currency | 500 | 0 – 100,000,000 | |

### Suggested months (approved)
Shown on the page as **"a common rule of thumb, not a rule"**. Never attribute it to any official body.

| Income type | Base months | Plus |
|---|---|---|
| Steady salary | 3 | +1 month per dependant |
| Variable or commission | 6 | +1 month per dependant |
| Freelance or self-employed | 6 | +1 month per dependant |

Capped at 12 months. The "Months to cover" field shows this suggestion until the user types their own number.

### Currency defaults
| Currency | Expenses · Saved · Monthly saving |
|---|---|
| USD / CAD / AUD | 3,000 · 2,000 · 500 |
| GBP / EUR | 2,000 · 1,500 · 300 |
| INR | 50,000 · 1,00,000 · 20,000 |

## Outputs
| Output | How it's shown |
|---|---|
| **Emergency fund target** | Main result |
| Months covered (and why: income type + dependants) | Breakdown |
| Still to save | Breakdown (0 when complete, with "You're covered" note) |
| Months to build it at your saving rate | Breakdown ("Add a monthly saving amount" if 0) |
| Fully funded by {Month YYYY} (review #2 B5, 2026-11-17) | Breakdown: this month (browser date) + months to build; hidden when covered or no monthly saving |
| Progress | Breakdown, % of target saved |
| Savings growth line chart (review #2 B5) | Under the split bar: balance each month (capped at target, ≤ 60 sampled points), dashed target line; hidden when nothing to build |
| "Help me add up my essentials" (review #2 B5) | Optional collapsible panel under expenses: rent or mortgage, food, utilities, insurance, transport, loan payments, other; total fills the expenses field (not in the share link) |

## Formula
```
months     = userMonths ?? min(12, baseMonths(incomeType) + dependants)
target     = expenses × months
shortfall  = max(target − saved, 0)
toBuild    = shortfall = 0 ? 0 : ceil(shortfall ÷ monthlySaving)   (none if monthlySaving = 0)
progress   = saved ÷ target
fundedBy   = this month + toBuild months (date math in lib/dates.ts monthYearAfter, not in calc.ts)
path[m]    = min(saved + monthlySaving × m, target), m = 0 … toBuild
essentials = sum of the 7 helper fields (negatives count as 0)
```

## Rates used
| Rates file | What it holds | Official source URL |
|---|---|---|
| none | | |

## Test cases (must match exactly)
| # | Inputs | Expected output | Checked against |
|---|---|---|---|
| 1 | expenses 3,000 · steady · 0 dependants · saved 2,000 · saving 500 | months 3 · **target 9,000.00** · shortfall 7,000.00 · **14 months** · progress 22.22% | Manual |
| 2 | expenses 50,000 · self-employed · 2 dependants · saved 1,00,000 · saving 20,000 | months 8 · **target 4,00,000.00** · shortfall 3,00,000.00 · **15 months** · progress 25% | Manual |
| 3 | expenses 2,000 · variable · 0 dependants · saved 15,000 · saving 300 | months 6 · **target 12,000.00** · shortfall 0.00 · covered · progress 125% | Manual |
| 4 | shortfall > 0 with monthly saving 0 | Target shown; "Add a monthly saving amount to see how long it takes"; no crash | — |
| 5 | case 1 (USD), today November 2026 | 14 months · **fully funded by January 2028** · path 2,000 → 2,500 → … → 9,000 | Manual |
| 6 | case 2 (INR), today November 2026 | 15 months · **fully funded by February 2028** | Manual |
| 7 | essentials 1,200 + 400 + 150 + 100 + 200 + 300 + 150 | **expenses 2,500** | Manual |

## Extras
- Chart: one progress bar (saved vs still to save), shared SplitBar.
- Scenario compare: no.
- Share / Print / Embed: yes.

## Content notes
- Examples: US salaried worker (case 1), Indian freelancer with two dependants (case 2), UK commission-based salesperson who is already covered (case 3).
- Freelancer angle: irregular income is why freelancers usually keep more months; link to the hourly rate calculator.
- FAQ: keyword-map questions + "What counts as an emergency?" + "Should I pay off debt or build an emergency fund first?" (neutral, no product advice).
- No specific savings accounts or interest rates (would need /rates + sources).
