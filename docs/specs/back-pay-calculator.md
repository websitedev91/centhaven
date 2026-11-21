# Tool spec: Back Pay Calculator

> **Approved by Puru (2026-11-21).** Pure maths: **gross pay only.** Every number comes from the user. The page never mentions legal rights, deadlines, interest, penalties or how to claim back pay.

| Field | Value |
|---|---|
| Slug | `back-pay-calculator` |
| Category | `salary` |
| Risk | 🟢 green: pure maths (no legal rules, no interest, no tax) |
| Main keyword | `back pay calculator` |
| Long-tail keywords | `retro pay calculator`, `how to calculate back pay`, `back pay for a pay raise`, `missed pay calculator` |
| Affiliate | none |
| Related tools | from the keyword map: `pay-raise-calculator`, `weekly-pay-calculator`, `hourly-to-salary-calculator` |

## What it calculates
Three modes (`SegmentedControl`, URL key `mode`):
- **Hourly raise paid late** (`rate`): (new hourly rate − old hourly rate) × hours per week × weeks owed.
- **Salary raise paid late** (`salary`, added by Puru 2026-11-21): (new yearly salary − old yearly salary) ÷ 52 × weeks owed.
- **Missed pay** (`missed`): amount per pay period × pay periods missed.

Under the result: "Gross amount before tax and deductions." Nothing about entitlement, time limits, interest or claims.

## Inputs
| Field | Type | Default (example) | Min / Max | Mode | Notes |
|---|---|---|---|---|---|
| Mode | segmented | Raise paid late | `rate` / `missed` | – | |
| Currency | select | USD | standard list | both | |
| Old hourly rate | currency | 20 | 0 – 1,000,000 | rate | Required |
| New hourly rate | currency | 22 | 0 – 1,000,000 | rate | Required. Below the old rate → "New rate must be at least the old rate" |
| Hours per week | number | 40 | 0 – 168 | rate | Required |
| Old yearly salary | currency | 50,000 | 0 – 1,000,000,000 | salary | Required |
| New yearly salary | currency | 55,000 | 0 – 1,000,000,000 | salary | Required. Below the old salary → "New salary must be at least the old salary" |
| Weeks owed | number | 12 | 0 – 520 | rate, salary | Required. Decimals allowed (e.g. 12.5). Help: "Weeks between when the new rate should have started and when it did. Example value." |
| Pay period | select | Every 2 weeks | week / 2 weeks / half month / month | missed | A label only ("per 2-week pay period"); no maths changes |
| Pay per period | currency | 1,500 | 0 – 1,000,000,000 | missed | Required. Help: "Gross pay for one period. Example value." |
| Pay periods missed | number | 3 | 0 – 1,000 | missed | Required. Decimals allowed ("use 0.5 for half a period") |

URL keys: `mode`, `currency`, `oldRate`, `newRate`, `hours`, `weeks`, `oldSalary`, `newSalary`, `period`, `amount`, `periods`.

### Currency presets (example values; hours, weeks and periods stay the same)
| Currency | Old rate | New rate | Pay per period |
|---|---|---|---|
| USD / CAD / AUD | 20 | 22 | 1,500 |
| GBP / EUR | 15 | 16.50 | 1,200 |
| INR | 300 | 330 | 25,000 |

## Outputs
| Output | Mode | How it's shown |
|---|---|---|
| **Back pay (gross)** | both | Main result |
| Difference per hour | rate | new − old |
| Difference per week | rate | (new − old) × hours |
| Pay per period | missed | the amount, with the period label |
| Periods missed | missed | "3 periods of 2 weeks" |

## Formula
```
rate:    back pay = (new rate − old rate) × hours per week × weeks owed
         per week = (new rate − old rate) × hours per week
missed:  back pay = pay per period × periods missed
```

## Test cases (must match exactly)
| # | Inputs | Expected |
|---|---|---|
| 1 | rate · 20 → 22 · 40 h · 12 weeks | **960.00** · 2.00 per hour · 80.00 per week |
| 2 | rate · 18.50 → 19.75 · 37.5 h · 26 weeks | **1,218.75** · 1.25 per hour · 46.88 per week |
| 3 | missed · 1,500 × 3 | **4,500.00** |
| 4 | missed · 2,250 × 2.5 | **5,625.00** |
| 5 | INR rate · ₹300 → ₹330 · 40 h · 12 weeks | **₹14,400.00** · ₹1,200.00 per week |
| 6 | INR missed · ₹25,000 × 3 | **₹75,000.00** |
| 7 | GBP rate · £15 → £16.50 · 40 h · 12 weeks | **£720.00** |
| 8 | rate · new = old (20 → 20) | **0.00** (valid) |
| 8b | salary · 50,000 → 55,000 · 10 weeks (Puru, 2026-11-21) | **961.54** · 5,000.00 a year · 96.15 a week |
| 8c | INR salary · ₹6,00,000 → ₹6,60,000 · 12 weeks | **₹13,846.15** |
| 9 | Switch USD → INR without editing | rates 20 / 22 → 300 / 330; amount 1,500 → 25,000; hours, weeks, periods unchanged. A typed rate is kept |

## Edge cases
- New rate below old → field error on new rate. Hours > 168, weeks > 520, periods > 1,000 → field error. Weeks / periods / hours 0 → 0.00 (valid).
- Negative → field error. Huge values → formatted, never `e+`/NaN/Infinity.
- Pay period select only changes words, never the number.

## Quality gate 8 (UI input tests)
- Clear each required box in both modes → "Enter a number" and "—".
- 0 / negative / huge in every box → no NaN or Infinity on screen.
- Switch both modes, every pay period and every currency → result updates (`missed` mode added to `tests/ui/modes.test.tsx`).

## Extras
- Chart: no. Scenario compare: no. Share / print / embed: yes.

## Content notes
- Examples: cases 1, 3, 5.
- FAQ: the 5 keyword-map questions + "What if my hours changed during that time?" (work out each stretch separately and add them up) + "Can I use it for a salary?" (divide the yearly difference by 52 for a weekly figure, then use weeks owed).
- Never mention legal rights, deadlines, interest, penalties, unions, tribunals or how to claim. "Back pay" is described as a sum of money, nothing more.
