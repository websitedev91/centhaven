# Tool spec: Debt Snowball Calculator

> **Draft — waiting for Puru's review.** Pure maths: every number comes from the user, including each interest rate.

| Field | Value |
|---|---|
| Slug | `debt-snowball-calculator` |
| Category | `personal-finance` |
| Risk | 🟢 green: pure maths (no rates suggested, no lender rules) |
| Main keyword | `debt snowball calculator` (also targets `debt avalanche calculator`) |
| Long-tail keywords | `snowball vs avalanche calculator`, `debt payoff calculator`, `how long to pay off debt` |
| Affiliate | none |
| Related tools | from the keyword map: `savings-goal-calculator`, `emergency-fund-calculator`, `pay-raise-calculator` |

## What it calculates
For up to 5 debts, the tool pays them off month by month two ways and shows them **side by side**:
- **Snowball:** extra money goes to the **smallest balance** first.
- **Avalanche:** extra money goes to the **highest interest rate** first.

For each it shows months to debt-free ("around {Month YYYY}", browser date), total interest, total paid and the payoff order. It also shows how much interest and time the avalanche saves (or "Both methods give the same result").

## Inputs
| Field | Type | Default (example) | Min / Max | Notes |
|---|---|---|---|---|
| Currency | select | USD | standard list | Presets below |
| Debts | rows "Debt 1"…"Debt 5" | 3 rows (below) | 1 – 5 rows | Add / remove (min 1). No name boxes: names would end up in share links and analytics URLs |
| · Balance | currency | see presets | 0 – 1,000,000,000 | Required. 0 = row ignored |
| · Interest rate (APR) | % | 12 / 24 / 7 | 0 – 100 | Required. Help: "From your statement. Example values only." |
| · Minimum payment | currency | see presets | 0 – 1,000,000,000 | Required (0 allowed) |
| Extra payment each month | currency | 200 | 0 – 1,000,000,000 | `optional`, empty = 0 |

URL keys: `rows`, `b1`…`b5`, `r1`…`r5`, `m1`…`m5`, `extra`.

### Currency presets (example values; rates stay the same)
| Currency | Debt 1 (bal / min) | Debt 2 | Debt 3 | Extra |
|---|---|---|---|---|
| USD / CAD / AUD | 2,500 / 75 | 6,000 / 150 | 9,000 / 250 | 200 |
| GBP / EUR | 2,000 / 60 | 5,000 / 125 | 7,500 / 200 | 150 |
| INR | 50,000 / 2,500 | 2,00,000 / 6,000 | 1,20,000 / 4,000 | 5,000 |

INR example rates: 36% / 14% / 18% (all other currencies 12% / 24% / 7%).

## Outputs
| Output | How it's shown |
|---|---|
| **Snowball** and **Avalanche** columns | Months to debt-free (+ "about X years and Y months"), debt-free around {Month YYYY}, total interest, total paid |
| Payoff order | Each column: "Debt 1 (month 10) → Debt 2 (month 26) → Debt 3 (month 31)", ordered by the month each debt is cleared |
| Difference | "Avalanche saves {interest} in interest and {n} months" / "Snowball clears your first debt {n} months sooner" / "Both methods give the same result" |
| Monthly payment | "You pay {total} a month: minimums {sum} + extra {extra}" |
| Warning (info) | A debt whose minimum doesn't cover its monthly interest: "Debt 2's minimum doesn't cover its interest. It is paid off only once other debts are cleared." |
| Chart | Lazy Recharts: total balance over time, one line per method (≤ 60 points) |

