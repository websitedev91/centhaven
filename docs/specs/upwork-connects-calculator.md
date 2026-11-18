# Tool spec: Upwork Connects Calculator

> **Draft — waiting for Puru's approval.**

| Field | Value |
|---|---|
| Slug | `upwork-connects-calculator` |
| Category | `fees` |
| Risk | 🟡 yellow: company-published price, checked every 3 months |
| Main keyword | `upwork connects calculator` (100–1K/month) |
| Long-tail keywords | `upwork connects cost`, `how many connects per proposal`, `is buying upwork connects worth it` |
| Affiliate | none |
| Related tools | from the keyword map: `upwork-fee-calculator`, `fiverr-fee-calculator`, `rate-increase-calculator` |

## What it calculates
What Upwork Connects really cost per proposal, per month and per job won, and that cost as a % of an average job's value. Connects are priced in USD only, so there's **no currency selector** (so no currency presets).

## Inputs
| Field | Type | Default | Min / Max | Notes |
|---|---|---|---|---|
| Connects per proposal | number | 12 | 1 – 100 | Help: "The job post shows how many Connects it needs." |
| Proposals per month | number | 20 | 1 – 1,000 | |
| Win rate | % slider | 10% | 0 – 100% | Help: "Jobs won ÷ proposals sent." |
| Average job value (USD) | currency (USD only) | 500 | 0 – 1,000,000 | |
| Price per Connect | read-only | $0.15 | — | From `upwork-connects.json`, shown as "Upwork's price" |

## Outputs
| Output | How it's shown |
|---|---|
| **Cost per job won** | Main result |
| Cost per proposal · Connects per month · monthly Connects cost · jobs won per month · cost as % of job value | Breakdown |

## Formula
```
costPerProposal  = connectsPerProposal × price
connectsPerMonth = connectsPerProposal × proposals
monthlyCost      = costPerProposal × proposals
jobsWon          = proposals × winRate
costPerJobWon    = costPerProposal ÷ winRate      (only if winRate > 0)
shareOfJob       = costPerJobWon ÷ jobValue       (only if jobValue > 0)
```

## Rates used
| Rates file | What it holds | Official source URL |
|---|---|---|
| `rates/upwork-connects.json` | $0.15 per Connect | https://support.upwork.com/hc/en-us/articles/211062898-About-Connects-costs-uses-balances-and-expiration |

## Test cases (must match exactly)
| # | Inputs | Expected output | Checked against |
|---|---|---|---|
| 1 | 12 Connects · 20 proposals · 10% · $500 | **cost per job won 18.00** · per proposal 1.80 · 240 Connects · monthly 36.00 · 2 jobs · 3.6% | Manual |
| 2 | 6 · 30 · 5% · $200 | **18.00** · per proposal 0.90 · 180 Connects · monthly 27.00 · 1.5 jobs · 9.0% | Manual |
| 3 | 16 · 10 · 25% · $1,000 | **9.60** · per proposal 2.40 · 160 Connects · monthly 24.00 · 2.5 jobs · 0.96% | Manual |
| 4 | win rate 0% | Monthly cost shown; cost per job won hidden with "You haven't won a job at this rate yet", no crash | — |
| 5 | job value 0 | % of job value hidden, no crash | — |

## Extras
- Chart: none.
- Scenario compare: yes. Plan B = fewer, better proposals (for example 10 proposals at a 20% win rate).
- Share / Print / Embed: yes.

## Content notes
- FAQ: the 5 keyword-map questions + "How do I work out my win rate?" + "Do I get Connects back if a job is cancelled?"
- "Do Connects expire?" uses `expiryQuote` from `upwork-connects.json`: "Every Connect expires one year after the date it was issued."
- Tips: track your win rate monthly, apply early, skip jobs that already have many proposals, use the rate-increase tool once you win steadily.
