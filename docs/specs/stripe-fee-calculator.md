# Tool spec: Stripe Fee Calculator

> **Draft — waiting for Puru's approval.**

| Field | Value |
|---|---|
| Slug | `stripe-fee-calculator` |
| Category | `fees` |
| Risk | 🟡 yellow: company-published fees by country, checked every 3 months |
| Main keyword | `stripe fee calculator` (1K–10K/month) |
| Long-tail keywords | `stripe fee calculator india`, `stripe international card fees`, `stripe processing fees` |
| Affiliate | none |
| Related tools | from the keyword map: `freelance-invoice-generator`; `paypal-fee-calculator-uk` and `wise-fee-calculator` are not live yet, left out for now |

## What it calculates
Stripe's standard online card fee for one payment in your Stripe account's country, including the international-card and currency-conversion extras, and your payout. Or, in reverse, what to charge so you receive a set amount ("pass the fee to the customer").

## Inputs
| Field | Type | Default | Notes |
|---|---|---|---|
| Your Stripe country | select | United States | US, UK, Euro area (Ireland pricing), Canada, Australia, India. **This is the currency selector**: USD/GBP/EUR/CAD/AUD/INR follow the country |
| Mode | segmented | "Customer pays" | "Customer pays" / "I want to receive" |
| Amount | currency | per country (below) | 0 – 10,000,000 |
| Card type | select | first card in the rates file | Options come from the chosen country's `data.cards` |
| Currency conversion needed | checkbox | off | Adds `conversionPercent` |
| Card entered manually | checkbox | off | **US only** (`manualEntryPercent` 0.5); hidden for other countries |

### Currency presets (by country)
| Country | Amount |
|---|---|
| US / UK / Euro area / Canada / Australia | 100 |
| India | 10,000 |

## Formula
```
rate  = card.percent + (card.surchargePercent ?? 0)
        + (conversion ? conversionPercent : 0) + (manual ? manualPercent : 0)
fixed = card.fixed
customer pays:   fee = amount × rate/100 + fixed ; payout = amount − fee
want to receive: charge = (target + fixed) ÷ (1 − rate/100) ; fee = charge − target
```
Display rounds to the nearest cent, so the reverse result can pay out 1 cent under the target. Tip text: "Round your price up by a cent if you need the exact amount."

## Rates used
| Rates file | Official source URL |
|---|---|
| `rates/stripe-us.json` | https://stripe.com/pricing?country=US |
| `rates/stripe-gb.json` | https://stripe.com/gb/pricing |
| `rates/stripe-ie.json` | https://stripe.com/ie/pricing |
| `rates/stripe-ca.json` | https://stripe.com/ca/pricing |
| `rates/stripe-au.json` | https://stripe.com/au/pricing |
| `rates/stripe-in.json` | https://stripe.com/in/pricing |

The Sources section lists all six files, one line per country.

## Test cases (must match exactly)
| # | Inputs | Expected output | Checked against |
|---|---|---|---|
| 1 | UK · standard · £100 | **payout 98.30** · fee 1.70 | Manual (1.5% + 20p) |
| 2 | UK · international · conversion · £100 | **payout 94.65** · fee 5.35 | Manual (3.15% + 2% + 20p) |
| 3 | Canada · international · CA$100 | **payout 96.00** · fee 4.00 | Manual (2.9% + 0.8% + 30¢) |
| 4 | Australia · domestic · receive A$100 | **charge 101.98** · fee 1.98 | Manual (100.30 ÷ 0.9835 = 101.9827) |
| 5 | India · domestic · ₹10,000 | **payout ₹9,800.00** · fee ₹200.00 | Manual (2%) |
| 6 | Euro area · premium · €50 | **payout 48.35** · fee 1.65 | Manual (2.8% + €0.25) |
| 7 | US · domestic · $100 | **payout 96.80** · fee 3.20 | Manual (2.9% + 30¢) |
| 8 | US · domestic · manual · conversion · $100 | **payout 95.30** · fee 4.70 | Manual (2.9 + 0.5 + 1 = 4.4% + 30¢) |
| 9 | amount below the fixed fee (UK £0.10) | fee shown, negative payout shown with a warning, no crash | — |
| 10 | switch UK → India with the amount untouched | amount becomes ₹10,000; a typed amount is kept | — |

## Left out
- India's debit-card MDR line ("0.4% capped to ₹200") is a regulator (RBI) cap, so it's **left out** under the scope rule. Content says "Some Indian debit cards cost less; check Stripe's page."
- Local payment methods, Stripe Billing/Tax, disputes and payout currency: not modelled, only mentioned briefly in the content.

## Extras
- Chart: none. Scenario compare: yes (Plan B = a different card type or country). Share / Print / Embed: yes.
