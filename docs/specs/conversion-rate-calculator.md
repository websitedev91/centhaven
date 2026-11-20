# Tool spec: Conversion Rate Calculator

> **Draft — waiting for Puru's review.** Pure maths: every number comes from the user.

| Field | Value |
|---|---|
| Slug | `conversion-rate-calculator` |
| Category | `marketing` |
| Risk | 🟢 green: pure maths |
| Main keyword | `conversion rate calculator` |
| Long-tail keywords | `how to calculate conversion rate`, `conversions needed calculator`, `website conversion rate calculator`, `ecommerce conversion rate calculator` |
| Affiliate | none |
| Related tools | from the keyword map: `cpc-calculator`, `cost-per-lead-calculator`, `roas-calculator` |

## What it calculates
Three modes (`SegmentedControl`, URL key `mode`):
- **Find my rate** (`rate`): conversions ÷ visitors × 100.
- **Conversions needed** (`conversions`): visitors × target rate = the conversions that rate means.
- **Visitors needed** (`visitors`): conversions goal ÷ target rate = the visitors you need.

"Conversion" is whatever the user counts: a sale, a lead, a sign-up. Optional **value per conversion** turns conversions into revenue (and revenue per visitor). No "average conversion rate is X%" anywhere on the page.

## Inputs
| Field | Type | Default (example) | Min / Max | Mode | Notes |
|---|---|---|---|---|---|
| Mode | segmented | Find my rate | `rate` / `conversions` / `visitors` | – | |
| Currency | select | USD | standard list | all | Only used by value per conversion |
| Visitors | number, whole | 5,000 | 1 – 1,000,000,000 | rate, conversions | Required. 0 → "Enter at least 1 visitor". Help: "Visitors, sessions or clicks: use the same count as your conversions." |
| Conversions | number, whole | 150 | 0 – 1,000,000,000 | rate | Required. More than visitors → "Conversions can't be more than visitors" |
| Target conversion rate | % | 4 | 0.01 – 100 | conversions, visitors | Required. 0 → "Enter a rate above 0". Help: "Your own target. Example value only." |
| Conversions goal | number, whole | 200 | 1 – 1,000,000,000 | visitors | Required |
| Value per conversion (optional) | currency | 50 | 0 – 10,000,000 | all | `optional`, 0 = revenue rows hidden. Help: "What one sale or lead is worth to you. Example value." |

URL keys: `mode`, `currency`, `visits`, `conv`, `target`, `goal`, `value`.

### Currency presets (example values; counts and rates stay the same)
| Currency | Value per conversion |
|---|---|
| USD / GBP / EUR / CAD / AUD | 50 |
| INR | 2,000 |

## Outputs
| Output | Mode | How it's shown |
|---|---|---|
| **Conversion rate** | rate | Main result, up to 2 decimals, trailing zeros dropped ("3%", "3.08%") |
| **Conversions** | conversions | Main result: whole → "200 conversions"; fractional → "about 99.5 conversions (on average)" (same wording as CPC) |
| **Visitors needed** | visitors | Main result, **rounded up** ("6,667 visitors"): you need whole visitors to reach the goal |
| Visitors per conversion | all | "About {100 ÷ rate, 1 decimal} visitors for each conversion" |
| Revenue | all, value > 0 | conversions × value ("Revenue from 150 conversions") |
| Revenue per visitor | rate, conversions, value > 0 | revenue ÷ visitors |

## Formula
```
rate:         conversion rate = conversions ÷ visitors × 100
conversions:  conversions     = visitors × target rate ÷ 100
visitors:     visitors needed = ceil(conversions goal ÷ (target rate ÷ 100))

visitors per conversion = 100 ÷ rate
revenue                 = conversions × value per conversion
revenue per visitor     = revenue ÷ visitors
```

## Test cases (must match exactly)
| # | Inputs | Expected |
|---|---|---|
| 1 | rate · 150 ÷ 5,000 · value 50 | **3%** · about 33.3 visitors per conversion · revenue **7,500.00** · per visitor **1.50** |
| 2 | rate · 37 ÷ 1,200 · value 0 | **3.08%** · revenue rows hidden |
| 3 | conversions · 5,000 visitors · 4% · value 50 | **200 conversions** · revenue **10,000.00** · per visitor 2.00 |
| 4 | conversions · 3,317 visitors · 3% | **about 99.51 conversions (on average)** |
| 5 | visitors · goal 200 · 3% | **6,667 visitors** (6,666.67 rounded up) |
| 6 | INR rate · 90 ÷ 3,000 · value ₹2,000 | **3%** · revenue **₹1,80,000.00** · per visitor **₹60.00** |
| 7 | rate · conversions 0 | **0%** · visitors per conversion row hidden (no ÷ 0) |
| 8 | Switch USD → INR without editing | value 50 → 2,000; visitors, conversions, rates unchanged. A typed value is kept |

## Edge cases
- Visitors 0 or decimal → field error. Conversions > visitors → field error on conversions.
- Target rate 0 → field error (no ÷ 0); over 100 → field error.
- Value 0 or empty → revenue rows hidden (optional). Negative → field error.
- Huge values → formatted, never `e+`/NaN/Infinity.

## Quality gate 8 (UI input tests)
- Clear each required box in every mode → "Enter a number" and "—". Clear value (optional) → valid, revenue hidden.
- 0 / negative / huge in every box → no NaN or Infinity on screen.
- Switch all three modes and every currency → result updates (`conversions` and `visitors` modes added to `tests/ui/modes.test.tsx`).

## Extras
- Chart: no. Scenario compare: yes, Plan B = another page or campaign's visitors and conversions (rate mode). Share / print / embed: yes.

## Content notes
- Examples: cases 1, 3, 5 (+ the INR case).
- FAQ: the 5 keyword-map questions + "What counts as a conversion?" + "Should I use visitors, sessions or clicks?". "What is a good conversion rate?" answers with the user's own maths (compare with your own past rate and what a conversion is worth), never a benchmark.
- Tips: track one conversion type at a time; compare pages by rate *and* revenue per visitor; link to CPC (cost per click → cost per conversion) and Cost Per Lead.
