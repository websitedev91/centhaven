# Tool spec: ROAS Calculator

> **Draft — waiting for Puru's review.** Pure maths: every number comes from the user.

| Field | Value |
|---|---|
| Slug | `roas-calculator` |
| Category | `marketing` (new hub) |
| Risk | 🟢 green: pure maths |
| Main keyword | `roas calculator` (also targets `return on ad spend calculator`) |
| Long-tail keywords | `break even roas calculator`, `how to calculate roas`, `target roas calculator` |
| Affiliate | none |
| Related tools | from the keyword map: `cac-calculator`, `cost-per-lead-calculator`, `break-even-calculator` |

## What it calculates
Two modes (`SegmentedControl`):
- **Find my ROAS:** revenue from ads ÷ ad spend, shown as a ratio ("5.00x") and a percentage ("500%").
- **Revenue needed:** ad spend × target ROAS = the revenue the ads must bring in.

Both modes take an optional **profit margin %** (before ad costs). With it the tool shows **break-even ROAS = 1 ÷ margin**: the ROAS at which ad spend uses up all the profit. No "good ROAS" figure is stated anywhere.

## Inputs
| Field | Type | Default (example) | Min / Max | Mode | Notes |
|---|---|---|---|---|---|
| Mode | segmented | Find my ROAS | `find` / `needed` | both | URL key `mode` |
| Currency | select | USD | standard list | both | |
| Revenue from ads | currency | 15,000 | 0 – 10,000,000,000 | find | Required |
| Ad spend | currency | 3,000 | 0 – 10,000,000,000 | both | Required |
| Target ROAS | number (x) | 4 | 0 – 1,000, 2 decimals | needed | Required. Help: "4 means 4 in revenue for every 1 spent (400%)." |
| Profit margin before ad spend (optional) | % | 40 | 0 – 100 | both | `optional`, 0 = break-even rows hidden. Help: "What is left of each sale after product and delivery costs, before ads." |

URL keys: `mode`, `rev`, `spend`, `target`, `margin`.

### Currency presets (example values; target and margin stay the same)
| Currency | Revenue | Ad spend |
|---|---|---|
| USD / GBP / EUR / CAD / AUD | 15,000 | 3,000 |
| INR | 2,50,000 | 50,000 |

## Outputs
| Output | Mode | How it's shown |
|---|---|---|
| **ROAS** | find | Main result "5.00x", sub-line "500% return on ad spend" |
| Revenue per 1 spent | find | "Every 1 spent brought in {ROAS formatted as money}" |
| **Revenue needed** | needed | Main result, sub-line "for {target}x on {spend} of ads" |
| Break-even ROAS | both, margin > 0 | "{x.xx}x ({%})" |
| Profit after ad spend | find, margin > 0 | revenue × margin − spend; negative shown as a loss |
| Status | both, margin > 0 | find: "Above break-even: the ads are profitable" / "Below break-even: the ads cost more than the profit they bring in" / "Exactly break-even". needed: target < break-even → warning "This target is below your break-even ROAS of {x}x, so it would lose money." |

## Formula
```
ROAS            = revenue ÷ spend                  (spend > 0)
ROAS %          = ROAS × 100
breakEvenROAS   = 1 ÷ (margin ÷ 100)               (margin > 0)
profitAfterAds  = revenue × margin/100 − spend
revenueNeeded   = spend × target
```
Ratios and percentages shown to 2 decimals, trailing ".00" dropped on percentages (500%, 333.33%); money rounded at display only.

## Test cases (must match exactly)
| # | Inputs | Expected |
|---|---|---|
| 1 | find · revenue 15,000 · spend 3,000 · margin 0 | **ROAS 5.00x · 500%** · break-even rows hidden |
| 2 | case 1 + margin 40% | **break-even 2.50x (250%)** · profit after ads 3,000.00 · "Above break-even" |
| 3 | find · revenue 4,000 · spend 2,500 · margin 25% | **ROAS 1.60x · 160%** · break-even 4.00x (400%) · profit after ads **−1,500.00** · "Below break-even" |
| 4 | needed · spend 3,000 · target 4 · margin 0 | **revenue needed 12,000.00** |
| 5 | needed · spend 3,000 · target 4 · margin 20% | revenue needed 12,000.00 · break-even 5.00x · warning "below your break-even ROAS of 5.00x" |
| 6 | find · INR ₹2,50,000 · ₹50,000 · margin 30% | **ROAS 5.00x · 500%** · break-even **3.33x (333.33%)** · profit after ads ₹25,000.00 |
| 7 | find · revenue 10,000 · spend 5,000 · margin 50% | ROAS 2.00x · break-even 2.00x · "Exactly break-even" · profit 0.00 |

## Edge cases
- Spend 0 → field error "Enter an ad spend above 0" + "—" (no Infinity). In `needed` mode spend 0 → revenue needed 0.00 (valid).
- Revenue 0 → ROAS 0.00x, 0%. Target 0 → revenue needed 0.00.
- Margin 100 → break-even 1.00x. Margin > 100 or negative → field error.
- Huge values → formatted, never `e+`/NaN.

## Quality gate 8 (UI input tests)
- Clear each required field (revenue, spend, target) → "Enter a number" and "—".
- Clear margin (optional) → valid result, break-even rows hidden.
- 0 / negative / huge in every field → no NaN or Infinity on screen.
- Switch both modes and every currency → result updates; untouched money fields follow the presets.

## Extras
- Chart: no. Scenario compare: no. Share / print / embed: yes.

## Content notes
- Examples: case 2 (profitable campaign), case 3 (campaign under break-even), case 6 (Indian shop).
- FAQ: the 5 keyword-map questions + "Should I use revenue or profit for ROAS?" + "Why is my ROAS high but I'm not making money?". "What is a good ROAS?" answers with break-even ROAS from the user's own margin, never an industry number.
- Tips: track revenue from the same period and channel as the spend; ROAS ignores other costs, so check profit after ads; link to CAC.
