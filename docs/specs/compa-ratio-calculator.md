# Tool spec: Compa Ratio Calculator

> **Approved by Puru (2026-11-20).** Pure maths: every number comes from the user (their own salary and their employer's pay range).

| Field | Value |
|---|---|
| Slug | `compa-ratio-calculator` |
| Category | `salary` |
| Risk | 🟢 green: pure maths (no market pay data) |
| Main keyword | `compa ratio calculator` |
| Long-tail keywords | `salary midpoint calculator`, `range penetration calculator`, `how to calculate compa ratio`, `salary range position calculator` |
| Affiliate | none |
| Related tools | from the keyword map: `pay-raise-calculator`, `job-offer-comparison-calculator`, `hourly-to-salary-calculator` |

## What it calculates
Where a salary sits in a pay range:
- **Compa ratio** = salary ÷ midpoint (shown as a ratio, 0.96, and a percentage, 96%).
- **Midpoint** = (range minimum + range maximum) ÷ 2, or a midpoint the user enters (`SegmentedControl`, URL key `mid`: `range` / `own`).
- **Range penetration** = (salary − minimum) ÷ (maximum − minimum) × 100.

Never says what ratio or penetration is "good", "fair", "low" or "high", and never suggests a market midpoint. Position words are factual only: "below the midpoint", "at the midpoint", "above the midpoint", "below the bottom of the range", "above the top of the range".

## Inputs
| Field | Type | Default (example) | Min / Max | Mode | Notes |
|---|---|---|---|---|---|
| Midpoint from | segmented | The range | `range` / `own` | – | |
| Currency | select | USD | standard list | both | |
| Salary | currency | 72,000 | 0 – 1,000,000,000 | both | Required. Help: "The salary you're checking: yours, an offer or an employee's." |
| Range minimum | currency | 60,000 | 0 – 1,000,000,000 | `range`: required · `own`: optional | Help: "From the pay band or job posting. Example values only." |
| Range maximum | currency | 90,000 | 0 – 1,000,000,000 | `range`: required · `own`: optional | Must be above the minimum → "Maximum must be above the minimum" |
| Midpoint | currency | 75,000 | 0.01 – 1,000,000,000 | `own` | Required. 0 → "Enter a midpoint above 0" |

In `own` mode, minimum and maximum are optional: range penetration shows only when both are entered and maximum > minimum; otherwise the row says "Add the range minimum and maximum to see range penetration".

URL keys: `mid`, `currency`, `salary`, `min`, `max`, `midpoint`.

### Currency presets (example values)
| Currency | Salary | Minimum | Maximum | Own midpoint |
|---|---|---|---|---|
| USD / CAD / AUD | 72,000 | 60,000 | 90,000 | 75,000 |
| GBP / EUR | 45,000 | 40,000 | 56,000 | 48,000 |
| INR | 12,00,000 | 10,00,000 | 15,00,000 | 12,50,000 |

## Outputs
| Output | How it's shown |
|---|---|
| **Compa ratio** | Main result "0.96" (2 decimals) + "96% of the midpoint" (up to 2 decimals) |
| Midpoint | money; note "Halfway between {min} and {max}" or "The midpoint you entered" |
| Difference from the midpoint | "{x} below the midpoint" / "{x} above the midpoint" / "At the midpoint" |
| Range penetration | "40%" + note "How far the salary is from the bottom of the range to the top" |
| Range position | Marker on a `SplitBar`-style range bar: minimum → midpoint → maximum, with the salary marked (hidden when the salary is outside the range; the position words say so) |

## Formula
```
midpoint          = (minimum + maximum) ÷ 2          (or the user's own midpoint)
compa ratio       = salary ÷ midpoint
range penetration = (salary − minimum) ÷ (maximum − minimum) × 100
difference        = salary − midpoint
```

## Test cases (must match exactly)
| # | Inputs | Expected |
|---|---|---|
| 1 | USD defaults: 72,000 · 60,000–90,000 | midpoint **75,000.00** · compa ratio **0.96** (96%) · penetration **40%** · **3,000.00 below the midpoint** |
| 2 | own midpoint 80,000 · salary 88,000 · range 60,000–90,000 | **1.10** (110%) · penetration **93.33%** · 8,000.00 above the midpoint |
| 3 | 95,000 · 60,000–90,000 | **1.27** (126.67%) · penetration **116.67%** · "above the top of the range" |
| 4 | 55,000 · 60,000–90,000 | **0.73** (73.33%) · penetration **−16.67%** · "below the bottom of the range" |
| 5 | GBP defaults: 45,000 · 40,000–56,000 | midpoint **48,000.00** · **0.94** (93.75%) · penetration **31.25%** |
| 6 | INR defaults: ₹12,00,000 · ₹10,00,000–₹15,00,000 | midpoint **₹12,50,000.00** · **0.96** (96%) · penetration **40%** |
| 7 | own midpoint, no range (min 0, max 0) | compa ratio shown; penetration row asks for the range |
| 8 | range · max 60,000, min 60,000 | field error "Maximum must be above the minimum" + "—" |
| 9 | Switch USD → GBP without editing | all money fields → GBP presets. A typed salary is kept |

## Edge cases
- Salary 0 → compa ratio 0.00, penetration of the range from its minimum (valid).
- Midpoint 0 (own) → field error (no ÷ 0). Range with max ≤ min → field error on maximum.
- Negative → field error. Huge values → formatted, never `e+`/NaN/Infinity.

## Quality gate 8 (UI input tests)
- Clear each required box in both modes → "Enter a number" and "—". In `own` mode, clear minimum/maximum (optional) → valid.
- 0 / negative / huge in every box → no NaN or Infinity on screen.
- Switch both midpoint modes and every currency → result updates (`own` mode added to `tests/ui/modes.test.tsx`).

## Extras
- Chart: range bar (plain HTML/CSS, like `SplitBar`). Scenario compare: yes, Plan B = another salary in the same range (e.g. after a raise). Share / print / embed: yes.

## Content notes
- Examples: cases 1, 3, 6.
- FAQ: the 5 keyword-map questions + "Where do I find my pay range?" (pay band documents, job postings, HR; never quote market data) + "Can I use it for an hourly wage?" (yes: use hourly figures for salary, minimum and maximum; the ratio is the same).
- "What is a good compa ratio?" answers that it depends on the employer's own pay policy, experience and performance; the calculator shows where a salary sits, not what it should be. No figure.
- Tips: check the same pay period on all numbers; link to Pay Raise (what a raise does to the ratio) and Job Offer Comparison.
