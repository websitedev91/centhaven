# Tool spec: 50/30/20 Budget Calculator

> **Approved by Puru (2026-11-20).** Pure maths: the user enters their own take-home pay. We never work out tax.

| Field | Value |
|---|---|
| Slug | `50-30-20-budget-calculator` |
| Category | `personal-finance` |
| Risk | 🟢 green: pure maths (no tax, no benefit or debt rules) |
| Main keyword | `50/30/20 budget calculator` |
| Long-tail keywords | `50 30 20 rule calculator`, `budget calculator`, `how to split my income`, `needs wants savings calculator` |
| Affiliate | none |
| Related tools | from the keyword map: `savings-goal-calculator`, `emergency-fund-calculator`, `debt-snowball-calculator` |

## What it calculates
Splits monthly **take-home pay** (after tax, as the user's payslip shows it) into **needs**, **wants** and **savings** (savings includes extra debt payments). The percentages start at 50 / 30 / 20 and are editable, but must total 100.

Wording on the page: "The 50/30/20 split is **a popular budgeting guideline, not a rule**. Change the percentages to fit your life." Never says a split is right or wrong for someone.

Optional: actual monthly spending per bucket → over / under the plan for each.

## Inputs
| Field | Type | Default (example) | Min / Max | Notes |
|---|---|---|---|---|
| Currency | select | USD | standard list | |
| Monthly take-home pay | currency | 4,000 | 0 – 1,000,000,000 | Required. Help: "What reaches your bank account each month, after tax. We don't work out tax." |
| Needs % | % | 50 | 0 – 100 | Required |
| Wants % | % | 30 | 0 – 100 | Required |
| Savings % | % | 20 | 0 – 100 | Required. Help: "Savings and extra debt payments." |
| Actual needs (optional) | currency | 0 | 0 – 1,000,000,000 | `optional`, 0 = not compared |
| Actual wants (optional) | currency | 0 | 0 – 1,000,000,000 | `optional` |
| Actual savings (optional) | currency | 0 | 0 – 1,000,000,000 | `optional` |

The three actual-spending boxes sit in a collapsed "Compare with what you spend" section. Each one is compared only when it is above 0.

Percentages that don't total 100 → error under the three boxes: "Your percentages add up to {total}%. They need to total 100%." + "—". A "Reset to 50/30/20" text button appears next to the error.

URL keys: `currency`, `pay`, `needs`, `wants`, `save`, `aNeeds`, `aWants`, `aSave`.

### Currency presets (example values; percentages stay the same)
| Currency | Take-home pay |
|---|---|
| USD / CAD / AUD | 4,000 |
| GBP / EUR | 2,800 |
| INR | 80,000 |

## Outputs
| Output | How it's shown |
|---|---|
| Needs / Wants / Savings | Three rows: amount a month, and a year (× 12) in the note |
| Main result | "Savings: {amount} a month" (the bucket people act on), with needs and wants as rows |
| Split bar | `SplitBar` of the take-home pay: needs / wants / savings |
| Over / under (optional) | Per bucket with an actual entered: "{diff} over plan" / "{diff} under plan" / "On plan". For savings, under plan reads "{diff} less saved than planned" |
| Left over (optional) | When all three actuals are entered: take-home − total actual ("{x} not yet assigned" or "{x} more than your take-home pay") |

## Formula
```
needs   = take-home × needs% ÷ 100
wants   = take-home × wants% ÷ 100
savings = take-home × savings% ÷ 100
valid only when needs% + wants% + savings% = 100   (compared at 10 significant digits)

difference (each bucket) = actual − planned
left over                = take-home − (actual needs + actual wants + actual savings)
```

## Test cases (must match exactly)
| # | Inputs | Expected |
|---|---|---|
| 1 | 4,000 at 50/30/20 | needs **2,000.00** · wants **1,200.00** · savings **800.00** (a year: 24,000 / 14,400 / 9,600) |
| 2 | 3,500 at 60/30/10 | **2,100.00** · **1,050.00** · **350.00** |
| 3 | 50/30/25 | error "Your percentages add up to 105%. They need to total 100%." + "—" |
| 4 | 4,000 at 50/30/20 · actual 2,300 / 1,000 / 700 | needs **300.00 over plan** · wants **200.00 under plan** · savings **100.00 less saved than planned** · left over 0.00 |
| 5 | INR ₹80,000 at 50/30/20 | **₹40,000.00** · **₹24,000.00** · **₹16,000.00** |
| 6 | 3,000 at 33.33 / 33.33 / 33.34 | valid (total 100) · 999.90 · 999.90 · 1,000.20 |
| 7 | Switch USD → GBP without editing | pay 4,000 → 2,800; percentages unchanged. A typed pay is kept |

## Edge cases
- Take-home 0 → all 0.00 (valid). A bucket at 0% → 0.00 (valid, e.g. 70/30/0).
- Percentages over 100 or negative → field error on that box. Totals ≠ 100 → the shared error above.
- Huge values → formatted, never `e+`/NaN/Infinity.

## Quality gate 8 (UI input tests)
- Clear take-home or any % box → "Enter a number" and "—". Clear an actual (optional) → valid, comparison hidden.
- 0 / negative / huge in every box → no NaN or Infinity (a % change that breaks the 100 total shows the total error + "—").
- Switch every currency → result updates. Open "Compare with what you spend" and enter actuals → over/under rows appear (added to `tests/ui/modes.test.tsx`).

## Extras
- Chart: `SplitBar`. Scenario compare: no. Share / print / embed: yes.

## Content notes
- Examples: cases 1, 2 (a "more for needs" split), 4 (with actual spending), 5.
- FAQ: the 5 keyword-map questions + "Does debt repayment count as needs or savings?" (minimum payments are needs; extra payments count as savings in this split; link to Debt Snowball) + "Should I use my pay before or after tax?" (after tax: what reaches your account).
- Tips: start from real bank statements; savings can go to an emergency fund first (link), then goals (link to Savings Goal). No claims that a split is "right".
