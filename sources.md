# sources.md — Official sources for every rate

Every file in `/rates/` must be listed here. Claude Code updates this file whenever a rate changes, and Puru approves.

| Rates file | What it covers | Official source URL | Effective from | Verified on | Check schedule |
|---|---|---|---|---|---|
| `rates/upwork-fees.json` | Upwork freelancer service fee range (0–15% per contract; the user enters their own %) | https://support.upwork.com/hc/en-us/articles/211062538-Learn-about-the-Freelancer-Service-Fee | 2026-11-18 | 2026-11-18 | Every 3 months |
| `rates/upwork-connects.json` | Price of one Upwork Connect (USD) + expiry (one year after issue) | https://support.upwork.com/hc/en-us/articles/211062898-About-Connects-costs-uses-balances-and-expiration | 2026-11-18 | 2026-11-18 | Every 3 months |
| `rates/stripe-us.json` | Stripe US card fees, manual entry, international cards + currency conversion | https://stripe.com/pricing?country=US | 2026-11-18 | 2026-11-18 | Every 3 months |
| `rates/stripe-gb.json` | Stripe UK card fees + currency conversion | https://stripe.com/gb/pricing | 2026-11-18 | 2026-11-18 | Every 3 months |
| `rates/stripe-ie.json` | Stripe Ireland card fees + currency conversion (used for EUR) | https://stripe.com/ie/pricing | 2026-11-18 | 2026-11-18 | Every 3 months |
| `rates/stripe-ca.json` | Stripe Canada card fees + currency conversion | https://stripe.com/ca/pricing | 2026-11-18 | 2026-11-18 | Every 3 months |
| `rates/stripe-au.json` | Stripe Australia card fees + currency conversion | https://stripe.com/au/pricing | 2026-11-18 | 2026-11-18 | Every 3 months |
| `rates/stripe-in.json` | Stripe India card fees + currency conversion | https://stripe.com/in/pricing | 2026-11-18 | 2026-11-18 | Every 3 months |

## Update calendar
| What | When to check |
|---|---|
| Payment / platform fees (PayPal, Wise, Payoneer, Stripe, Upwork, Fiverr) | Every 3 months (next: 2027-02-18) |
| Pure-maths tools (hourly rate, break-even, retainer, …) | No rates: no update needed |

No tax rates, government limits or legal thresholds are used (scope rule, CLAUDE.md).

## Notes
- **Stripe pages redirect by location.** `stripe.com/us/pricing` sends visitors outside the US to their own country's page. Use `https://stripe.com/pricing?country=US` for the US page, and check that the page shows the right country before you copy a line.
- **Stripe EUR uses Ireland's page.** Other euro-area countries may differ.
- **Upwork's fee is not fixed.** Upwork sets it per contract (0–15%). The tool uses the % the user types in; the 10% default is an example only.
- **Fiverr:** no official source yet, so there is no rates file. The tool asks the user for their fee % and doesn't publish one.

## How to update
1. Ask Claude Code: "Check every URL in sources.md and show what changed vs our /rates files. Quote the exact line for each change."
2. Open each URL yourself and confirm the numbers.
3. Approve. Claude Code updates the rates file, `verifiedOn`, tests and `lastUpdated` in the registry.
4. Run `npm run check`, then deploy.
