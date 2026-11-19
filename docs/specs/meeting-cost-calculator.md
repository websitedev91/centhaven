# Tool spec: Meeting Cost Calculator

> **Approved by Puru, 2026-11-19** (all test numbers verified). Help text approved. Pure maths: every number comes from the user.

| Field | Value |
|---|---|
| Slug | `meeting-cost-calculator` |
| Category | `business` |
| Risk | 🟢 green: pure maths |
| Main keyword | `meeting cost calculator` |
| Long-tail keywords | `cost of a meeting calculator`, `how much does a meeting cost`, `recurring meeting cost` |
| Affiliate | none |
| Related tools | from the keyword map: `utilization-rate-calculator`, `hourly-to-salary-calculator`, `break-even-calculator` |

## What it calculates
The cost of one meeting: **people × hourly cost × hours**. Optionally enter a rate for each person instead of one average. If the meeting repeats, it shows the weekly and yearly cost.

The hourly cost is the user's own number. Help text: "Hourly pay, or pay plus other employment costs if you know them." The tool never suggests an overhead % or an average wage.

## Inputs
| Field | Type | Default (example) | Min / Max | Mode | Notes |
|---|---|---|---|---|---|
| Rates | segmented | Same rate for everyone | `same` / `each` | – | URL key `mode` |
| Currency | select | USD | standard list | both | |
| Number of people | number | 6 | 1 – 10,000, whole | same | Required |
| Hourly cost per person | currency | 50 | 0 – 1,000,000 | same | Required |
| People and rates | rows ("Person 1", "Person 2"… + hourly cost) | 4 rows: 80 · 60 · 45 · 45 | 1 – 20 rows; rate 0 – 1,000,000 | each | Add (copies the last rate) / remove row (min 1). Each rate required. No name boxes: names would end up in share links and analytics URLs |
| Length | number (minutes) | 60 | 1 – 1,440, whole | both | Required |
| Repeats | segmented | One-off | `once` / `repeats` | both | URL key `rep` |
| Meetings per week | number | 1 | 0.25 – 50, 2 decimals | repeats | Help: "0.5 = every two weeks, 5 = every weekday." |
| Weeks a year it runs | number | 48 | 1 – 52, whole | repeats | Example value, labelled |

URL keys: `mode`, `people`, `rate`, `rows`, `r1`…`r20`, `min`, `rep`, `perWeek`, `weeks`; Plan B `b_people`, `b_min`.

### Currency presets (example values; counts and times stay the same)
| Currency | Hourly cost | Per-person rows |
|---|---|---|
| USD / CAD / AUD | 50 | 80 · 60 · 45 · 45 |
| GBP / EUR | 40 | 65 · 50 · 35 · 35 |
| INR | 800 | 1,500 · 1,000 · 700 · 700 |

## Outputs
| Output | How it's shown |
|---|---|
| **Cost of this meeting** | Main result |
| Cost per minute | Breakdown |
| Person-hours | "{people × hours} person-hours" (1 decimal) |
| Each person's share | `each` mode: table of rows with their cost |
| Weekly cost | repeats: per meeting × meetings per week |
| **Yearly cost** | repeats: weekly × weeks a year |

## Formula
```
hours       = minutes ÷ 60
hourlyTotal = same: people × rate        each: sum(rates)
meetingCost = hourlyTotal × hours
perMinute   = hourlyTotal ÷ 60
personHours = (same: people · each: rows) × hours
weekly      = meetingCost × meetingsPerWeek
yearly      = weekly × weeksPerYear
```

## Test cases (must match exactly)
| # | Inputs | Expected |
|---|---|---|
| 1 | same · 6 people · 50/h · 60 min · one-off | **300.00** · 5.00 per minute · 6.0 person-hours |
| 2 | same · 8 people · 75/h · 45 min · 1/week · 48 weeks | **450.00** · weekly 450.00 · **yearly 21,600.00** |
| 3 | each · 120, 80, 60, 60, 40 · 30 min · 5/week · 48 weeks | hourly total 360 · **180.00** · weekly 900.00 · **yearly 43,200.00** |
| 4 | INR · same · 10 people · ₹800 · 90 min · 2/week · 50 weeks | **₹12,000.00** · weekly ₹24,000.00 · **yearly ₹12,00,000.00** |
| 5 | same · 4 people · 40/h · 60 min · 0.5/week · 52 weeks | 160.00 · weekly 80.00 · **yearly 4,160.00** |
| 6 | Switch USD → GBP without editing | rate 50 → 40; rows 80/60/45/45 → 65/50/35/35; people, minutes, weeks unchanged. A typed rate is kept |

## Edge cases
- People 0 or decimal → field error. Minutes 0 → field error "Enter at least 1 minute".
- Rate 0 → cost 0.00 (valid). In `each` mode an empty row rate → "Enter a number" on that row + "—"; removing the last row is not allowed.
- Negative → field error. Huge values (10,000 people × 1,000,000 × 1,440 min) → formatted, never `e+`/NaN.

## Quality gate 8 (UI input tests)
- Clear each required field (people, rate, each row rate, minutes, meetings per week, weeks) → "Enter a number" and "—".
- No optional number fields (repeat fields are hidden in one-off mode).
- 0 / negative / huge in every field → no NaN or Infinity on screen.
- Switch both rate modes, both repeat modes and every currency → result updates.

## Extras
- Chart: no (`SplitBar` of each person's share in `each` mode). Scenario compare: yes, Plan B = a different number of people and length, at plan A's average hourly cost per person (works in both modes). Share / print / embed: yes.

## Content notes
- Examples: case 2 (weekly team meeting), case 3 (daily stand-up with mixed rates), case 4 (Indian office review).
- FAQ: the 5 keyword-map questions + "Should I use salary or hourly pay?" (link to hourly-to-salary) + "Does this include lost focus time?" (no; it counts meeting time only). No statistics on how many hours people spend in meetings.
- Tips: cut 60 → 45 minutes and show the yearly saving; invite only who is needed; send notes instead.
