# Tool spec: CAC Calculator

> **Approved by Puru, 2026-11-19** (all test numbers verified). Decision: 3 : 1 stays as the editable start value with the rule-of-thumb label. Pure maths: every number comes from the user.

| Field | Value |
|---|---|
| Slug | `cac-calculator` |
| Category | `marketing` (new hub) |
| Risk | 🟢 green: pure maths |
| Main keyword | `cac calculator` (also targets `customer acquisition cost calculator`) |
| Long-tail keywords | `how to calculate customer acquisition cost`, `ltv to cac ratio calculator`, `cost to acquire a customer` |
| Affiliate | none |
| Related tools | from the keyword map: `cost-per-lead-calculator`, `roas-calculator`, `break-even-calculator` |

## What it calculates
Customer acquisition cost: **(marketing spend + sales spend) ÷ new customers** for the same period. With an optional customer lifetime value (LTV) it adds an LTV:CAC section: the ratio, LTV − CAC, and how the ratio compares with a target the user can change.

The target starts at 3 and is labelled **"3 : 1 is a common rule of thumb, not a rule. Change it to your own target."** It is never called a benchmark, a standard or "good".

## Inputs
| Field | Type | Default (example) | Min / Max | Notes |
|---|---|---|---|---|
| Currency | select | USD | standard list | Presets below |
| Marketing spend | currency | 8,000 | 0 – 10,000,000,000 | Help: "Ads, tools, content, agency fees: everything spent on marketing in the period." |
| Sales spend (optional) | currency | 4,000 | 0 – 10,000,000,000 | `optional`, empty = 0. Help: "Sales salaries, commissions and tools for the same period." |
| New customers | number | 60 | 1 – 1,000,000,000, whole | Required. Help: "New paying customers won in the same period." |
| Customer lifetime value (optional) | currency | 900 | 0 – 10,000,000,000 | `optional`, 0 = LTV section hidden. Help: "What one customer brings you over their whole time with you. Use profit, not revenue, if you can." |
| Target LTV:CAC (optional) | number | 3 | 0 – 100, 1 decimal | `optional`, 0 = no target line. Shown only when LTV > 0. Label text above. |

URL keys: `mkt`, `sales`, `cust`, `ltv`, `target`.

### Currency presets (example values; customers and target stay the same)
| Currency | Marketing | Sales | LTV |
|---|---|---|---|
| USD / CAD / AUD | 8,000 | 4,000 | 900 |
| GBP / EUR | 6,000 | 3,000 | 675 |
| INR | 4,00,000 | 2,00,000 | 18,000 |

## Outputs
| Output | How it's shown |
|---|---|
| **CAC** | Main result: "{CAC} per new customer" |
| Total acquisition spend | Breakdown: marketing + sales |
| Spend split | `SplitBar` marketing vs sales (hidden when sales = 0) |
| LTV:CAC ratio | "{x.x} : 1" (1 decimal), plus "Each customer brings back {ratio formatted as money-per-1} for every 1 you spend to win them" |
| LTV − CAC | "Left after acquisition cost: {LTV − CAC}" (negative shown as "−{x}" with "you spend more to win a customer than they bring in") |
| Against target | Ratio ≥ target: "At or above your {t} : 1 target." Below: "Below your {t} : 1 target. To reach it, CAC needs to be {maxCAC} or less: {customersNeeded} new customers for the same spend." |

## Formula
```
spend          = marketing + sales
CAC            = spend ÷ customers                         (customers ≥ 1)
ratio          = LTV ÷ CAC                                  (LTV > 0 and CAC > 0)
leftOver       = LTV − CAC
maxCAC         = LTV ÷ target                               (target > 0)
customersNeeded = ceil(spend × target ÷ LTV)               (= spend ÷ maxCAC, worked out without the rounded maxCAC so 75.000001 never becomes 76)
```
Money is rounded only at display (`lib/format.ts`).

## Test cases (must match exactly)
| # | Inputs | Expected |
|---|---|---|
| 1 | USD · marketing 8,000 · sales 4,000 · customers 60 · LTV 900 · target 3 | spend 12,000.00 · **CAC 200.00** · **ratio 4.5 : 1** · left over 700.00 · "At or above your 3 : 1 target" |
| 2 | marketing 5,000 · sales 0 · customers 40 · LTV 300 · target 3 | **CAC 125.00** · **ratio 2.4 : 1** · left over 175.00 · below target: max CAC 100.00 · **50 customers** for the same spend |
| 3 | INR · ₹4,00,000 · ₹2,00,000 · customers 150 · LTV ₹18,000 | spend ₹6,00,000.00 · **CAC ₹4,000.00** · **ratio 4.5 : 1** |
| 4 | marketing 1,000 · sales 0 · customers 3 · LTV 0 | **CAC 333.33** · LTV section hidden |
| 5 | marketing 10,000 · customers 20 · LTV 400 · target 3 | CAC 500.00 · ratio 0.8 : 1 · left over −100.00 + "you spend more…" · max CAC 133.33 · **75 customers** (10,000 × 3 ÷ 400 = 75) |
| 6 | Switch USD → GBP without editing | marketing 8,000 → 6,000, sales 4,000 → 3,000, LTV 900 → 675; customers 60 and target 3 unchanged; CAC 150.00, ratio 4.5 : 1. A typed marketing value (e.g. 9,500) is kept |

## Edge cases
- Customers empty → "Enter a number" + "—". Customers 0 → field error "Enter at least 1 customer", no Infinity. Decimals → "Enter a whole number".
- Spend 0 (both fields 0) → CAC 0.00; with LTV the ratio row says "No acquisition cost, so there is no ratio." (no Infinity).
- Target 0 → target line hidden. Negative inputs → field error. Huge values (10¹⁰ spend, 1 customer) → formatted number, never `e+`/NaN.

## Quality gate 8 (UI input tests)
- Clear each required field (marketing, customers) → "Enter a number" and "—".
- Clear each optional field (sales, LTV, target) → valid result (treated as 0).
- 0 / negative / huge in every field → no NaN or Infinity on screen.
- Switch every currency → result updates; untouched fields follow the presets.

## Extras
- Chart: no (`SplitBar` only). Scenario compare: yes, Plan B = different spend / customers. Share / print / embed: yes.

## Content notes
- Examples: case 1 (US online shop), case 2 (UK SaaS below target), case 3 (Indian agency).
- FAQ: the 5 keyword-map questions + "Which period should I use?" + "Should I include salaries in CAC?". The "good ratio" answer says 3 : 1 is a rule of thumb people often quote, that the right number depends on margins and cash, and that the user should set their own target. No industry CAC figures.
- Tips: use the same period for spend and customers; count only new customers; use profit-based LTV when possible; link to cost per lead.
