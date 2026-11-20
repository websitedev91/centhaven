# Tool spec: Payback Period Calculator

> **Approved by Puru (2026-11-20).** All test numbers verified. Pure maths: every number comes from the user.

| Field | Value |
|---|---|
| Slug | `payback-period-calculator` |
| Category | `business` |
| Risk | 🟢 green: pure maths |
| Main keyword | `payback period calculator` |
| Long-tail keywords | `how to calculate payback period`, `payback period with uneven cash flows`, `investment payback calculator` |
| Affiliate | none |
| Related tools | from the keyword map: `break-even-calculator`, `straight-line-depreciation-calculator`, `runway-calculator` |

## What it calculates
How long an investment takes to pay for itself. Two modes (`SegmentedControl`, URL key `mode`):
- **Same every year** (`even`): investment ÷ yearly cash flow.
- **Different each year** (`uneven`): up to 10 yearly cash flows; payback is found where the running total reaches the investment.

Shown as years (2 decimals) and "X years and Y months". It assumes the cash comes in evenly through each year (said under the result). Simple payback only: no discounting.

## Inputs
| Field | Type | Default (example) | Min / Max | Mode | Notes |
|---|---|---|---|---|---|
| Mode | segmented | Same every year | `even` / `uneven` | – | |
| Currency | select | USD | standard list | both | |
| Investment | currency | 50,000 | 0 – 10,000,000,000 | both | Required. Help: "What you pay up front." |
| Yearly cash flow | currency | 12,500 | 0 – 10,000,000,000 | even | Required. Help: "Extra money it brings in, or saves, each year." |
| Years | number | 5 | 1 – 10, whole | uneven | Number of cash-flow boxes shown |
| Year 1…10 cash flow | currency | 10,000 · 12,000 · 15,000 · 18,000 · 20,000 | 0 – 10,000,000,000 | uneven | Each shown box required (0 allowed). Example values |

URL keys: `mode`, `inv`, `flow`, `years`, `y1`…`y10`.

### Currency presets (example values)
| Currency | Investment | Yearly flow | Year 1–5 |
|---|---|---|---|
| USD / GBP / EUR / CAD / AUD | 50,000 | 12,500 | 10,000 · 12,000 · 15,000 · 18,000 · 20,000 |
| INR | 5,00,000 | 1,50,000 | 1,00,000 · 1,20,000 · 1,50,000 · 1,80,000 · 2,00,000 |

## Outputs
| Output | How it's shown |
|---|---|
| **Payback period** | Main result "4.00 years" + "4 years and 0 months" |
| Recovered by the end | uneven: total of all cash flows, and "{amount} more than the investment" |
| Year-by-year table | uneven (and even, for the first 10 years): year · cash flow · running total · still to recover |
| Not paid back | "Not paid back within {n} years: {total} recovered, {percent} of the investment" |
| Chart | Lazy Recharts: running total by year with a line at the investment |

## Formula
```
even:    payback = investment ÷ yearly cash flow                      (flow > 0)
uneven:  find the first year k where running total ≥ investment
         payback = (k − 1) + (investment − total after year k−1) ÷ cash flow in year k
months   = round((payback − whole years) × 12); 12 months → add a year
```

## Test cases (must match exactly)
| # | Inputs | Expected |
|---|---|---|
| 1 | even · 50,000 · 12,500 | **4.00 years** · 4 years and 0 months |
| 2 | even · 20,000 · 7,000 | **2.86 years** · 2 years and 10 months |
| 3 | uneven · 30,000 · 8,000, 10,000, 12,000, 15,000 | running 8,000 / 18,000 / 30,000 → **3.00 years** · 3 years and 0 months |
| 4 | uneven · 40,000 · 10,000, 12,000, 15,000, 18,000 | after year 3: 37,000, needs 3,000 of 18,000 → **3.17 years** · 3 years and 2 months · recovered 55,000.00 (15,000.00 more) |
| 5 | uneven · 100,000 · five years of 10,000 | **Not paid back within 5 years**: 50,000.00 recovered, 50% |
| 6 | INR even · ₹5,00,000 · ₹1,50,000 | **3.33 years** · 3 years and 4 months |
| 7 | USD uneven defaults: 50,000 · 10,000, 12,000, 15,000, 18,000, 20,000 | after year 3: 37,000; 13,000 of 18,000 → **3.72 years** · 3 years and 9 months |
| 8 | Switch USD → INR without editing | all money fields → INR presets; years unchanged. A typed value is kept |

## Edge cases
- Investment 0 → "Paid back straight away" (0 years, valid).
- Even mode, flow 0 → "Never paid back at this cash flow" + "—" (no Infinity).
- 11.96 months rounding to 12 → shown as the next whole year (e.g. "3 years and 0 months" becomes "4 years and 0 months").
- Different each year: a yearly cash flow can be negative (a loss year), down to −10,000,000,000 (Puru, 2026-11-20). Payback is the first year the running total reaches the investment. Test: 50,000 with −5,000 / 20,000 / 20,000 / 20,000 / 20,000 → running −5k, 15k, 35k, 55k → **3.75 years** (3 years and 9 months). The investment and the even-mode yearly flow can't be negative. Huge values → no NaN/Infinity.
- Durations use the shared wording (lib/duration.ts): "4 years" (not "4 years and 0 months"), "1 year", "1 month".

## Quality gate 8 (UI input tests)
- Clear each required box (investment, flow; years and every shown year box) → "Enter a number" and "—". No optional fields.
- 0 / negative / huge in every box → no NaN or Infinity on screen.
- Switch both modes and every currency → result updates (`uneven` mode added to `tests/ui/modes.test.tsx`).

## Extras
- Chart: yes (above). Scenario compare: even mode, Plan B = a different investment and cash flow. Share / print / embed: yes.

## Content notes
- Examples: cases 1, 4, 6.
- FAQ: the 5 keyword-map questions + "Should I count depreciation?" (no: payback uses cash; link to the depreciation tool) + "Does payback consider the time value of money?" (no; explain simply). "What is a good payback period?" says it depends on the business and the risk; no standard number.
