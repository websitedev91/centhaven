# Tool spec: Part Time Salary Calculator

> **Draft for Puru's review (2026-11-21).** Pure maths: **gross pay only, no tax.** The full-time hours come from the user (40 is an example). The page never says how many hours "full time" legally means.

| Field | Value |
|---|---|
| Slug | `part-time-salary-calculator` |
| Category | `salary` |
| Risk | 🟢 green: pure maths (no legal hour thresholds) |
| Main keyword | `part time salary calculator` |
| Long-tail keywords | `pro rata salary calculator`, `part time pay calculator`, `fte salary calculator`, `how to calculate part time salary` |
| Affiliate | none |
| Related tools | from the keyword map: `hourly-to-salary-calculator`, `weekly-pay-calculator`, `pay-raise-calculator` |

**Overlap note:** The hourly mode uses the same maths as Hourly to Salary. This page targets the part-time search and leads with the pro-rata mode. Hourly to Salary keeps "hourly to salary".

## What it calculates
Two modes (`SegmentedControl`, URL key `mode`):
- **From a full-time salary** (`prorata`): full-time salary × (part-time hours ÷ full-time hours).
- **From an hourly wage** (`hourly`): hourly rate × hours per week × weeks per year.

Under the result: "Gross pay before tax and deductions."

## Inputs
| Field | Type | Default (example) | Min / Max | Mode | Notes |
|---|---|---|---|---|---|
| Mode | segmented | From a full-time salary | `prorata` / `hourly` | – | |
| Currency | select | USD | standard list | both | |
| Full-time annual salary | currency | 50,000 | 0 – 1,000,000,000 | prorata | Required |
| Full-time hours per week | number | 40 | 0.01 – 168 | prorata | Required. 0 → "Enter full-time hours above 0". Help: "The full-time week for this job. Example value only. Check your contract." |
| Part-time hours per week | number | 24 | 0 – 168 | prorata | Required. More than full-time hours → "Part-time hours can't be more than full-time hours" |
| Hourly rate | currency | 20 | 0 – 1,000,000 | hourly | Required |
| Hours per week | number | 20 | 0 – 168 | hourly | Required |
| Paid weeks per year | number | 52 | 0 – 53 | hourly | Required. Help: "Use fewer than 52 if some weeks are unpaid. Example value only." |

URL keys: `mode`, `currency`, `ftSalary`, `ftHours`, `ptHours`, `rate`, `hours`, `weeks`.

### Currency presets (example values; hours and weeks stay the same)
| Currency | Full-time salary | Hourly rate |
|---|---|---|
| USD / CAD / AUD | 50,000 | 20 |
| GBP / EUR | 35,000 | 15 |
| INR | 6,00,000 | 300 |

## Outputs
| Output | Mode | How it's shown |
|---|---|---|
| **Part-time yearly salary** | both | Main result |
| Share of full time | prorata | part-time ÷ full-time hours × 100, up to 2 decimals, trailing zeros dropped ("60% of full time") |
| Monthly average | both | yearly ÷ 12 |
| Weekly | both | prorata: yearly ÷ 52 · hourly: rate × hours |
| Hourly equivalent | prorata | full-time salary ÷ (full-time hours × 52). Label: "based on 52 paid weeks". Hidden when part-time hours are 0 |

## Formula
```
prorata:  share            = ptHours ÷ ftHours
          part-time salary = ftSalary × share
          weekly           = part-time salary ÷ 52
          hourly equiv.    = ftSalary ÷ (ftHours × 52)
hourly:   weekly           = rate × hours
          yearly           = weekly × weeks
both:     monthly average  = yearly ÷ 12
```

## Test cases (must match exactly)
| # | Inputs | Expected |
|---|---|---|
| 1 | prorata · 50,000 · 40 h full time · 24 h | **30,000.00** · 60% of full time · monthly 2,500.00 · weekly 576.92 · hourly 24.04 |
| 2 | prorata · 45,000 · 37.5 h · 22.5 h | **27,000.00** · 60% · monthly 2,250.00 · hourly 23.08 |
| 3 | prorata · 50,000 · 40 h · 25 h | **31,250.00** · 62.5% of full time |
| 4 | hourly · 20 × 20 h × 52 weeks | **20,800.00** · monthly 1,733.33 · weekly 400.00 |
| 5 | GBP hourly · £15 × 16 h × 46 weeks | **£11,040.00** · monthly £920.00 · weekly £240.00 |
| 6 | INR prorata · ₹6,00,000 · 40 h · 20 h | **₹3,00,000.00** · 50% · monthly ₹25,000.00 · weekly ₹5,769.23 |
| 7 | prorata · part-time hours 0 | **0.00** · 0% · hourly row hidden |
| 8 | Switch USD → GBP without editing | salary 50,000 → 35,000; rate 20 → 15; hours and weeks unchanged. A typed salary is kept |

## Edge cases
- Full-time hours 0 → field error (no ÷ 0). Part-time hours > full-time hours → field error. Equal → 100% (valid).
- Hours > 168 or weeks > 53 → field error. Weeks 0 → 0.00 (valid). Negative → field error.
- Huge values → formatted, never `e+`/NaN/Infinity.

## Quality gate 8 (UI input tests)
- Clear each required field in both modes → "Enter a number" and "—".
- 0 / negative / huge in every field → no NaN or Infinity on screen.
- Switch both modes and every currency → result updates (`hourly` mode added to `tests/ui/modes.test.tsx`).

## Extras
- Chart: no. Scenario compare: yes, Plan B = other part-time hours (for example, 24 h vs 30 h). Share / print / embed: yes.

## Content notes
- Examples: cases 1, 4, 6.
- FAQ: the 5 keyword-map questions + "Do part-timers get the same hourly rate?" (the maths gives the same rate. Your contract decides) + "What if I work different hours each week?" (use your average).
- Never state legal full-time hours, part-time thresholds, holiday or benefit rules.
