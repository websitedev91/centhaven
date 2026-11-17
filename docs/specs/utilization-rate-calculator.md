# Tool spec: Utilization Rate Calculator

| Field | Value |
|---|---|
| Slug | `utilization-rate-calculator` |
| Category | `business` (new category) |
| Risk | 🟢 green: pure maths |
| Main keyword | `utilization rate calculator` (100–1K/month) |
| Long-tail keywords | `billable utilization calculator`, `billable hours calculator`, `how to calculate utilization rate`, `employee utilization rate` |
| Affiliate | `time-tracking-software` (add to config/affiliates.json, disabled) |
| Related tools | `hourly-rate-calculator`, `rate-increase-calculator`, `consulting-fee-calculator` |

## What it calculates
What share of your available hours is billable, how far you are from a target, and what the gap is worth in revenue. For freelancers, consultants and agency teams.

## Inputs
| Field | Type | Default | Min / Max | Notes |
|---|---|---|---|---|
| Period | select | Week | Week / Month / Year | Label only |
| Billable hours | number | 28 | 0 – 10,000 | |
| Available hours | number | 40 | 1 – 10,000 | Total hours you (or the team) could work (gross capacity) |
| Leave/holiday hours to exclude (added 2026-11-17, review C9) | number | 0 | 0 – 10,000 | Optional; net capacity = available − leave |
| Target utilization | % slider | 75% | 10 – 100% | Helper: "Many agencies aim for 70–80%" (label as a common range, not a rule) |
| Hourly rate (optional) | currency | 100 | 0 – 1,000,000 | For the revenue gap; standard currency list |

## Outputs
| Output | How it's shown |
|---|---|
| **Utilization rate %** | Main result |
| Billable hours at target | Breakdown |
| Hours gap (below target) or hours above target | Breakdown, green if above |
| Revenue gap (gap hours × rate) | Breakdown (0 if at or above target) |
| Non-billable hours | Breakdown |

## Formula
```
utilization  = billable / available
targetHours  = target × available
gapHours     = targetHours − billable      (negative = above target)
revenueGap   = max(gapHours, 0) × rate
net          = available − leave            (leave defaults to 0)
utilization, targetHours, nonBillable use net instead of available
nonBillable  = net − billable
Guard: leave ≥ available → "Leave hours must be less than available hours"
```
Guard: billable > available → error "Billable hours can't be more than available hours".

## Rates used
None.

## Test cases
| # | Inputs | Expected | Checked against |
|---|---|---|---|
| 1 | billable 28 · available 40 · target 75% · rate 100 | **70.00%** · target hours 30 · gap **2 hours** · revenue gap **200.00** · non-billable 12 | Manual |
| 2 | billable 1,200 · available 1,800 · target 65% · rate 1,500 | **66.67%** · target hours 1,170 · **30 hours above target** · revenue gap 0.00 | Manual |
| 3 | billable 0 · available 40 · target 75% · rate 100 | 0.00% · gap 30 · revenue gap 3,000.00 | Manual |
| 4 | billable 50 · available 40 | Error, no crash | — |
| 5 | billable 28 · available 40 · leave 8 · target 75% · rate 100 | net 32 · **87.50%** · target hours 24 · 4 hours above · revenue gap 0.00 · non-billable 4 | Manual |
| 6 | billable 120 · available 168 · leave 16 · target 80% · rate 75 | net 152 · **78.95%** · target 121.6 · gap 1.6 h · revenue gap 120.00 | Manual |

## Extras
- Chart: one horizontal bar (billable vs non-billable) with a marker at the target.
- Scenario compare: no. Share / Print / Embed: yes.

## Content notes
- Examples: a freelancer (weekly), an agency designer (monthly), a consulting team (yearly: 1,200 / 1,800).
- FAQ: What is utilization rate? · What is a good utilization rate? · Billable vs non-billable hours? · Why not aim for 100%? · How do agencies use utilization? · How do I increase my utilization? · Utilization vs productivity?
