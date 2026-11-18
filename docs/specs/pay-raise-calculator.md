# Tool spec: Pay Raise Calculator

> **Draft — waiting for Puru's review.** Pure maths: every number comes from the user.

| Field | Value |
|---|---|
| Slug | `pay-raise-calculator` |
| Category | `salary` |
| Risk | 🟢 green: pure maths |
| Main keyword | `pay raise calculator` (also targets `salary increase calculator`) |
| Long-tail keywords | `raise percentage calculator`, `how much is a 5% raise`, `new salary after raise` |
| Affiliate | none |
| Related tools | from the keyword map: `hourly-to-salary-calculator`, `job-offer-comparison-calculator`, `rate-increase-calculator` |

## What it calculates
Both ways: **old pay + raise % → new pay**, or **old pay + new pay → raise %**. Works for pay per hour, week, month or year, and shows the yearly difference. Optional: a user-entered inflation % to see the raise after rising prices ("real raise"). No inflation figure is ever suggested.

## Inputs
| Field | Type | Default (example) | Min / Max | Notes |
|---|---|---|---|---|
| Mode | segmented | "I know the raise %" | "I know the raise %" / "I know my new pay" | URL key `mode` |
| Currency | select | USD | standard list | Presets below |
| Pay period | select | Per year | hour / week / month / year | Labels + yearly figure |
| Hours per week | number | 40 | 1 – 100 | Only for hourly pay (yearly = hourly × hours × 52) |
| Current pay | currency | 60,000 | 0 – 100,000,000 | Help: "Before tax." |
| Raise % | % input | 5 | −50 – 200 | Raise mode. Negative = pay cut |
| New pay | currency | 63,000 | 0 – 100,000,000 | New-pay mode |
| Inflation % (optional) | % input | 0 | 0 – 50 | Help: "Optional. Enter a figure you trust; leave at 0 to skip." |

### Currency presets (example values; untouched fields follow the currency)
| Currency | Current pay (per year) | New pay |
|---|---|---|
| USD / CAD / AUD | 60,000 | 63,000 |
| GBP / EUR | 40,000 | 42,000 |
| INR | 12,00,000 | 13,20,000 |
For hourly/weekly/monthly periods the same presets are used (the user changes them). **To confirm:** OK to keep one preset per currency, not per period?

## Outputs
**New pay** (raise mode) or **Raise %** (new-pay mode) · raise amount per period · raise per year · new pay per year · real raise % (only when inflation > 0).

## Formula
```
raise mode:    new = old × (1 + raise%) ; raiseAmount = new − old
new-pay mode:  raise% = (new − old) ÷ old
per year:      hour × hoursPerWeek × 52 · week × 52 · month × 12 · year × 1
real raise %:  (1 + raise%) ÷ (1 + inflation%) − 1
```

## Test cases
| # | Inputs | Expected |
|---|---|---|
| 1 | $60,000/yr + 5% | **new $63,000.00** · raise $3,000.00 |
| 2 | old $50,000, new $54,000 | **raise 8%** · $4,000.00 a year |
| 3 | ₹12,00,000 + 10% | **new ₹13,20,000.00** · raise ₹1,20,000.00 |
| 4 | $25/hour + 4%, 40 h/week | **new $26.00/hour** · raise $1.00/hour · **$2,080.00 a year** · new pay $54,080.00 a year |
| 5 | 5% raise, inflation 3% | **real raise 1.94%** (1.05 ÷ 1.03 − 1 = 1.9417%) |
| 6 | old $4,000/month, new $3,800 | **raise −5%** shown as "a 5% pay cut" · −$2,400.00 a year |

## Edge cases
- Current pay 0 in new-pay mode → error "Enter your current pay above zero" (no divide by zero).
- Current pay 0 in raise mode → new pay 0, no error.
- Raise % below −50 or above 200 → field error. Negative pay → field error "Pay can't be negative".
- Inflation 0 → real-raise row hidden.

## Extras
Scenario compare: Plan B = a different raise %. Share / print / embed: yes. No chart.

## Content notes
Examples: US salary 5%, Indian salary 10%, UK hourly wage. FAQ answers never quote "typical" or "average" raises (no statistics).
