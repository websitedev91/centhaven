# Tool spec: Unit Price Calculator

> **Draft for Puru's review (2026-11-21).** Pure maths: every price and size comes from the user. The only fixed numbers are unit definitions (1 kg = 1,000 g, 1 lb = 453.59237 g, 1 oz = 28.349523125 g, 1 l = 1,000 ml, 1 US fl oz = 29.5735295625 ml): measurement definitions, not finance figures. No store names, no "typical" prices.

| Field | Value |
|---|---|
| Slug | `unit-price-calculator` |
| Category | `personal-finance` |
| Risk | 🟢 green: pure maths |
| Main keyword | `unit price calculator` |
| Long-tail keywords | `price per unit calculator`, `price per ounce calculator`, `price per kg calculator`, `which is cheaper calculator` |
| Affiliate | none |
| Related tools | from the keyword map: `50-30-20-budget-calculator`, `savings-rate-calculator`, `savings-goal-calculator` |

## What it calculates
Compare **2 to 4 items** (rows "Item 1"…"Item 4", add / remove, min 2; no name boxes, same privacy reason as Rent Split):
- **Price per unit** for each item = price ÷ quantity, converted to one common unit.
- **Cheapest per unit**, and for every other item **how much more it costs per unit**, in %: (item − cheapest) ÷ cheapest × 100.
- Ties: "Items 1 and 3 cost the same per unit."

Units: weight `g`, `kg`, `oz`, `lb`; volume `ml`, `l`, `fl oz` (US); count `items`. All items must be the same kind: a weight can't be compared with a volume (field error on the unit, below).

**Show price per** (select, URL key `per`): weight → per 100 g / per kg / per oz / per lb; volume → per 100 ml / per l / per fl oz; count → per item. The options follow the kind of Item 1's unit; if the chosen one no longer fits, it falls back to the first option.

## Inputs
| Field | Type | Default (example) | Min / Max | Notes |
|---|---|---|---|---|
| Currency | select | USD | standard list | |
| Items | rows "Item 1"…"Item 4" | 2 rows | 2 – 4 rows | Add / remove. No name boxes |
| · Price | currency | see presets | 0.01 – 1,000,000 | Required. 0 → "Enter a price above 0" (no ÷ 0 in the % difference) |
| · Quantity | number | see presets | 0.001 – 1,000,000 | Required. 0 → "Enter a size above 0". Help on Item 1: "The total in the pack, e.g. 6 × 330 ml = 1,980 ml." |
| · Unit | select | see presets | the 8 units | A different kind from Item 1 → "Item 1 is a weight: use g, kg, oz or lb" (worded for weight / volume / count) |
| Show price per | select | per oz (USD) / per 100 g (others) | see above | |

URL keys: `currency`, `rows`, `p1`…`p4`, `q1`…`q4`, `u1`…`u4`, `per`.
Removing an item moves later rows up; rows past the count go back to the defaults (no URL leftovers, same rule as Rent Split).

### Currency presets (example values; units follow the currency)
| Currency | Item 1 | Item 2 | Items 3–4 | Show per |
|---|---|---|---|---|
| USD | 4.99 for 16 oz | 7.49 for 32 oz | 9.99 for 48 oz | per oz |
| CAD / AUD | 4.99 for 500 g | 7.49 for 1 kg | 9.99 for 1.5 kg | per 100 g |
| GBP / EUR | 2.50 for 500 g | 4.20 for 1 kg | 5.90 for 1.5 kg | per 100 g |
| INR | 120 for 500 g | 210 for 1 kg | 300 for 1.5 kg | per 100 g |

Switching currency swaps untouched prices, quantities and units (the usual pattern); typed values are kept.

## Outputs
| Output | How it's shown |
|---|---|
| **Cheapest per unit** | Main result: "Item 2", unit "$0.23 per oz" |
| Per item rows | "Item 1 · $4.99 for 16 oz" → "$0.31 per oz · 33.24% more per unit"; the cheapest row says "Cheapest" |
| Tie | footnote: "Items 1 and 2 cost the same per unit." (compared to 6 significant digits, so float noise never breaks a tie) |
| Saving note | "Buying Item 2 instead of Item 1 saves 24.95% per unit." (= 1 − cheapest ÷ item; shown for the dearest item only) |

