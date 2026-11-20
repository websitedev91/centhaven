# Tool spec: Food Cost Calculator

> **Approved by Puru (2026-11-20).** Pure maths: every number comes from the user.

| Field | Value |
|---|---|
| Slug | `food-cost-calculator` |
| Category | `business` |
| Risk | 🟢 green: pure maths |
| Main keyword | `food cost calculator` |
| Long-tail keywords | `food cost percentage calculator`, `menu price calculator`, `how to calculate food cost percentage`, `plate cost calculator` |
| Affiliate | none |
| Related tools | from the keyword map: `margin-vs-markup-calculator`, `break-even-calculator`, `payment-processing-fee-calculator` |

## What it calculates
Three modes (`SegmentedControl`, URL key `mode`):
- **Food cost %** (`percent`): ingredient cost of one dish + menu price → food cost % and gross profit per plate.
- **Menu price** (`price`): ingredient cost + the user's own target food cost % → menu price.
- **For a period** (`period`): (opening inventory + purchases − closing inventory) ÷ food sales × 100.

Never states an "ideal", "typical" or "industry" food cost %. The target % is the user's own, and its default is labelled "example only".

## Inputs
| Field | Type | Default (example) | Min / Max | Mode | Notes |
|---|---|---|---|---|---|
| Mode | segmented | Food cost % | `percent` / `price` / `period` | – | |
| Currency | select | USD | standard list | all | |
| Ingredient cost per dish | currency | 3.50 | 0 – 1,000,000 | percent, price | Required. Help: "What the ingredients in one portion cost you." |
| Menu price | currency | 12.00 | 0.01 – 1,000,000 | percent | Required. 0 → "Enter a menu price above 0" |
| Target food cost % | % | 32 | 0.01 – 100 | price | Required. 0 → "Enter a target above 0". Help: "Your own target. Example value only." |
| Opening inventory | currency | 4,000 | 0 – 1,000,000,000 | period | Required |
| Purchases | currency | 12,000 | 0 – 1,000,000,000 | period | Required |
| Closing inventory | currency | 3,500 | 0 – 1,000,000,000 | period | Required. More than opening + purchases → "Closing inventory can't be more than opening inventory plus purchases" |
| Food sales | currency | 40,000 | 0.01 – 1,000,000,000 | period | Required. 0 → "Enter food sales above 0" |

URL keys: `mode`, `currency`, `cost`, `price`, `target`, `open`, `buy`, `close`, `sales`.

Menu price is entered **before** any sales tax the user adds on top (help text says so; no tax is calculated).

### Currency presets (example values; percentages stay the same)
| Currency | Cost | Price | Opening | Purchases | Closing | Sales |
|---|---|---|---|---|---|---|
| USD / GBP / EUR / CAD / AUD | 3.50 | 12.00 | 4,000 | 12,000 | 3,500 | 40,000 |
| INR | 90 | 300 | 1,00,000 | 3,00,000 | 80,000 | 10,00,000 |

## Outputs
| Output | Mode | How it's shown |
|---|---|---|
| **Food cost %** | percent, period | Main result, up to 2 decimals ("29.17%") |
| Gross profit per plate | percent, price | price − ingredient cost (before labour and other costs; said in a note) |
| **Menu price** | price | Main result |
| Cost of food used | period | opening + purchases − closing |
| Split bar | percent, price | `SplitBar` of the price: ingredients vs gross profit (hidden when profit ≤ 0) |
| Warning | percent | food cost % > 100: "Your ingredients cost more than the menu price." |

## Formula
```
percent:  food cost %   = ingredient cost ÷ menu price × 100
          gross profit  = menu price − ingredient cost
price:    menu price    = ingredient cost ÷ (target % ÷ 100)
period:   cost of food used = opening inventory + purchases − closing inventory
          food cost %       = cost of food used ÷ food sales × 100
```

## Test cases (must match exactly)
| # | Inputs | Expected |
|---|---|---|
| 1 | percent · 3.50 / 12.00 | **29.17%** · gross profit **8.50** |
| 2 | price · 4.00 at 32% | menu price **12.50** · gross profit 8.50 |
| 3 | period · 4,000 + 12,000 − 3,500 = 12,500 ÷ 40,000 | **31.25%** · cost of food used **12,500.00** |
| 4 | INR percent · ₹90 / ₹300 | **30%** · gross profit **₹210.00** |
| 5 | INR price · ₹120 at 32% | menu price **₹375.00** |
| 6 | percent · 6.00 / 5.00 | **120%** · gross profit −1.00 · "Your ingredients cost more than the menu price." |
| 7 | period · closing 20,000 (> 16,000) | field error on closing inventory + "—" |
| 8 | Switch USD → INR without editing | all money fields → INR presets; target % unchanged. A typed value is kept |

## Edge cases
- Ingredient cost 0 → 0% (valid). Menu price 0, target 0, food sales 0 → field errors (no ÷ 0).
- Target 100% → price = cost, gross profit 0 (valid). Target > 100 → field error.
- Negative → field error. Huge values → formatted, never `e+`/NaN/Infinity.

## Quality gate 8 (UI input tests)
- Clear each required box in every mode → "Enter a number" and "—". No optional fields.
- 0 / negative / huge in every box → no NaN or Infinity on screen.
- Switch all three modes and every currency → result updates (`price` and `period` modes added to `tests/ui/modes.test.tsx`).

## Extras
- Chart: `SplitBar` only. Scenario compare: no. Share / print / embed: yes.

## Content notes
- Examples: cases 1, 2, 3 (+ the INR case).
- FAQ: the 5 keyword-map questions + "Why does my period food cost differ from my recipe costs?" (waste, staff meals, portioning; maths only) + "Should I include drinks?" (track food and drinks separately so each % means one thing).
- "What is a good food cost percentage?" answers: it depends on your menu, prices and other costs; set your own target from your numbers. No figure.
- Tips: cost every recipe at today's ingredient prices; re-check when suppliers change prices; link to margin vs markup (food cost % and margin are two views of the same price) and break-even.
