# Tool spec: Commission Calculator

> **Draft — waiting for Puru's review.** Pure maths: every rate and tier is entered by the user.

| Field | Value |
|---|---|
| Slug | `commission-calculator` |
| Category | `salary` |
| Risk | 🟢 green: pure maths |
| Main keyword | `commission calculator` |
| Long-tail keywords | `sales commission calculator`, `tiered commission calculator`, `commission rate calculator`, `how to calculate commission` |
| Affiliate | none |
| Related tools | from the keyword map: `pay-raise-calculator`, `hourly-to-salary-calculator`, `break-even-calculator` |

## What it calculates
Commission on a sales amount, either at one **flat %** or with **tiered %** (up to 4 tiers), plus optional base pay → total earnings and the effective commission rate.

**Tiers are marginal**: each rate applies only to the part of sales inside its tier (like steps). A note says so, because some plans instead pay the top rate on everything. **To confirm:** marginal only for v1, or add an "all sales at the reached tier's rate" option?

## Inputs
| Field | Type | Default (example) | Min / Max | Notes |
|---|---|---|---|---|
| Plan type | segmented | Flat rate | Flat / Tiered | |
| Currency | select | USD | standard list | Presets below |
| Sales amount | currency | 50,000 | 0 – 1,000,000,000 | For the period |
| Commission rate (flat) | % input | 5 | 0 – 100 | |
| Tiers (tiered) | up to 4 rows: "From" (currency) + rate % | 0 → 3% · 20,000 → 5% · 50,000 → 8% | from ≥ 0, rate 0 – 100 | First tier starts at 0; each "From" must be above the one before |
| Base pay (optional) | currency | 0 | 0 – 100,000,000 | Same period as the sales |

### Currency presets (example values)
| Currency | Sales | Tier starts |
|---|---|---|
| USD / GBP / EUR / CAD / AUD | 50,000 | 0 · 20,000 · 50,000 |
| INR | 5,00,000 | 0 · 2,00,000 · 5,00,000 |

## Outputs
**Commission** · total earnings (base + commission) · effective rate (commission ÷ sales) · tiered: a row per tier (sales in tier × rate = amount).

## Formula
```
flat:    commission = sales × rate
tiered:  for each tier i with start s_i and next start s_(i+1) (∞ for the last):
           inTier_i = clamp(sales − s_i, 0, s_(i+1) − s_i)
           commission += inTier_i × rate_i
total = base + commission ; effective = commission ÷ sales (0 if sales = 0)
```

## Test cases
| # | Inputs | Expected |
|---|---|---|
| 1 | flat · $50,000 · 5% | **commission $2,500.00** · effective 5% |
| 2 | flat · $50,000 · 5% · base $3,000 | commission $2,500.00 · **total $5,500.00** |
| 3 | tiered · $60,000 · 0→3%, 20,000→5%, 50,000→8% | 600 + 1,500 + 800 = **$2,900.00** · effective **4.83%** |
| 4 | tiered · $15,000 · same tiers | **$450.00** (all in tier 1) · effective 3% |
| 5 | tiered · ₹6,00,000 · 0→3%, 2,00,000→5%, 5,00,000→8% | 6,000 + 15,000 + 8,000 = **₹29,000.00** |

## Edge cases
- Sales 0 → commission 0, effective rate shows "—" (no divide by zero).
- Negative sales, base or rate → field error. Rate > 100% → field error.
- Tier "From" not above the previous one → error "Each tier must start above the one before".
- Empty tier rows are ignored. First tier always starts at 0 (locked).

## Extras
Scenario compare: Plan B = a different flat rate or tier set ("compare two commission plans"). Share / print / embed: yes. Chart: none (the per-tier rows explain it).
