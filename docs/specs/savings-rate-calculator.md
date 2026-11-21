# Tool spec: Savings Rate Calculator

> **Draft for Puru's review (2026-11-21).** Pure maths: every number comes from the user. No tax maths (take-home and gross are both typed in by the user). The page never says what percentage anyone "should" save, and never quotes a national or average savings rate.

| Field | Value |
|---|---|
| Slug | `savings-rate-calculator` |
| Category | `personal-finance` |
| Risk | 🟢 green: pure maths |
| Main keyword | `savings rate calculator` |
| Long-tail keywords | `savings percentage calculator`, `personal savings rate calculator`, `how much of my income do i save`, `percent of income saved` |
| Affiliate | none |
| Related tools | from the keyword map: `50-30-20-budget-calculator`, `savings-goal-calculator`, `emergency-fund-calculator` |

**Overlap note:** Savings Goal owns "monthly savings calculator" / "how much to save per month" (a goal and a date). This page is about the *share* of income saved. Each links to the other.

## What it calculates
- **Savings rate** = monthly savings ÷ monthly income × 100.
- **Income basis** (`SegmentedControl`, URL key `basis`): Take-home pay (`net`) or Gross income (`gross`). It changes labels and wording only ("15% of your take-home pay"). Both are numbers the user types; we never convert one into the other.
- Optional **target %** (0 = off): target amount = income × target %, and the gap to what they save now ("200.00 more a month to reach 20%" / "200.00 above your 10% target").

## Inputs
| Field | Type | Default (example) | Min / Max | Notes |
|---|---|---|---|---|
| Income basis | segmented | Take-home pay | `net` / `gross` | Labels only |
| Currency | select | USD | standard list | |
| Monthly income | currency | 4,000 | 0.01 – 1,000,000,000 | Required. 0 → "Enter an income above 0" (no ÷ 0). Label follows the basis: "Monthly take-home pay" / "Monthly gross income" |
| Monthly savings | currency | 600 | 0 – 1,000,000,000 | Required. More than income → "Savings can't be more than income". Help: "Everything you put aside: savings, investments, extra debt payments if you count them. Example value." |
| Target savings rate (optional) | % | 0 (off) | 0 – 100 | `optional`. Help: "Your own target, if you have one." Default off, so the page never shows a suggested % |

URL keys: `basis`, `currency`, `income`, `saved`, `target`.

### Currency presets (example values; all give 15%)
| Currency | Income | Savings |
|---|---|---|
| USD / CAD / AUD | 4,000 | 600 |
| GBP / EUR | 3,000 | 450 |
| INR | 80,000 | 12,000 |

## Outputs
| Output | How it's shown |
|---|---|
| **Savings rate** | Main result, up to 2 decimals, trailing zeros dropped ("15%", "7.62%"); unit "of your take-home pay" / "of your gross income" |
| Saved each year | savings × 12 |
| Not saved each month | income − savings |
| Target amount | target > 0: income × target % ("20% of 4,000.00 = 800.00 a month") |
| Gap to target | target > 0: "200.00 more a month to reach 20%" · "200.00 a month above your 10% target" · "Exactly on target" |

## Formula
```
savings rate   = savings ÷ income × 100
yearly saved   = savings × 12
not saved      = income − savings
target amount  = income × target % ÷ 100
gap            = target amount − savings     (> 0 more to save, < 0 above target)
```

## Test cases (must match exactly)
| # | Inputs | Expected |
|---|---|---|
| 1 | 4,000 · 600 | **15%** · yearly 7,200.00 · not saved 3,400.00 |
| 2 | 5,250 · 400 | **7.62%** |
| 3 | 4,000 · 600 · target 20% | target **800.00** a month · **200.00 more** a month to reach 20% |
| 4 | 4,000 · 600 · target 10% | target 400.00 · **200.00 a month above** your 10% target |
| 5 | 4,000 · 600 · target 15% | "Exactly on target" |
| 6 | INR ₹80,000 · ₹12,000 · target 25% | **15%** · yearly ₹1,44,000.00 · target **₹20,000.00** · **₹8,000.00 more** |
| 7 | savings 0 | **0%** (valid) |
| 8 | basis gross | same numbers; unit reads "of your gross income" |
| 9 | Switch USD → GBP without editing | 4,000 / 600 → 3,000 / 450; target unchanged. A typed income is kept |

## Edge cases
- Income 0 → field error. Savings > income → field error on savings. Savings = income → 100% (valid).
- Target over 100 / negative → field error on target (optional: the rate still shows). Target 0 or empty → target rows hidden.
- Negative → field error. Huge values → formatted, never `e+`/NaN/Infinity.

## Quality gate 8 (UI input tests)
- Clear income / savings → "Enter a number" and "—". Clear target (optional) → valid, target rows hidden.
- 0 / negative / huge in every box → no NaN or Infinity on screen.
- Switch both bases and every currency → result updates.

## Extras
- Chart: no. Scenario compare: yes, Plan B = another monthly savings amount (e.g. 600 vs 800). Share / print / embed: yes.

## Content notes
- Examples: cases 1, 3, 6.
- FAQ: the 5 keyword-map questions + "Should I count paying off debt as saving?" (your choice; be consistent) + "Why does my rate change between take-home and gross?" (same savings, bigger income → smaller %).
- "What is a good savings rate?" (if asked) is answered with the user's own maths only: it depends on your goals, income and costs; compare your own rate month to month. No numbers, no "experts recommend".
