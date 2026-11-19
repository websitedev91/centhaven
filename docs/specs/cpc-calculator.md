# Tool spec: CPC Calculator

> **Draft — waiting for Puru's review.** Pure maths: every number comes from the user.

| Field | Value |
|---|---|
| Slug | `cpc-calculator` |
| Category | `marketing` |
| Risk | 🟢 green: pure maths |
| Main keyword | `cpc calculator` |
| Long-tail keywords | `cost per click calculator`, `how to calculate cpc`, `cost per conversion calculator`, `ppc budget calculator` |
| Affiliate | none |
| Related tools | from the keyword map: `cost-per-lead-calculator`, `roas-calculator`, `cac-calculator` |

## What it calculates
Two modes (`SegmentedControl`, URL key `mode`):
- **Find my CPC** (`find`): ad spend ÷ clicks = cost per click.
- **Clicks from a budget** (`clicks`): budget ÷ CPC = clicks the budget buys.

Both take an optional **conversion rate %** (clicks that become a sale, lead or sign-up) → conversions and **cost per conversion**. No "average CPC" figures anywhere.

## Inputs
| Field | Type | Default (example) | Min / Max | Mode | Notes |
|---|---|---|---|---|---|
| Mode | segmented | Find my CPC | `find` / `clicks` | – | |
| Currency | select | USD | standard list | both | |
| Ad spend | currency | 500 | 0 – 10,000,000,000 | find | Required |
| Clicks | number | 250 | 1 – 1,000,000,000, whole | find | Required. 0 → "Enter at least 1 click" |
| Budget | currency | 1,000 | 0 – 10,000,000,000 | clicks | Required |
| Cost per click | currency | 1.25 | 0.01 – 1,000,000 | clicks | Required. 0 → "Enter a cost per click above 0" |
| Conversion rate (optional) | % | 4 | 0 – 100, 2 decimals | both | `optional`, 0 = conversion rows hidden |

URL keys: `mode`, `spend`, `clicks`, `budget`, `cpc`, `conv`.

### Currency presets (example values; clicks and rate stay the same)
| Currency | Spend | Budget | CPC |
|---|---|---|---|
| USD / GBP / EUR / CAD / AUD | 500 | 1,000 | 1.25 |
| INR | 20,000 | 50,000 | 25 |

## Outputs
| Output | Mode | How it's shown |
|---|---|---|
| **Cost per click** | find | Main result (2 decimals) |
| **Clicks** | clicks | Main result: whole → "800 clicks"; fractional → "about 333 clicks" (rounded down, you can't buy part of a click) |
| Conversions | both, rate > 0 | whole → "10 conversions"; fractional → "about 7.5 conversions (on average)" (same wording as cost per lead) |
| **Cost per conversion** | both, rate > 0 | spend (or budget) ÷ conversions |
| Clicks per conversion | both, rate > 0 | "About {100 ÷ rate, 1 decimal} clicks for each conversion" |

## Formula
```
find:   CPC    = spend ÷ clicks
clicks: clicks = budget ÷ CPC               (shown rounded down)
conversions          = clicks × rate          (clicks unrounded in clicks mode)
cost per conversion  = spend (or budget) ÷ conversions
clicks per conversion = 100 ÷ rate (%)
```

## Test cases (must match exactly)
| # | Inputs | Expected |
|---|---|---|
| 1 | find · spend 500 · clicks 250 · rate 0 | **CPC 2.00** · conversion rows hidden |
| 2 | find · spend 500 · clicks 250 · rate 4% | 10 conversions · **cost per conversion 50.00** · 25 clicks per conversion |
| 3 | clicks · budget 1,000 · CPC 1.25 · rate 3% | **800 clicks** · 24 conversions · **41.67** |
| 4 | clicks · budget 100 · CPC 0.30 · rate 0 | **about 333 clicks** (333.33) |
| 5 | INR · find · ₹20,000 · 800 clicks · rate 2.5% | **CPC ₹25.00** · 20 conversions · **₹1,000.00** |
| 6 | find · spend 300 · clicks 120 · rate 5% | CPC 2.50 · **6 conversions** (whole, so no "about") · 50.00 |
| 7 | find · spend 1,000 · clicks 450 · rate 3% | CPC 2.22 · **about 13.5 conversions (on average)** · 74.07 |
| 8 | Switch USD → INR without editing | spend 500 → 20,000, budget → 50,000, CPC → 25; clicks and rate unchanged. A typed value is kept |

## Edge cases
- Clicks 0 → field error; CPC 0 in clicks mode → field error (no Infinity). Decimal clicks → "Enter a whole number".
- Spend 0 → CPC 0.00, cost per conversion 0.00. Budget 0 → 0 clicks.
- Rate > 100 or negative → field error. Huge values → formatted, never `e+`/NaN.

## Quality gate 8 (UI input tests)
- Clear each required field in both modes → "Enter a number" and "—". Clear the rate (optional) → valid, rows hidden.
- 0 / negative / huge in every field → no NaN or Infinity on screen.
- Switch both modes and every currency → result updates (`clicks` mode added to `tests/ui/modes.test.tsx`).

## Extras
- Chart: no. Scenario compare: yes, Plan B = another campaign's spend / clicks / rate (find mode). Share / print / embed: yes.

## Content notes
- Examples: cases 2, 3, 5.
- FAQ: the 5 keyword-map questions + "What is the difference between CPC and CPM?" (explain only; no CPM tool) + "How do I set a daily budget?" (budget ÷ days, maths only).
- Tips: compare campaigns by cost per conversion; check ROAS too; link to cost per lead and CAC.
