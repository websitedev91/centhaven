# Tool spec: Wedding Budget Calculator

> **Approved by Puru (2026-11-21).** Pure maths: the total budget, guest count and every category % come from the user. The starting split is labelled "Example split: change it to yours", never "average" or "typical". The page never states what a wedding, or any part of one, costs on average.

| Field | Value |
|---|---|
| Slug | `wedding-budget-calculator` |
| Category | `personal-finance` |
| Risk | 🟢 green: pure maths |
| Main keyword | `wedding budget calculator` |
| Long-tail keywords | `wedding budget breakdown`, `wedding cost per guest calculator`, `how to split a wedding budget`, `wedding budget planner` |
| Affiliate | none |
| Related tools | from the keyword map: `savings-goal-calculator`, `50-30-20-budget-calculator`, `emergency-fund-calculator` |

## What it calculates
- The **total budget** split into 8 fixed categories by **editable percentages** that must **total 100** (same pattern as 50/30/20: a message plus a "Reset to the example split" button when they don't).
- **Cost per guest** = total ÷ guests, and **venue & catering per guest** = that category ÷ guests (guest count optional).

Categories (fixed names, so no free text ends up in the URL): Venue & catering · Photography & video · Attire & beauty · Flowers & decor · Music & entertainment · Rings · Stationery · Other & buffer.

## Inputs
| Field | Type | Default (example) | Min / Max | Notes |
|---|---|---|---|---|
| Currency | select | USD | standard list | |
| Total budget | currency | 25,000 | 0 – 1,000,000,000 | Required. Help: "Your own budget. Example value only." |
| Guests (optional) | number, whole | 100 | 0 – 10,000 | `optional`, 0 = per-guest rows hidden |
| 8 × category % | % | 45 / 12 / 8 / 10 / 7 / 5 / 3 / 10 | 0 – 100, up to 2 decimals | Required. Heading: "Example split: change it to yours". Total ≠ 100 → "Your percentages add up to {n}%. They need to total 100%." + reset button, and "—" |

URL keys: `currency`, `budget`, `guests`, `venue`, `photo`, `attire`, `flowers`, `music`, `rings`, `paper`, `other`.

### Currency presets (example values; guests and percentages stay the same)
| Currency | Budget |
|---|---|
| USD / CAD / AUD | 25,000 |
| GBP / EUR | 20,000 |
| INR | 15,00,000 |

## Outputs
| Output | How it's shown |
|---|---|
| **Total budget** | Main result; unit "split across 8 categories · {currency}" |
| Category rows | "Venue & catering · 45%" → 11,250.00 (one row each, in order) |
| Cost per guest | guests > 0: total ÷ guests |
| Venue & catering per guest | guests > 0: venue & catering ÷ guests |
| Running total | under the % boxes: "Total: 100%" (or the off-by message) |

**Exact-cent rule (Puru, 2026-11-21; CLAUDE.md rule 3 exception, shared `lib/split-cents.ts`):** each category is rounded down to the cent, then the leftover cents go to the first categories in order (skipping any at 0%), so the categories add up to the budget exactly. A note under the result says so.

## Formula
```
category amount     = budget × category % ÷ 100        (Σ % must be 100)
cost per guest      = budget ÷ guests
venue per guest     = venue & catering amount ÷ guests
```

## Test cases (must match exactly)
| # | Inputs | Expected |
|---|---|---|
| 1 | USD 25,000 · example split · 100 guests | venue **11,250.00** · photo 3,000.00 · attire 2,000.00 · flowers 2,500.00 · music 1,750.00 · rings 1,250.00 · stationery 750.00 · other 2,500.00 · per guest **250.00** · venue per guest **112.50** |
| 2 | venue 50% (others unchanged) | total 105% → "Your percentages add up to 105%. They need to total 100%." · "—" · reset → valid again |
| 3 | INR ₹15,00,000 · 150 guests | per guest **₹10,000.00** · venue **₹6,75,000.00** · venue per guest ₹4,500.00 |
| 4 | GBP £20,000 · 80 guests | per guest **£250.00** · venue £9,000.00 |
| 5 | guests 0 / empty | per-guest rows hidden (valid) |
| 6 | 12,345 · venue 45% | venue **5,555.25** |
| 7 | rings 0%, other 15% | rings 0.00 (valid), other 3,750.00 |
| 7b | decimal %: 1,234.56 at 45.5 / 11.5 / 8 / 10 / 7 / 5 / 3 / 10 | 561.73 / 141.98 / 98.77 / 123.46 / 86.42 / 61.72 / 37.03 / 123.45 = exactly 1,234.56 (5 leftover cents to the first 5 categories) |
| 7c | 999.99 with the example split | 450.00 / 120.00 / 80.00 / 100.00 / 70.00 / 50.00 / 30.00 / 99.99 |
| 8 | Switch USD → INR without editing | budget 25,000 → 15,00,000; guests and percentages unchanged. A typed budget is kept |

## Edge cases
- Budget 0 → 0.00 everywhere (valid). A % below 0 or above 100 → field error on that box. Total ≠ 100 (e.g. 99.99) → the total message.
- Guests decimals → "Enter a whole number" (optional: the split still shows). Huge values → formatted, never `e+`/NaN/Infinity.

## Quality gate 8 (UI input tests)
- Clear budget or any % → "Enter a number" and "—". Clear guests (optional) → valid, per-guest rows hidden.
- 0 / negative / huge in every box → no NaN or Infinity on screen. (Typing 0 in a category makes the total ≠ 100 → message + "—": counts as "—" with a message.)
- Switch every currency → result updates. A 105% state added to `tests/ui/modes.test.tsx` (as for 50/30/20).

## Extras
- Chart: SplitBar (shared component) of the 8 categories. Scenario compare: yes, Plan B = another guest count (100 vs 120 → cost per guest). Share / print / embed: yes.

## Content notes
- Examples: cases 1, 3, 4.
- FAQ: the 5 keyword-map questions + "What should go in Other & buffer?" + "Can I set a category to 0%?".
- Never state an average or typical wedding cost, a "rule" for splitting, or what share "most couples" spend. The split is an example only.
