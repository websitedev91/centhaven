# Tool spec: Biweekly Pay Calculator

> **Approved by Puru (2026-11-20).** All test numbers verified. Pure maths: **gross pay only, no tax, no deductions.** Every number comes from the user.

| Field | Value |
|---|---|
| Slug | `biweekly-pay-calculator` |
| Category | `salary` |
| Risk | 🟢 green: pure maths (no tax or deduction rules) |
| Main keyword | `biweekly pay calculator` |
| Long-tail keywords | `biweekly salary calculator`, `hourly to biweekly pay`, `biweekly vs semi-monthly pay` |
| Affiliate | none |
| Related tools | from the keyword map: `hourly-to-salary-calculator`, `pay-raise-calculator`, `job-offer-comparison-calculator` |

**Overlap note:** the Hourly to Salary Calculator already shows a bi-weekly figure. This page targets a different primary keyword and goes deeper (26 vs 27 pay days, semi-monthly comparison, overtime per pay period); each page links to the other.

## What it calculates
Two modes (`SegmentedControl`, URL key `mode`):
- **From a salary** (`salary`): annual salary ÷ 26.
- **From an hourly wage** (`hourly`): hourly rate × hours per week × 2, plus optional overtime hours per pay period × the user's own overtime rate.

The 26 / 27 note is maths only: "A year has 52 weeks and 1 or 2 extra days, so paydays every two weeks fall 26 times in most years and 27 in some." The tool never says which years, and never says how an employer handles a 27th payday; it shows both results.

Under the result: "Gross pay before tax and deductions. Your payslip will show less."

## Inputs
| Field | Type | Default (example) | Min / Max | Mode | Notes |
|---|---|---|---|---|---|
| Mode | segmented | From a salary | `salary` / `hourly` | – | |
| Currency | select | USD | standard list | both | |
| Annual salary | currency | 52,000 | 0 – 1,000,000,000 | salary | Required |
| Hourly rate | currency | 25 | 0 – 1,000,000 | hourly | Required |
| Hours per week | number | 40 | 0 – 168 | hourly | Required |
| Overtime hours per pay period (optional) | number | 0 | 0 – 336 | hourly | `optional`, 0 = off |
| Overtime hourly rate (optional) | currency | 0 | 0 – 1,000,000 | hourly | `optional`; shown when overtime hours > 0. Help: "Your own overtime rate. Example values only." No multiplier is suggested |

URL keys: `mode`, `salary`, `rate`, `hours`, `otH`, `otRate`.

### Currency presets (example values; hours stay the same)
| Currency | Salary | Hourly rate |
|---|---|---|
| USD / CAD / AUD | 52,000 | 25 |
| GBP / EUR | 36,000 | 18.50 |
| INR | 12,00,000 | 600 |

## Outputs
| Output | How it's shown |
|---|---|
| **Biweekly gross pay** | Main result |
| Yearly gross | salary mode: the salary · hourly: biweekly × 26 |
| In a 27-payday year | salary mode: "If your salary is split over 27 paydays: {salary ÷ 27} each" · hourly mode: "27 paydays: {biweekly × 27} for the year" |
| Semi-monthly comparison | "Paid twice a month (24 paydays): {yearly ÷ 24}" |
| Monthly average | yearly ÷ 12 |
| Weekly | biweekly ÷ 2 |
| Overtime | hourly mode, overtime > 0: "Overtime: {otH × otRate} per pay period" |

## Formula
```
salary mode:  biweekly = salary ÷ 26        yearly = salary
              27-payday split = salary ÷ 27
hourly mode:  biweekly = rate × hours × 2 + overtimeHours × overtimeRate
              yearly   = biweekly × 26       27-payday year = biweekly × 27
both:         semi-monthly = yearly ÷ 24     monthly average = yearly ÷ 12     weekly = biweekly ÷ 2
```

## Test cases (must match exactly)
| # | Inputs | Expected |
|---|---|---|
| 1 | salary 52,000 | **biweekly 2,000.00** · 27-payday split 1,925.93 · semi-monthly 2,166.67 · monthly average 4,333.33 · weekly 1,000.00 |
| 2 | hourly 25 × 40 h | **biweekly 2,000.00** · yearly 52,000.00 · 27-payday year 54,000.00 |
| 3 | hourly 25 × 40 h · overtime 4 h at 37.50 | overtime 150.00 · **biweekly 2,150.00** · yearly 55,900.00 |
| 4 | INR salary ₹12,00,000 | **₹46,153.85** · 27-payday split ₹44,444.44 · semi-monthly ₹50,000.00 · monthly ₹1,00,000.00 |
| 5 | GBP hourly £18.50 × 37.5 h | **£1,387.50** · yearly £36,075.00 |
| 6 | Switch USD → GBP without editing | salary 52,000 → 36,000; rate 25 → 18.50; hours unchanged. A typed salary is kept |

## Edge cases
- Salary 0 / rate 0 / hours 0 → 0.00 everywhere (valid). Hours > 168 → field error.
- Overtime hours > 0 with rate 0 → overtime 0.00 (valid, row says "Add your overtime rate").
- Negative → field error. Huge values → formatted, never `e+`/NaN.

## Quality gate 8 (UI input tests)
- Clear each required field (salary; rate, hours) → "Enter a number" and "—". Clear overtime hours / rate (optional) → valid.
- 0 / negative / huge in every field → no NaN or Infinity on screen.
- Switch both modes and every currency → result updates (`hourly` mode with overtime added to `tests/ui/modes.test.tsx`).

## Extras
- Chart: no. Scenario compare: no. Share / print / embed: yes.

## Content notes
- Examples: cases 1, 2, 4.
- FAQ: the 5 keyword-map questions + "Why is my paycheck smaller than this?" (tax and deductions; we don't calculate them, check your payslip or employer) + "What if I'm paid every week?" (weekly = biweekly ÷ 2). No tax rates, no named tax rules, no statement about which years have 27 paydays.
