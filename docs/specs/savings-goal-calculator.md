# Tool spec: Savings Goal Calculator

> **Draft — waiting for Puru's review.** Pure maths: the interest rate is optional and always the user's own.

| Field | Value |
|---|---|
| Slug | `savings-goal-calculator` |
| Category | `personal-finance` |
| Risk | 🟢 green: pure maths |
| Main keyword | `savings goal calculator` |
| Long-tail keywords | `how much to save per month`, `monthly savings calculator`, `savings plan calculator` |
| Affiliate | none |
| Related tools | from the keyword map: `emergency-fund-calculator`, `pay-raise-calculator`, `hourly-to-salary-calculator` |

## What it calculates
How much to save each month to reach a goal in a set number of months, after what you've already saved, with an optional interest % you enter (compounded monthly, deposits at the end of each month). Shows the target month ("Goal reached by {Month YYYY}", browser date, like the emergency fund tool) and links to the Emergency Fund calculator.

## Inputs
| Field | Type | Default (example) | Min / Max | Notes |
|---|---|---|---|---|
| Currency | select | USD | standard list | Presets below |
| Savings goal | currency | 10,000 | 1 – 1,000,000,000 | |
| Already saved | currency | 0 | 0 – 1,000,000,000 | |
| Months to reach it | number | 24 | 1 – 600 | |
| Interest % a year (optional) | % input | 0 | 0 – 20 | Help: "Optional. Use your account's rate, or leave at 0." Never suggested |

### Currency presets (example values)
| Currency | Goal |
|---|---|
| USD / GBP / EUR / CAD / AUD | 10,000 |
| INR | 5,00,000 |

## Outputs
**Monthly saving needed** · total you put in · interest earned (only when interest > 0) · already-saved value at the goal date · goal month.

## Formula
```
r = interest% ÷ 12 ; n = months
startGrows = saved × (1 + r)^n
need       = goal − startGrows
monthly    = need ÷ n                         (r = 0)
monthly    = need × r ÷ ((1 + r)^n − 1)       (r > 0)
contributions = monthly × n ; interest = goal − saved − contributions
```

## Test cases
| # | Inputs | Expected |
|---|---|---|
| 1 | goal $10,000 · saved 0 · 24 months · 0% | **$416.67 a month** · contributions $10,000.00 |
| 2 | goal $10,000 · saved $2,000 · 12 months · 0% | **$666.67 a month** |
| 3 | goal $10,000 · saved 0 · 24 months · 4% | **$400.92 a month** · contributions $9,621.98 · interest $378.02 |
| 4 | goal $20,000 · saved $5,000 · 36 months · 5% | saved grows to $5,807.36 · **$366.23 a month** · contributions $13,184.28 · interest $1,815.72 |
| 5 | goal ₹5,00,000 · saved ₹1,00,000 · 20 months · 0% | **₹20,000.00 a month** |

## Edge cases
- Already saved ≥ goal (or grows past it with interest) → monthly 0 with "You've already reached your goal."
- Months 0 or negative → field error "Minimum is 1 month". Goal 0 → field error.
- Negative saved / interest → field error. Interest above 20% → field error.

## Extras
Chart: savings growth line to the goal (lazy Recharts, like the emergency fund tool). Scenario compare: Plan B = different months. Share / print / embed: yes.

## Content notes
Mention: "Saving for emergencies first? Use the Emergency Fund calculator" (ToolLink). No savings-rate statistics, no suggested interest rates.
