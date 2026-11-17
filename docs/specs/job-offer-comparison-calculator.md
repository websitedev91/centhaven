# Tool spec: Job Offer Comparison Calculator

> **Draft for Puru's review, 2026-11-18.**

| Field | Value |
|---|---|
| Slug | `job-offer-comparison-calculator` |
| Category | `salary` |
| Risk | 🟢 green: pure maths, before tax |
| Main keyword | `job offer comparison calculator` (10–100/month) |
| Long-tail keywords | `compare two job offers calculator`, `remote job offer comparison`, `job offer total compensation calculator` |
| Affiliate | none |
| Related tools | from the keyword map: `hourly-to-salary-calculator`, `1099-vs-w2-calculator`, `day-rate-to-salary-calculator` (only live ones are shown) |

## What it calculates
It compares two job offers side by side and gives each one a **yearly value before tax**. That value is salary + bonus + employer retirement contribution + other benefits, minus what the commute costs you. You can optionally put a value on your commute time. The tool also shows each offer's **effective hourly pay**, with commute hours counted as time given to the job.

Taxes are not included, and the copy says so. Both offers are taxed by the same country's rules, so the pre-tax comparison still ranks them fairly in most cases.

## Inputs
For each offer (A and B):

| Field | Type | Default A / B (USD) | Min / Max | Notes |
|---|---|---|---|---|
| Base salary (per year) | currency | 85,000 / 92,000 | 0 – 100,000,000 | |
| Target bonus | % | 5 / 0 | 0 – 200 | % of base salary. Helper: "From the offer letter. Enter 0 if none." |
| Employer retirement contribution | % | 4 / 3 | 0 – 50 | % of salary the employer adds (401(k) match, pension, PF…). Helper: "Only what the employer pays in." |
| Other benefits (per year) | currency | 6,000 / 3,000 | 0 – 10,000,000 | Helper: "Health insurance the employer pays, allowances, stipends, a learning budget." |
| Paid leave days | number | 25 / 20 | 0 – 200 | Holidays plus public holidays |
| Hours per week | number | 40 / 40 | 1 – 100 | |
| Office days per week | number | 1 / 5 | 0 – 5 | 0 = fully remote |
| One-way commute | minutes | 30 / 50 | 0 – 300 | |
| Commute cost per office day | currency | 15 / 15 | 0 – 100,000 | Round trip: fuel, parking, fares |

Shared:

| Field | Type | Default | Min / Max | Notes |
|---|---|---|---|---|
| Currency | select | USD | standard list | Currency defaults below |
| Value of your commute time | currency per hour | 0 | 0 – 100,000 | Optional. 0 = not counted. Helper: "What an hour of your free time is worth to you. Leave at 0 to ignore." |

URL keys: `aSalary`, `aBonus`, `aMatch`, `aBenefits`, `aLeave`, `aHours`, `aOffice`, `aMins`, `aCost`, the same with a `b` prefix, plus `timeValue`.

### Currency defaults
These are example inputs, not market data.

| Currency | Salary A / B | Benefits A / B | Commute cost A / B |
|---|---|---|---|
| USD | 85,000 / 92,000 | 6,000 / 3,000 | 15 / 15 |
| CAD | 80,000 / 86,000 | 5,000 / 2,500 | 15 / 15 |
| AUD | 95,000 / 102,000 | 5,000 / 2,500 | 15 / 15 |
| GBP | 45,000 / 49,000 | 3,000 / 1,500 | 12 / 12 |
| EUR | 50,000 / 54,000 | 3,000 / 1,500 | 10 / 10 |
| INR | 12,00,000 / 13,00,000 | 50,000 / 25,000 | 150 / 150 |

Fields the user hasn't touched switch to these when the currency changes. Values the user typed are kept.

## Outputs
| Output | How it's shown |
|---|---|
| **Which offer is worth more, and by how much per year** | Main result, e.g. "Offer A is worth $3,785.00 more per year (before tax)". If the values are equal: "Both offers are worth the same". |
| Yearly value of A and B | Two cards side by side |
| Breakdown table (A column, B column) | Base salary · Bonus · Retirement contribution · Other benefits · **Total pay package** · Commute costs (−) · Value of commute time (−, only when the time value is above 0) · **Yearly value** · Work hours per year · Commute hours per year · **Effective hourly pay** (incl. commute time) |
| Note | "Before tax. Taxes, stock and one-off sign-on bonuses are not included." |

## Formula
```
workDays        = 260 − leaveDays                  (52 weeks × 5 days)
officeDaysYear  = workDays × officeDays ÷ 5
commuteHours    = officeDaysYear × 2 × commuteMins ÷ 60
commuteCost     = officeDaysYear × costPerDay
bonus           = salary × bonus%
match           = salary × match%
totalPay        = salary + bonus + match + benefits
timeCost        = commuteHours × timeValue
yearlyValue     = totalPay − commuteCost − timeCost
workHours       = workDays × hoursPerWeek ÷ 5
effectiveHourly = (totalPay − commuteCost) ÷ (workHours + commuteHours)
difference      = yearlyValue(A) − yearlyValue(B)      (> 0 → A, < 0 → B, 0 → tie)
```
Validation: paid leave must leave at least 1 work day (leaveDays ≤ 259), otherwise an inline error.

## Rates used
| Rates file | What it holds | Official source URL |
|---|---|---|
| none | | |

## Test cases (must match exactly)
| # | Inputs | Expected output | Checked against |
|---|---|---|---|
| 1 | USD defaults (above), time value 0 | A: work days 235 · office days 47 · commute 47.00 h · commute cost 705.00 · total pay 98,650.00 · **value 97,945.00** · work hours 1,880 · effective 50.83 / h. B: work days 240 · commute 400.00 h · cost 3,600.00 · total pay 97,760.00 · **value 94,160.00** · work hours 1,920 · effective 40.59 / h. **A worth 3,785.00 more** | Manual |
| 2 | Case 1 + time value 20 | A time cost 940.00 → **97,005.00**. B time cost 8,000.00 → **86,160.00**. **A worth 10,845.00 more**. Effective hourly unchanged (50.83 / 40.59) | Manual |
| 3 | INR. A: 12,00,000 · bonus 10% · match 12% · benefits 50,000 · leave 30 · 45 h/wk · 5 office days · 60 min · 300/day. B: 14,00,000 · 0% · 0% · 0 · leave 20 · 45 h/wk · 0 office days · 0 min · 0 | A: total pay 15,14,000.00 · commute 460 h · cost 69,000.00 · **value 14,45,000.00** · effective 571.15 / h. B: **value 14,00,000.00** · effective 648.15 / h. **A worth 45,000.00 more** (but B pays more per hour) | Manual |
| 4 | B = exact copy of A | Difference 0.00 → "Both offers are worth the same" | Manual |
| 5 | Office days 0, commute 90 min, cost 50 | Commute hours 0, commute cost 0, no time cost | Manual |
| 6 | Leave days 260 | Inline error, no crash, no Infinity / NaN | — |

## Extras
- Chart: none. The two-column table is clearer.
- Scenario compare: not needed, because the tool is already a comparison.
- Share / Print / Embed: yes.

## Content notes
- Examples: case 1 (US: a hybrid offer beats a higher salary once commute is counted), case 2 (the same offers when commute time is valued at $20/h), case 3 (India: a higher package with a long commute vs a remote job that pays more per hour).
- FAQ (6): the 5 keyword-map questions + "Does this include tax?".
- Tips: ask for the bonus history, not only the target. Check whether the retirement match vests. Count the days you would really go to the office. Use the hourly-to-salary tool to compare hourly offers.
- Internal links: from the keyword map.
