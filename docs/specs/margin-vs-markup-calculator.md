# Tool spec: Margin vs Markup Calculator

> **Draft — waiting for Puru's review.** Pure maths: every number comes from the user.

| Field | Value |
|---|---|
| Slug | `margin-vs-markup-calculator` |
| Category | `business` |
| Risk | 🟢 green: pure maths |
| Main keyword | `margin vs markup calculator` |
| Long-tail keywords | `markup to margin calculator`, `margin to markup calculator`, `markup calculator`, `selling price from margin` |
| Affiliate | none |
| Related tools | from the keyword map: `payment-processing-fee-calculator`, `break-even-calculator`, `roas-calculator` |

## What it calculates
Three modes (`SegmentedControl`, URL key `mode`):
- **Cost and price** (`price`): enter both → profit, margin % and markup %.
- **Find a price** (`find`): cost + a margin % **or** a markup % (second segmented control, URL key `by`) → selling price, profit, and the other percentage.
- **Convert %** (`convert`): a margin % → the matching markup %, or a markup % → the matching margin % (no money).

**Margin** = profit as a share of the price. **Markup** = profit as a share of the cost. The page shows both side by side so the difference is clear.

## Inputs
| Field | Type | Default (example) | Min / Max | Mode | Notes |
|---|---|---|---|---|---|
| Mode | segmented | Cost and price | `price` / `find` / `convert` | – | |
| Currency | select | USD | standard list | price, find | Hidden in convert |
| Cost | currency | 60 | 0 – 10,000,000,000 | price, find | Help: "What one item or job costs you." Required |
| Selling price | currency | 100 | 0 – 10,000,000,000 | price | Required |
| Price from | segmented | Margin | `margin` / `markup` | find, convert | |
| Margin | % | 40 | 0 – 99.99 | find/convert with `margin` | ≥ 100 → "Margin must be below 100%" |
| Markup | % | 50 | 0 – 10,000 | find/convert with `markup` | |

URL keys: `mode`, `cost`, `price`, `by`, `margin`, `markup`.

### Currency presets (example values; percentages stay the same)
| Currency | Cost | Price |
|---|---|---|
| USD / GBP / EUR / CAD / AUD | 60 | 100 |
| INR | 800 | 1,000 |

## Outputs
| Output | Mode | How it's shown |
|---|---|---|
| **Margin** and **markup** | price | Two result values side by side (2 decimals, trailing zeros dropped: 40%, 66.67%) |
| Profit per sale | price, find | price − cost (negative = loss, "You sell below cost.") |
| **Selling price** | find | Main result, plus the other % |
| **The other %** | convert | "A 25% margin = a 33.33% markup" |
| Explainer bar | price, find | `SplitBar` of the price: cost vs profit (hidden when profit ≤ 0) |

## Formula
```
profit = price − cost
margin = profit ÷ price            (price > 0)
markup = profit ÷ cost             (cost > 0)

price from margin = cost ÷ (1 − margin)
price from markup = cost × (1 + markup)

markup from margin = margin ÷ (1 − margin)
margin from markup = markup ÷ (1 + markup)
```

## Test cases (must match exactly)
| # | Inputs | Expected |
|---|---|---|
| 1 | price mode · cost 60 · price 100 | profit 40.00 · **margin 40%** · **markup 66.67%** |
| 2 | find · cost 50 · markup 50% | **price 75.00** · profit 25.00 · margin 33.33% |
| 3 | find · cost 50 · margin 50% | **price 100.00** · profit 50.00 · markup 100% |
| 4 | convert · margin 25% | **markup 33.33%** |
| 5 | convert · markup 25% | **margin 20%** |
| 6 | INR · find · cost ₹800 · margin 20% | **price ₹1,000.00** · profit ₹200.00 · markup 25% |
| 7 | price mode · cost 120 · price 100 | profit −20.00 · margin −20% · markup −16.67% · "You sell below cost." |
| 8 | Switch USD → INR without editing | cost 60 → 800, price 100 → 1,000; margin 20%, markup 25%. A typed cost is kept |

## Edge cases
- Price 0 (price mode) → margin row "—" with "No price, so there's no margin", markup still shown if cost > 0. Cost 0 → markup "—" with "No cost, so markup can't be worked out"; margin 100%.
- Both 0 → message "Enter a cost or a price above 0" + "—".
- Margin ≥ 100% → field error (a margin of 100% would need an infinite price). Negative inputs → field error.
- Huge values → formatted, never `e+`/NaN/Infinity.

## Quality gate 8 (UI input tests)
- Clear each required field (cost, price, margin, markup) in every mode → "Enter a number" and "—". No optional fields.
- 0 / negative / huge in every field → no NaN or Infinity on screen.
- Switch all three modes, both "Price from" options and every currency → result updates. The batch 5 `tests/ui/modes.test.tsx` gets `find` + `markup` and `convert` cases.

## Extras
- Chart: `SplitBar` only. Scenario compare: no. Share / print / embed: yes.

## Content notes
- Examples: cases 1, 2, 6 and a "same 50%, different meaning" example (50% markup = 33.33% margin).
- FAQ: the 5 keyword-map questions + "Which should I use for pricing?" + "Do payment fees change my margin?" (link to payment processing fee calculator). No "typical margin for your industry" figures.
- Tips: decide which one your team means; check margin after fees and discounts; link to break-even and ROAS (break-even ROAS = 1 ÷ margin).