## Formula (month by month, both methods)
```
monthly rate      = APR ÷ 100 ÷ 12           (simple monthly interest on the balance)
monthly payment   = sum of minimums + extra   (stays the same every month: cleared minimums roll over)

each month:
  1. add interest to every unpaid debt: balance × monthly rate
  2. pay every unpaid debt its minimum (or its balance, if smaller)
  3. put what is left of the monthly payment on the target debt; if it clears,
     the rest goes to the next target in the same month
target order:
  snowball  = smallest starting balance first (tie: higher rate, then row order)
  avalanche = highest rate first (tie: smaller balance, then row order)

never paid off   when monthly payment ≤ total interest in month 1
cap              600 months: "This would take more than 50 years"
```
No rounding during the calculation; money is rounded at display only. Content says: "Lenders may work out interest a little differently (daily interest, fees), so treat the result as an estimate."

## Test cases (must match exactly; worked out month by month)
| # | Inputs | Snowball | Avalanche |
|---|---|---|---|
| 1 | USD defaults: 2,500 @ 12% min 75 · 6,000 @ 24% min 150 · 9,000 @ 7% min 250 · extra 200 (payment 675) | **31 months** · interest **3,282.11** · order Debt 1 (m10) → Debt 2 (m26) → Debt 3 (m31) | **31 months** · interest **2,878.68** · order Debt 2 (m22) → Debt 1 (m25) → Debt 3 (m31) · saves **403.43** interest, 0 months |
| 2 | 1,000 @ 0% · min 100 · extra 0 | 10 months · interest 0.00 | same → "Both methods give the same result" |
| 3 | 1,000 @ 12% · min 100 · extra 0 | **11 months** · interest **58.98** | same |
| 4 | 3,000 @ 20% min 90 · 1,500 @ 10% min 50 · extra 100 | **23 months** · interest **841.34** · Debt 2 (m11) → Debt 1 (m23) | **22 months** · interest **702.05** · Debt 1 (m19) → Debt 2 (m22) · saves **139.29** and 1 month |
| 5 | INR: ₹50,000 @ 36% min 2,500 · ₹2,00,000 @ 14% min 6,000 · ₹1,20,000 @ 18% min 4,000 · extra 5,000 | **26 months** · interest **₹68,391.07** · Debt 1 (m8) → Debt 3 (m18) → Debt 2 (m26) | same (smallest debt is also the dearest) → same result |
| 6 | 10,000 @ 24% · min 150 · extra 0 | **"Never paid off"**: month-1 interest 200.00 ≥ payment 150.00 → error + "—" | same |
| 7 | Case 1 with extra 0 | 51 months · interest 6,381.50 · Debt 1 (m41) and Debt 3 (m41) → Debt 2 (m51) | (computed by the same rules) |
| 8 | Switch USD → GBP without editing | balances/mins/extra → GBP presets; rates unchanged. A typed balance is kept |

## Edge cases
- All balances 0 → "You have no debt to pay off." (valid, no columns).
- A row with balance 0 is ignored. Rate 0 → no interest. Minimum 0 is allowed (paid by rollover once it is the target).
- Never paid off → error text "Your monthly payment ({x}) doesn't cover the interest ({y}). Add to the extra payment to see a payoff date." + "—".
- Over 600 months → "This would take more than 50 years" + "—". Negative → field error. Rate > 100 → field error. Huge values → no NaN/Infinity.
- Removing a row moves later rows up (same as the meeting tool).

## Quality gate 8 (UI input tests)
- Clear each required box (every balance, rate and minimum shown) → "Enter a number" and "—". Clear extra (optional) → valid.
- 0 / negative / huge in every box → no NaN or Infinity (never-paid-off and cap cases show "—" + a message).
- Switch every currency → result updates. Add and remove a debt → result updates (added to `tests/ui/modes.test.tsx`).

## Extras
- Chart: yes (above). Scenario compare: no (the two methods are the comparison). Share / print / embed: yes.

## Content notes
- Examples: case 1, case 4, case 5 ("when both methods agree").
- FAQ: the 5 keyword-map questions + "Should I pay off debt or save first?" (link to emergency fund) + "Does the order matter if I pay the same total?". Explain snowball's motivation benefit and avalanche's interest benefit without claiming one is "best". No typical interest rates.
