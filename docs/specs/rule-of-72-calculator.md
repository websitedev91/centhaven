# Tool spec: Rule of 72 Calculator

> **Approved by Puru (2026-11-21).** Pure maths: the rate is always the user's own. The page never suggests, ranks or quotes a "typical" return, savings, inflation or interest rate.

| Field | Value |
|---|---|
| Slug | `rule-of-72-calculator` |
| Category | `personal-finance` |
| Risk | 🟢 green: pure maths |
| Main keyword | `rule of 72 calculator` |
| Long-tail keywords | `doubling time calculator`, `how long to double my money`, `rule of 72 formula`, `years to double calculator` |
| Affiliate | none |
| Related tools | from the keyword map: `savings-goal-calculator`, `debt-snowball-calculator`, `emergency-fund-calculator` |

## What it calculates
Two modes (`SegmentedControl`, URL key `mode`):
- **Years to double** (`years`): 72 ÷ rate. The exact answer, ln 2 ÷ ln(1 + r), appears beside it.
- **Rate needed** (`rate`): 72 ÷ years. The exact answer, 2^(1 ÷ years) − 1, appears beside it.

Both answers show side by side with the gap between them, so the user sees how close the shortcut is. The page explains: "Assumes the rate stays the same every year and growth is added once a year."

There's no money input and no currency selector. The answer is the same for any amount, and the content says so.

## Inputs
| Field | Type | Default (example) | Min / Max | Mode | Notes |
|---|---|---|---|---|---|
| Mode | segmented | Years to double | `years` / `rate` | – | |
| Yearly rate | % | 8 | 0.01 – 1,000 | years | Required. 0 → "Enter a rate above 0" (money never doubles at 0%). Help: "Your own rate. Example only, not a suggestion." (8% kept, Puru, 2026-11-21) |
| Years | number | 9 | 0.01 – 1,000 | rate | Required. 0 → "Enter years above 0". Help: "Example value only." |

URL keys: `mode`, `rate`, `years`.

No currency, so no currency presets.

## Outputs
| Output | Mode | How it's shown |
|---|---|---|
| **Years to double (rule of 72)** | years | Main result, up to 2 decimals, trailing zeros dropped ("9 years", "0.72 years") |
| Exact years | years | ln 2 ÷ ln(1 + rate ÷ 100), same format ("9.01 years") |
| **Rate needed (rule of 72)** | rate | Main result, % up to 2 decimals ("7.2%") |
| Exact rate | rate | (2^(1 ÷ years) − 1) × 100 ("7.18%") |
| Difference | both | exact − rule, with sign, same format ("The rule of 72 is 0.01 years off") |

## Formula
```
years mode:  rule  = 72 ÷ rate
             exact = ln 2 ÷ ln(1 + rate ÷ 100)
rate mode:   rule  = 72 ÷ years                    (as a %)
             exact = (2^(1 ÷ years) − 1) × 100     (as a %)
difference = exact − rule
```

## Test cases (must match exactly)
| # | Inputs | Expected |
|---|---|---|
| 1 | years · 8% | rule **9 years** · exact **9.01 years** |
| 2 | years · 6% | rule **12 years** · exact **11.9 years** |
| 3 | years · 1% | rule **72 years** · exact **69.66 years** |
| 4 | years · 24% | rule **3 years** · exact **3.22 years** |
| 5 | years · 100% | rule **0.72 years** · exact **1 year** |
| 6 | rate · 10 years | rule **7.2%** · exact **7.18%** |
| 7 | rate · 6 years | rule **12%** · exact **12.25%** |
| 8 | rate · 1 year | rule **72%** · exact **100%** |

Cases 3, 5 and 8 show where the shortcut drifts at very low and very high rates. The content explains this with these numbers.

## Edge cases
- Rate 0 or empty → field error (no ÷ 0, ln(1) = 0). Negative rate → field error ("Enter a rate above 0"). Over 1,000 → field error.
- Years 0 → field error. Over 1,000 → field error. Tiny values such as 0.01 → formatted, never `e+`/NaN/Infinity.

## Quality gate 8 (UI input tests)
- Clear rate / years → "Enter a number" and "—" (both answers).
- 0 / negative / huge in every box → no NaN or Infinity on screen.
- Switch both modes → result updates (`rate` mode added to `tests/ui/modes.test.tsx`). No currency switch: this tool has no currency selector.

## Extras
- Chart: no. Scenario compare: yes, Plan B = another rate (years mode) or another time frame (rate mode). Share / print / embed: yes.

## Content notes
- Examples: cases 1, 6, 3 (the low-rate drift).
- FAQ: the 5 keyword-map questions + "Why 72 and not 70?" (72 divides evenly by many numbers; 69.3 is closer for continuous growth; maths only) + "Does the amount I start with matter?" (no).
- "Does it work for debt and inflation?" is answered as maths only: the same doubling maths applies to any steady yearly rate. The page never quotes an inflation or card rate.
- No example rate presented as realistic. Wording: "if your rate is 8%", never "stocks return 8%".