Price per unit shows 2 decimals; if that rounds to 0.00 the shared money formatter shows "less than $0.01", so choose a bigger "per" (per 100 g / per kg).

## Formula
```
base quantity = quantity × factor (g for weight, ml for volume, 1 for count)
price per base unit = price ÷ base quantity
shown price per unit = price per base unit × factor of the "per" unit (e.g. 100 for per 100 g, 28.349523125 for per oz)
cheapest = min(price per base unit)
% more   = (item − cheapest) ÷ cheapest × 100
saving   = (1 − cheapest ÷ item) × 100
```

## Test cases (must match exactly)
| # | Inputs | Expected |
|---|---|---|
| 1 | USD · 4.99 / 16 oz vs 7.49 / 32 oz · per oz | Item 1 **$0.31** per oz · Item 2 **$0.23** · cheapest **Item 2** · Item 1 **33.24% more** · saving 24.95% |
| 2 | GBP · £2.50 / 500 g vs £4.20 / 1 kg · per 100 g | **£0.50** vs **£0.42** · cheapest Item 2 · Item 1 **19.05% more** |
| 3 | 3.00 / 1 lb vs 6.00 / 1 kg · per kg | Item 1 **6.61** per kg · Item 2 **6.00** · cheapest Item 2 · Item 1 **10.23% more** |
| 4 | 1.80 / 1.5 l vs 0.65 / 330 ml · per l | **1.20** vs **1.97** · cheapest Item 1 · Item 2 **64.14% more** |
| 5 | 3.60 / 12 items vs 5.00 / 20 items · per item | **0.30** vs **0.25** · cheapest Item 2 · Item 1 **20% more** |
| 6 | 2.00 / 500 g vs 4.00 / 1 kg | tie: "Items 1 and 2 cost the same per unit" |
| 7 | 2.99 / 64 fl oz vs 1.89 / 1 l · per l | Item 1 **1.58** per l · cheapest Item 1 · Item 2 **19.64% more** |
| 8 | INR defaults · ₹120 / 500 g vs ₹210 / 1 kg · per 100 g | **₹24.00** vs **₹21.00** · cheapest Item 2 · Item 1 **14.29% more** |
| 9 | Item 1 in g, Item 2 in ml | field error on Item 2's unit · "—" |
| 10 | 4 items, remove Item 2 | items 3–4 move up; `rows=3`; no `p4`/`q4`/`u4` in the URL |
| 11 | Switch USD → GBP without editing | prices, quantities and units take the GBP presets; per → per 100 g. A typed price is kept |

## Edge cases
- Price 0 / quantity 0 → field errors. Negative → field error. Tiny prices per unit → "less than $0.01" (shared formatter), never "$0.00".
- "Show per" that doesn't fit the kind (e.g. per oz after switching Item 1 to ml) falls back to the first option of the new kind.
- Huge values → formatted, never `e+`/NaN/Infinity.

## Quality gate 8 (UI input tests)
- Clear each item's price / quantity → "Enter a number" and "—".
- 0 / negative / huge in every box → no NaN or Infinity on screen.
- Switch every currency, every "show per" option and an item's unit → result updates. 4-item and volume / count states added to `tests/ui/modes.test.tsx`.

## Extras
- Chart: no. Scenario compare: no (the tool is already a comparison). Share / print / embed: yes.

## Content notes
- Examples: cases 1, 2, 3 (mixed units), 5.
- FAQ: the 5 keyword-map questions + "How do I compare multipacks?" (multiply: 6 × 330 ml = 1,980 ml) + "Why use the same unit for everything?".
- Never name stores or brands, never say a price is "good", and never quote typical prices. Bigger packs are not always cheaper: case 4 shows it.
