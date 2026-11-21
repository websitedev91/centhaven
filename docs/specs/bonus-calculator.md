# Tool spec: Bonus Calculator

> **Approved by Puru (2026-11-21).** Pure maths: **gross bonus only, no tax, no deductions, no withholding rules.** Every number comes from the user.

| Field | Value |
|---|---|
| Slug | `bonus-calculator` |
| Category | `salary` |
| Risk | 🟢 green: pure maths (no tax or withholding rules) |
| Main keyword | `bonus calculator` |
| Long-tail keywords | `bonus percentage calculator`, `target bonus calculator`, `how to calculate bonus percentage of salary`, `annual bonus calculator` |
| Affiliate | none |
| Related tools | from the keyword map: `commission-calculator`, `pay-raise-calculator`, `job-offer-comparison-calculator` |

**Overlap note:** Job Offer Comparison has a bonus input, but it doesn't calculate the bonus. Commission covers pay per sale. This page owns "bonus calculator", and each page links to the others.

## What it calculates
Three modes (`SegmentedControl`, URL key `mode`):
- **% of salary** (`percent`): salary × bonus %.
- **Fixed amount** (`fixed`): the user's bonus amount. The page shows it as a % of salary.
- **Target × achievement** (`target`): salary × target % × achievement %. Example: 10% target × 120% achieved = 12% of salary.

Each mode also shows total pay (salary + bonus). If the user enters a number of paychecks, the page also shows the bonus per paycheck.

Under the result: "Gross bonus before tax and deductions. The amount paid to you will be less." The page never says how bonuses are taxed or withheld.

## Inputs
| Field | Type | Default (example) | Min / Max | Mode | Notes |
|---|---|---|---|---|---|
| Mode | segmented | % of salary | `percent` / `fixed` / `target` | – | |
| Currency | select | USD | standard list | all | |
| Annual salary | currency | 60,000 | 0 – 1,000,000,000 | all | Required (total pay needs it) |
| Bonus % | % | 10 | 0 – 1,000 | percent | Required. Help: "Your own bonus %. Example value only." |
| Bonus amount | currency | 5,000 | 0 – 1,000,000,000 | fixed | Required |
| Target bonus % | % | 10 | 0 – 1,000 | target | Required. Help: "The target % in your plan. Example value only." |
| Achievement (payout) % | % | 120 | 0 – 1,000 | target | Required. Help: "The % of target your plan pays out. Some plans pay a different % than you achieved, so use the payout % if it differs." |
| Spread over paychecks (optional) | number, whole | 0 (lump sum; Puru, 2026-11-21) | 1 – 365 | all | `optional`; empty or 0 = paid as one lump sum, and the per-paycheck rows are hidden. Help: "Only if your bonus is split across paychecks." |

URL keys: `mode`, `currency`, `salary`, `pct`, `amount`, `target`, `ach`, `checks`.

### Currency presets (example values; percentages and paychecks stay the same)
| Currency | Salary | Bonus amount |
|---|---|---|
| USD / CAD / AUD | 60,000 | 5,000 |
| GBP / EUR | 40,000 | 3,000 |
| INR | 12,00,000 | 1,00,000 |

## Outputs
| Output | Mode | How it's shown |
|---|---|---|
| **Bonus (gross)** | all | Main result |
| Bonus as % of salary | fixed, target | up to 2 decimals, trailing zeros dropped ("8.33%", "12%"). Hidden when salary is 0 |
| Total pay for the year | all | salary + bonus |
| Bonus per paycheck | checks > 0 | bonus ÷ checks ("Spread over 12 paychecks") |
| Pay per paycheck with the bonus | checks > 0 | (salary + bonus) ÷ checks. Label: "If your salary is paid over the same 12 paychecks" |

## Formula
```
percent:  bonus = salary × bonus% ÷ 100
fixed:    bonus = amount                 bonus% of salary = amount ÷ salary × 100
target:   bonus = salary × target% ÷ 100 × achievement% ÷ 100
          effective % = target% × achievement% ÷ 100

total pay              = salary + bonus
bonus per paycheck     = bonus ÷ checks
pay per paycheck       = (salary + bonus) ÷ checks
```

## Test cases (must match exactly)
| # | Inputs | Expected |
|---|---|---|
| 1 | percent · 60,000 × 10% | **bonus 6,000.00** · total pay 66,000.00 · per-paycheck rows hidden |
| 2 | target · 60,000 × 10% × 120% | **bonus 7,200.00** · 12% of salary · total pay 67,200.00 |
| 3 | fixed · 5,000 on 60,000 | **bonus 5,000.00** · 8.33% of salary · total pay 65,000.00 |
| 4 | percent · 60,000 × 10% · spread over 12 | bonus 6,000.00 · **500.00 per paycheck** · pay per paycheck 5,500.00 |
| 5 | INR target · ₹12,00,000 × 10% × 120% · spread over 26 | **₹1,44,000.00** · 12% · total ₹13,44,000.00 · **₹5,538.46 per paycheck** · pay per paycheck ₹51,692.31 |
| 6 | GBP fixed · £3,000 on £40,000 | **£3,000.00** · 7.5% of salary · total £43,000.00 |
| 7 | target · 60,000 × 10% × 0% | bonus **0.00** · 0% · total pay 60,000.00 |
| 8 | Switch USD → GBP without editing | salary 60,000 → 40,000; amount 5,000 → 3,000; percentages unchanged. A typed salary is kept |

## Edge cases
- Salary 0 → bonus 0.00 in percent/target modes (valid). In fixed mode the "% of salary" row is hidden (no ÷ 0).
- Any % over 1,000 → field error. Negative → field error. Achievement 0 → bonus 0.00 (valid).
- Paychecks: decimals or more than 365 → field error. Empty / 0 → lump sum.
- Huge values → formatted, never `e+`/NaN/Infinity.

## Quality gate 8 (UI input tests)
- Clear each required field in every mode → "Enter a number" and "—". Clear paychecks (optional) → valid, so the bonus is paid as a lump sum.
- 0 / negative / huge in every field → no NaN or Infinity on screen.
- Switch all three modes and every currency → result updates (`fixed` and `target` modes added to `tests/ui/modes.test.tsx`).

## Extras
- Chart: no. Scenario compare: yes, Plan B = another bonus % or achievement % (for example, 100% vs 120% achieved). Share / print / embed: yes.

## Content notes
- Examples: cases 1, 2, 5.
- FAQ: the 5 keyword-map questions + "What if my plan caps the bonus?" (enter the capped payout %; we don't know your plan) + "Can I compare two achievement levels?" (Plan B).
- No tax rates, no "supplemental withholding" rules, no typical bonus percentages.
