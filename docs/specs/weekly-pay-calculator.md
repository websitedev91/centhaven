# Tool spec: Weekly Pay Calculator

> **Draft — waiting for Puru's review.** Pure maths: **gross pay only, no tax, no deductions.** Every number comes from the user.

| Field | Value |
|---|---|
| Slug | `weekly-pay-calculator` |
| Category | `salary` |
| Risk | 🟢 green: pure maths (no tax or deduction rules) |
| Main keyword | `weekly pay calculator` |
| Long-tail keywords | `weekly salary calculator`, `hourly to weekly pay`, `how much is my weekly pay` |
| Affiliate | none |
| Related tools | from the keyword map: `biweekly-pay-calculator`, `hourly-to-salary-calculator`, `pay-raise-calculator` |

**Overlap note:** Hourly to Salary already shows a weekly figure and Biweekly Pay shows weekly as a line. This page targets "weekly pay calculator" and goes deeper (overtime per week, 52 vs 53 paydays). Each page links to the others. Built on the Biweekly Pay tool's pattern.

## What it calculates
Two modes (`SegmentedControl`, URL key `mode`), same as Biweekly Pay:
- **From a salary** (`salary`): annual salary ÷ 52.
- **From an hourly wage** (`hourly`): hourly rate × hours per week, plus optional overtime hours per week × the user's own overtime rate.

The 52 / 53 note is maths only: "A year has 52 weeks and 1 or 2 extra days, so weekly paydays fall 52 times in most years and 53 in some." Never says which years or how an employer handles it.

Under the result: "Gross pay before tax and deductions. Your payslip will show less."

## Inputs
| Field | Type | Default (example) | Min / Max | Mode | Notes |
|---|---|---|---|---|---|
| Mode | segmented | From a salary | `salary` / `hourly` | – | |
| Currency | select | USD | standard list | both | |
| Annual salary | currency | 52,000 | 0 – 1,000,000,000 | salary | Required |
| Hourly rate | currency | 25 | 0 – 1,000,000 | hourly | Required |
| Hours per week | number | 40 | 0 – 168 | hourly | Required |
| Overtime hours per week (optional) | number | 0 | 0 – 168 | hourly | `optional`, 0 = off |
| Overtime hourly rate (optional) | currency | 0 | 0 – 1,000,000 | hourly | `optional`; shown when overtime hours > 0. Help: "Your own overtime rate. Example values only." No multiplier suggested |

URL keys: `mode`, `currency`, `salary`, `rate`, `hours`, `otH`, `otRate`.

### Currency presets (same as Biweekly Pay; hours stay the same)
| Currency | Salary | Hourly rate |
|---|---|---|
| USD / CAD / AUD | 52,000 | 25 |
| GBP / EUR | 36,000 | 18.50 |
| INR | 12,00,000 | 600 |

## Outputs
| Output | How it's shown |
|---|---|
| **Weekly gross pay** | Main result |
| Overtime | hourly mode, overtime > 0: "{otH × otRate} a week" ("Add your overtime rate" when the rate is 0) |
| Yearly gross | salary mode: the salary · hourly: weekly × 52 |
| In a 53-payday year | salary: "If your salary is split over 53 paydays, each" = salary ÷ 53 · hourly: weekly × 53 for the year |
| Biweekly | weekly × 2 |
| Monthly average | yearly ÷ 12 |

## Formula
```
salary mode:  weekly = salary ÷ 52          yearly = salary
              53-payday split = salary ÷ 53
hourly mode:  weekly = rate × hours + overtimeHours × overtimeRate
              yearly = weekly × 52          53-payday year = weekly × 53
both:         biweekly = weekly × 2         monthly average = yearly ÷ 12
```

## Test cases (must match exactly)
| # | Inputs | Expected |
|---|---|---|
| 1 | salary 52,000 | **weekly 1,000.00** · 53-payday split 981.13 · biweekly 2,000.00 · monthly average 4,333.33 |
| 2 | hourly 25 × 40 h | **1,000.00** · yearly 52,000.00 · 53-payday year 53,000.00 |
| 3 | hourly 25 × 40 h · overtime 5 h at 37.50 | overtime **187.50** · **weekly 1,187.50** · yearly 61,750.00 · biweekly 2,375.00 · monthly 5,145.83 |
| 4 | INR salary ₹12,00,000 | **₹23,076.92** · biweekly ₹46,153.85 · monthly ₹1,00,000.00 |
| 5 | GBP hourly £18.50 × 37.5 h | **£693.75** · yearly £36,075.00 |
| 6 | Switch USD → GBP without editing | salary 52,000 → 36,000; rate 25 → 18.50; hours unchanged. A typed salary is kept |

Case 4's biweekly figure matches the Biweekly Pay tool (₹46,153.85), so the two pages agree.

## Edge cases
- Salary 0 / rate 0 / hours 0 → 0.00 everywhere (valid). Hours > 168 → field error. Overtime hours > 168 − hours is allowed (the user's own week), max 168.
- Overtime hours > 0 with rate 0 → overtime 0.00 (valid, row says "Add your overtime rate").
- Negative → field error. Huge values → formatted, never `e+`/NaN.

## Quality gate 8 (UI input tests)
- Clear each required field (salary; rate, hours) → "Enter a number" and "—". Clear overtime hours / rate (optional) → valid.
- 0 / negative / huge in every field → no NaN or Infinity on screen.
- Switch both modes and every currency → result updates (`hourly` mode with overtime added to `tests/ui/modes.test.tsx`).

## Extras
- Chart: no. Scenario compare: no. Share / print / embed: yes.

## Content notes
- Examples: cases 1, 3, 4.
- FAQ: the 5 keyword-map questions + "Why is my paycheck smaller than this?" (tax and deductions; we don't calculate them) + "What if I'm paid every two weeks?" (link to Biweekly Pay).
- No tax rates, no named tax rules, no statement about which years have 53 paydays.
