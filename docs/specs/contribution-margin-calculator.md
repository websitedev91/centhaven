# Tool spec: Contribution Margin Calculator

> **Approved by Puru (2026-11-21).** Pure maths: price, variable cost, units and fixed costs all come from the user. Never says what margin or ratio is "good" and never quotes an industry figure.

| Field | Value |
|---|---|
| Slug | `contribution-margin-calculator` |
| Category | `business` |
| Risk | 🟢 green: pure maths |
| Main keyword | `contribution margin calculator` |
| Long-tail keywords | `contribution margin ratio calculator`, `how to calculate contribution margin`, `contribution margin per unit`, `unit contribution margin calculator` |
| Affiliate | none |
| Related tools | from the keyword map: `break-even-calculator`, `margin-vs-markup-calculator`, `food-cost-calculator` |

**Overlap note:** Break-Even shows contribution margin per unit as a breakdown line and asks "What is contribution margin?" in its FAQ. This page owns "contribution margin calculator" and goes deeper (ratio, total, profit, break-even revenue). This page's FAQ asks "How do you calculate contribution margin?" instead, so the two never ask the same question. Both pages link to each other, and to Margin vs Markup (Puru's request).

## What it calculates
One form (no modes):
- **Contribution margin per unit** = price − variable cost per unit.
- **Contribution margin ratio** = CM per unit ÷ price.
- **Total contribution margin** = CM per unit × units sold.
- Optional **fixed costs** (0 = off) → **break-even units** = fixed costs ÷ CM per unit, rounded **up** (same rule as Break-Even); break-even revenue = fixed costs ÷ ratio; profit = total CM − fixed costs.

## Inputs
| Field | Type | Default (example) | Min / Max | Notes |
|---|---|---|---|---|
| Currency | select | USD | standard list | |
| Price per unit | currency | 50 | 0.01 – 1,000,000,000 | Required. 0 → "Enter a price above 0" (no ÷ 0 in the ratio) |
| Variable cost per unit | currency | 30 | 0 – 1,000,000,000 | Required. Help: "Costs that rise with each unit: materials, packaging, per-sale fees. Example value." Above the price is allowed (negative margin, shown as such) |
| Units sold | number, whole | 1,000 | 0 – 1,000,000,000 | Required. For a period the user picks (a month, a year) |
| Fixed costs (optional) | currency | 12,000 | 0 – 1,000,000,000 | `optional`, 0 = break-even rows hidden. Help: "Rent, salaries and other costs that stay the same, for the same period as units sold." |

URL keys: `currency`, `price`, `vc`, `units`, `fixed`.

### Currency presets (example values; units stay the same)
| Currency | Price | Variable cost | Fixed costs |
|---|---|---|---|
| USD / CAD / AUD | 50 | 30 | 12,000 |
| GBP / EUR | 40 | 24 | 9,600 |
| INR | 2,000 | 1,200 | 4,80,000 |

## Outputs
| Output | How it's shown |
|---|---|
| **Contribution margin per unit** | Main result (minus sign when negative) |
| Contribution margin ratio | up to 2 decimals, trailing zeros dropped ("40%", "62.73%") |
| Total contribution margin | CM × units |
| Break-even units | fixed > 0 and CM > 0: rounded up ("600 units"); exact below if not whole ("797.45 exactly") |
| Break-even revenue | fixed > 0 and CM > 0: fixed ÷ ratio |
| Profit | fixed > 0: total CM − fixed ("Loss of …" when negative) |
| No break-even | fixed > 0 and CM ≤ 0: "Each unit doesn't add anything towards fixed costs, so there is no break-even point." |

## Formula
```
CM per unit          = price − variable cost
CM ratio             = CM per unit ÷ price
total CM             = CM per unit × units
break-even units     = ceil(fixed ÷ CM per unit)       (CM > 0)
break-even revenue   = fixed ÷ CM ratio                (CM > 0)
profit               = total CM − fixed
```

## Test cases (must match exactly)
| # | Inputs | Expected |
|---|---|---|
| 1 | USD defaults: 50 · 30 · 1,000 · fixed 12,000 | CM **20.00** · ratio **40%** · total **20,000.00** · break-even **600 units** (exact, not rounded up to 601) · revenue 30,000.00 · profit **8,000.00** |
| 2 | 19.99 · 7.45 · 2,500 · fixed 10,000 | CM **12.54** · ratio **62.73%** · total **31,350.00** · break-even **798 units** (797.45 exactly) · revenue 15,940.99 · profit 21,350.00 |
| 3 | 50 · 30 · 1,000 · fixed 0 | CM 20.00 · 40% · 20,000.00 · break-even rows hidden |
| 4 | 50 · 55 · 1,000 · fixed 12,000 | CM **−5.00** · ratio **−10%** · total **−5,000.00** · no break-even message · loss of 17,000.00 |
| 5 | 50 · 50 · fixed 12,000 | CM 0.00 · 0% · no break-even message |
| 6 | 50 · 30 · 400 units · fixed 12,000 | total 8,000.00 · loss of **4,000.00** · break-even 600 units |
| 7 | INR defaults: ₹2,000 · ₹1,200 · 1,000 · ₹4,80,000 | CM **₹800.00** · 40% · total **₹8,00,000.00** · break-even 600 units · profit **₹3,20,000.00** |
| 8 | Switch USD → GBP without editing | 50 / 30 / 12,000 → 40 / 24 / 9,600; units unchanged. A typed price is kept |

Case 1 matches the Break-Even tool's maths for the same numbers.

## Edge cases
- Price 0 → field error. Variable cost 0 → CM = price, ratio 100% (valid). Units 0 → total 0.00 (valid); decimals → "Enter a whole number".
- Fixed costs negative / huge → its own error (optional: the result still shows). Huge values → formatted, never `e+`/NaN/Infinity.
- Break-even uses a float-safe ceil (12,000 ÷ 20 = 600, never 601), same helper as Break-Even.

## Quality gate 8 (UI input tests)
- Clear price / variable cost / units → "Enter a number" and "—". Clear fixed (optional) → valid, break-even rows hidden.
- 0 / negative / huge in every box → no NaN or Infinity on screen.
- Switch every currency → result updates.

## Extras
- Chart: no. Scenario compare: yes, Plan B = another price (e.g. 50 vs 55: CM, ratio, total, break-even). Share / print / embed: yes.

## Content notes
- Examples: cases 1, 2, 4.
- FAQ: the 5 keyword-map questions (including "Can contribution margin be negative?") + "What counts as a variable cost?" + "What is total contribution margin?".
- Never say what ratio is "good" or quote industry margins. Tips link to Break-Even and Margin vs Markup (and Food Cost for restaurants).
