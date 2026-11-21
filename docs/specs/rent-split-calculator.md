# Tool spec: Rent Split Calculator

> **Approved by Puru (2026-11-21).** Pure maths: every number comes from the user. There are no name boxes: rows are "Person 1"…"Person 6", so no names end up in share links or analytics URLs. The page never says which split is "fair".

| Field | Value |
|---|---|
| Slug | `rent-split-calculator` |
| Category | `personal-finance` |
| Risk | 🟢 green: pure maths |
| Main keyword | `rent split calculator` |
| Long-tail keywords | `roommate rent calculator`, `split rent by income`, `split rent by room size`, `rent share calculator` |
| Affiliate | none |
| Related tools | from the keyword map: `50-30-20-budget-calculator`, `savings-goal-calculator`, `emergency-fund-calculator` |

## What it calculates
Three modes (`SegmentedControl`, URL key `mode`):
- **Equally** (`equal`): rent ÷ number of people.
- **By room size** (`room`): each person pays rent × their room size ÷ total room size.
- **By income** (`income`): each person pays rent × their income ÷ total income. The page shows each person's income %.

Optional **shared bills** (monthly) are split equally or the same way as the rent. The user picks which with a second segmented control.

By room size, an optional **Shared space: % of rent split equally** (default 0 = off; Puru, 2026-11-21) splits that part of the rent equally for the kitchen and living room; the rest is split by room size.

**Rounding (Puru, 2026-11-21; CLAUDE.md rule 3 exception):** shares must add up exactly. Each share is rounded **down** to the cent, then the leftover cents go to Person 1, 2… in order (skipping anyone whose share is 0): 1,000 ÷ 3 → 333.34 / 333.33 / 333.33. Rent and bills are rounded separately. The note under the result always says so.

## Inputs
| Field | Type | Default (example) | Min / Max | Mode | Notes |
|---|---|---|---|---|---|
| Mode | segmented | Equally | `equal` / `room` / `income` | – | |
| Currency | select | USD | standard list | all | |
| Monthly rent | currency | 2,400 | 0 – 1,000,000,000 | all | Required |
| Shared bills per month (optional) | currency | 300 | 0 – 1,000,000,000 | all | `optional`, 0 = bills rows hidden. Help: "Utilities, internet and other shared costs. Example value only." |
| Split bills | segmented | Equally | `equal` / `rent` ("Same way as rent") | room, income | Shown when bills > 0. In equal mode both options give the same result, so it's hidden |
| People | rows "Person 1"…"Person 6" | 3 rows | 2 – 6 rows | all | Add / remove (min 2). No name boxes |
| · Room size | number | 150 / 120 / 90 (rows 4–6: 100) | 0.01 – 100,000 | room | Required. 0 → "Enter a room size above 0" |
| Shared space: % of rent split equally (optional) | % | 0 | 0 – 100 | room | `optional`, 0 = off. Help: "For the kitchen, living room and other shared space. The rest is split by room size." |
| Room size unit | select | sq ft | sq ft / m² | room | A label only. Nothing is converted, and the help asks for the same unit for every room |
| · Income | currency | see presets | 0 – 1,000,000,000 | income | Required. 0 is allowed (that person's share is 0). All incomes 0 → error on Person 1: "Enter at least one income above 0". Help: "Use the same period for everyone, e.g. monthly take-home." |

URL keys: `mode`, `currency`, `rent`, `bills`, `billSplit`, `shared`, `unit`, `rows`, `s1`…`s6`, `i1`…`i6`.
Removing a person moves later rows up. Rows past the count go back to the defaults, so the share URL keeps no leftover `s5=…&i5=…` (same rule as Debt Snowball and Meeting Cost).

### Currency presets (example values; room sizes stay the same)
| Currency | Rent | Bills | Incomes (Person 1 / 2 / 3; rows 4–6) |
|---|---|---|---|
| USD / CAD / AUD | 2,400 | 300 | 4,000 / 3,000 / 3,000; 3,000 |
| GBP / EUR | 1,800 | 240 | 3,000 / 2,250 / 2,250; 2,250 |
| INR | 30,000 | 4,500 | 60,000 / 45,000 / 45,000; 45,000 |

## Outputs
| Output | How it's shown |
|---|---|
| **Per person** (one card per row) | Rent share · bills share (if bills > 0) · **total per month** · % of rent (up to 2 decimals) |
| Income % | income mode: each person's income ÷ total income, worded "40% of combined income" (Puru, 2026-11-21: it is the share of everyone's total, not of their own income) |
| Totals | rent + bills = total to pay each month |
| Shared space / By room size | room mode, shared > 0: the shared part (split equally) and the rest (split by size) |
| Rounding note | Always: "Each share is rounded down to the cent, then any leftover cents go to Person 1, Person 2 and so on, so the shares add up to the total exactly." |

