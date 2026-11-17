# Tool spec: Rate Increase Calculator

| Field | Value |
|---|---|
| Slug | `rate-increase-calculator` |
| Category | `freelance` |
| Risk | 🟢 green: pure maths |
| Main keyword | `rate increase calculator` (100–1K/month) |
| Long-tail keywords | `how much to raise freelance rates`, `price increase calculator`, `will i lose clients if i raise my rates` |
| Affiliate | `invoicing-software` (disabled until approved) |
| Related tools | `hourly-rate-calculator`, `utilization-rate-calculator`, `consulting-fee-calculator` |

## What it calculates
What happens to your monthly income if you raise your rate and lose some work, and how much work you could lose before you earn less than today.

## Inputs
| Field | Type | Default | Min / Max | Notes |
|---|---|---|---|---|
| Currency | select | USD | standard list | INR default rate 1,000 |
| Current rate (per hour) | currency | 50 | 0.01 – 1,000,000 | |
| Billable hours per month now | number | 100 | 1 – 744 | |
| Rate increase | % slider | 20% | 1 – 200% | |
| Work you might lose | % slider | 10% | 0 – 100% | Helper: "Share of hours or clients that may leave after the increase" |

## Outputs
| Output | How it's shown |
|---|---|
| **Change in monthly income** (+/−, green or red) | Main result |
| New rate | Breakdown |
| Monthly income now / after | Breakdown |
| Hours after the change (and hours freed up) | Breakdown |
| Change per year (monthly × 12), added 2026-11-17, review C8 | Breakdown |
| Quick comparison: +10%, +20%, +30% at the user's loss % (new rate, change per month, break-even loss) | Table below the chart |
| Client notice: fills in current rate, new rate and an effective date the user picks; copy button | Box below the table |
| **Break-even work loss**: you can lose up to X% and still earn the same | Highlight line |

## Formula
```
newRate      = rate × (1 + increase)
currentRev   = rate × hours
newHours     = hours × (1 − loss)
newRev       = newRate × newHours
change       = newRev − currentRev
breakEvenLoss = increase / (1 + increase)
yearlyChange  = change × 12
```

## Rates used
None.

## Test cases
| # | Inputs | Expected | Checked against |
|---|---|---|---|
| 4 | yearly change for cases 1–3 | +4,800.00 · −93,600.00 · +14,400.00 | Manual |
| 5 | quick comparison at 50 · 100 h · lose 10% | +10%: 55.00 · −50.00 · 9.09% · +20%: 60.00 · +400.00 · 16.67% · +30%: 65.00 · +850.00 · 23.08% | Manual |
| 1 | rate 50 · 100 h · +20% · lose 10% | new rate **60.00** · now 5,000.00 · after 5,400.00 · hours 90 · **change +400.00** · break-even loss **16.67%** | Manual |
| 2 | rate 1,000 · 120 h · +10% · lose 15% | new rate 1,100.00 · now 120,000.00 · after 112,200.00 · hours 102 · **change −7,800.00** · break-even 9.09% | Manual |
| 3 | rate 80 · 60 h · +25% · lose 0% | new rate 100.00 · now 4,800.00 · after 6,000.00 · **change +1,200.00** · break-even 20.00% | Manual |

## Extras
- **Chart:** line chart of monthly income (y) against work lost 0–50% (x) at the chosen increase, with a horizontal line for today's income; the crossing point is the break-even.
- Scenario compare: yes (e.g. +10% vs +25%).
- Share / Print / Embed: yes.

## Content notes
- Examples: designer raising $50 → $60; Indian developer ₹1,000 → ₹1,100 who loses too much work (negative result, a useful lesson); coach with no client loss.
- FAQ: How much should I raise my rates? · How often should freelancers raise rates? · Will I lose clients? · How do I tell clients about a rate increase? · What is the break-even point? · Should I raise rates for existing clients? · Is a bigger increase always better?
- Tip section: raising rates also frees up time (hours freed), which has value.
