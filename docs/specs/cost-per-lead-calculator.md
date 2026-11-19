# Tool spec: Cost Per Lead Calculator

> **Approved by Puru, 2026-11-19** (all test numbers verified). Change: fractional customers show as "about 7.5 customers (on average)". Pure maths: every number comes from the user.

| Field | Value |
|---|---|
| Slug | `cost-per-lead-calculator` |
| Category | `marketing` (new hub) |
| Risk | 🟢 green: pure maths |
| Main keyword | `cost per lead calculator` |
| Long-tail keywords | `cpl calculator`, `how to calculate cost per lead`, `lead conversion rate calculator` |
| Affiliate | none |
| Related tools | from the keyword map: `cac-calculator`, `roas-calculator`, `break-even-calculator` |

## What it calculates
Cost per lead: **campaign spend ÷ leads**. With an optional lead-to-customer rate (%) it shows how many leads become customers and the **cost per customer**.

## Inputs
| Field | Type | Default (example) | Min / Max | Notes |
|---|---|---|---|---|
| Currency | select | USD | standard list | Presets below |
| Campaign spend | currency | 2,000 | 0 – 10,000,000,000 | Required |
| Leads | number | 80 | 1 – 1,000,000,000, whole | Required. Help: "Enquiries, sign-ups or form fills from this spend." |
| Lead-to-customer rate (optional) | % | 10 | 0 – 100, 2 decimals | `optional`, 0 = customer rows hidden. Help: "Out of 100 leads, how many become paying customers?" |

URL keys: `spend`, `leads`, `conv`.

### Currency presets (example values; leads and rate stay the same)
| Currency | Spend |
|---|---|
| USD / GBP / EUR / CAD / AUD | 2,000 |
| INR | 60,000 |

## Outputs
| Output | How it's shown |
|---|---|
| **Cost per lead** | Main result |
| Customers from these leads | rate > 0: whole: "{n} customers"; fractional: "about {n} customers (on average)", up to 2 decimals (e.g. about 7.5, about 0.21) (Puru, 2026-11-19) |
| **Cost per customer** | rate > 0: spend ÷ customers |
| Leads per customer | rate > 0: "About {100 ÷ rate, 1 decimal} leads for each customer" |

## Formula
```
CPL              = spend ÷ leads                 (leads ≥ 1)
customers        = leads × rate/100
costPerCustomer  = spend ÷ customers  (= CPL ÷ rate/100)   (rate > 0)
leadsPerCustomer = 100 ÷ rate
```

## Test cases (must match exactly)
| # | Inputs | Expected |
|---|---|---|
| 1 | spend 2,000 · leads 80 · rate 10% | **CPL 25.00** · 8 customers · **cost per customer 250.00** · 10 leads per customer |
| 2 | spend 1,500 · leads 45 · rate 20% | **CPL 33.33** · 9 customers · **166.67** |
| 3 | INR ₹60,000 · leads 150 · rate 5% | **CPL ₹400.00** · about 7.5 customers (on average) · **₹8,000.00** |
| 4 | spend 1,000 · leads 7 · rate 3% | **CPL 142.86** · about 0.21 customers (on average) · 33.3 leads per customer · **4,761.90** |
| 5 | spend 2,000 · leads 80 · rate 0 | CPL 25.00 · customer rows hidden |
| 6 | spend 2,000 · leads 80 · rate 100% | 80 customers · cost per customer 25.00 (= CPL) |
| 7 | Switch USD → INR without editing | spend 2,000 → 60,000; leads and rate unchanged; CPL 750.00. A typed spend is kept |

## Edge cases
- Leads 0 → field error "Enter at least 1 lead" + "—" (no Infinity). Decimal leads → "Enter a whole number".
- Spend 0 → CPL 0.00, cost per customer 0.00.
- Rate > 100 or negative → field error. Huge values → formatted, never `e+`/NaN.

## Quality gate 8 (UI input tests)
- Clear each required field (spend, leads) → "Enter a number" and "—".
- Clear the rate (optional) → valid result, customer rows hidden.
- 0 / negative / huge in every field → no NaN or Infinity on screen.
- Switch every currency → result updates; untouched spend follows the presets.

## Extras
- Chart: no. Scenario compare: yes, Plan B = another channel's spend / leads / rate (compare two channels). Share / print / embed: yes.

## Content notes
- Examples: case 1 (US local service), case 2 (UK B2B), case 3 (Indian coaching business).
- FAQ: the 5 keyword-map questions + "What is the difference between cost per lead and CAC?" + "How do I find my lead-to-customer rate?". No industry CPL figures.
- Tips: compare channels by cost per customer, not cost per lead; agree what counts as a lead; link to CAC and ROAS.