## Formula
```
equal:   weight_i = 1
room:    fraction_i = shared% ÷ people + (1 − shared%) × roomSize_i ÷ Σ roomSize
income:  weight_i = income_i
share_i       = weight_i ÷ Σ weights
rent_i        = rent × share_i
bills_i       = billSplit = equal ? bills ÷ people : bills × share_i
total_i       = rent_i + bills_i
```
Cents: share_i = floor(totalCents × fraction_i); leftover = totalCents − Σ share_i, handed out 1 cent each to Person 1, 2… (skipping zero shares).

## Test cases (must match exactly)
| # | Inputs | Expected |
|---|---|---|
| 1 | equal · 3 people · 2,400 + bills 300 | each: rent **800.00** + bills 100.00 = **900.00** · 33.33% |
| 2 | room · 150 / 120 / 90 · 2,400 · bills 300 equally | rent **1,000.00 / 800.00 / 600.00** · totals 1,100.00 / 900.00 / 700.00 · 41.67% / 33.33% / 25% |
| 3 | room · same · bills same way as rent | bills 125.00 / 100.00 / 75.00 · totals 1,125.00 / 900.00 / 675.00 |
| 4 | income · 4,000 / 3,000 / 3,000 · 2,400 · bills 300 same way as rent | 40% / 30% / 30% · rent **960.00 / 720.00 / 720.00** · bills 120.00 / 90.00 / 90.00 · totals **1,080.00 / 810.00 / 810.00** |
| 5 | INR income defaults · ₹30,000 · bills ₹4,500 equally · ₹60,000 / ₹45,000 / ₹45,000 | rent **₹12,000.00 / ₹9,000.00 / ₹9,000.00** · bills ₹1,500.00 each · totals **₹13,500.00 / ₹10,500.00 / ₹10,500.00** |
| 6 | equal · 3 people · 1,000 · no bills | **333.34 / 333.33 / 333.33** (adds up to 1,000.00) |
| 6b | equal · 6 people · 1,000 | **166.67 × 4 / 166.66 × 2** |
| 6c | INR equal · ₹25,000 ÷ 3 | **₹8,333.34 / ₹8,333.33 / ₹8,333.33** |
| 6d | INR equal · 6 people · ₹1,00,000 + bills ₹5,000 | rent ₹16,666.67 × 4 / ₹16,666.66 × 2 · bills ₹833.34 × 2 / ₹833.33 × 4 · total ₹1,05,000.00 |
| 6e | room · 2,400 · 25% shared · 150 / 120 / 90 (Puru, 2026-11-21) | 200 each shared + 1,800 by size (750 / 600 / 450) → **950 / 800 / 650** |
| 7 | equal · 6 people · 3,000 · no bills | **500.00** each · no rounding note |
| 8 | income · 4,000 / 0 / 4,000 · 2,400 | 1,200.00 / **0.00** / 1,200.00 |
| 9 | 4 rows, remove Person 2 | rows 3–4 move up. The URL has `rows=3` and no `s4`/`i4` |
| 10 | Switch USD → INR without editing | rent, bills and incomes take the INR presets; room sizes unchanged. A typed rent is kept |

## Edge cases
- Rent 0 → 0.00 everywhere (valid). Bills empty / 0 → bills rows hidden.
- Room size 0 or empty → field error on that row. All incomes 0 → error. Negative → field error.
- Fewer than 2 or more than 6 rows can't be made (buttons disabled). Huge values → formatted, never `e+`/NaN/Infinity.

## Quality gate 8 (UI input tests)
- Clear rent and every row's room size / income → "Enter a number" and "—". Clear bills (optional) → valid, bills hidden.
- 0 / negative / huge in every box → no NaN or Infinity on screen.
- Switch all three modes, both bill splits and every currency → result updates (`room` and `income` modes added to `tests/ui/modes.test.tsx`).

## Extras
- Chart: no (the per-person cards already show it). Scenario compare: no. Share / print / embed: yes.

## Content notes
- Examples: cases 1, 2, 4 (+ the INR case).
- FAQ: the 5 keyword-map questions + "Can a couple share one room?" (treat them as one row, then split their share) + "Why are there no name boxes?" (privacy: names would end up in share links).
- "How do you split rent fairly?" is answered with the three methods and what each one weighs. The page never says one is fairer. No local tenancy or legal rules.
